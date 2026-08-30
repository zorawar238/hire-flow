'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


export async function updateCandidateStage(applicationId: string, newStage: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('candidate_applications')
    .update({ stage: newStage })
    .eq('id', applicationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function submitApplicationAction(formData: FormData, orgId: string, jobId: string) {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const location = formData.get('location') as string
  const currentCompany = formData.get('currentCompany') as string
  const currentDesignation = formData.get('currentDesignation') as string
  const totalExperience = formData.get('totalExperience') as string
  const expectedSalary = formData.get('expectedSalary') as string
  const noticePeriod = formData.get('noticePeriod') as string
  const resumeFile = formData.get('resume') as File

  if (!resumeFile) {
    return { error: 'Resume is required' }
  }

  // 1. Insert candidate
  const { data: candidateData, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      organization_id: orgId,
      full_name: fullName,
      email: email,
      phone: phone,
      location: location,
      current_company: currentCompany || null,
      current_designation: currentDesignation || null,
      total_experience: totalExperience ? parseFloat(totalExperience) : null,
      expected_salary: expectedSalary ? parseFloat(expectedSalary) : null,
      notice_period: noticePeriod ? parseInt(noticePeriod) : null,
      source: 'Careers Page',
    })
    .select('id')
    .single()

  if (candidateError) {
    return { error: candidateError.message }
  }

  // 2. Upload file to Supabase storage
  const fileExt = resumeFile.name.split('.').pop()
  const filePath = `${orgId}/${candidateData.id}-${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, resumeFile, {
      contentType: resumeFile.type,
      upsert: false,
    })

  // 3. Extract text from PDF
  let parsedText = ''
  let parsingStatus = 'PENDING'
  try {
    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdf = require('pdf-parse')
    const pdfData = await pdf(buffer)
    parsedText = pdfData.text
    parsingStatus = 'COMPLETED'
  } catch (error) {
    console.error('PDF parsing error:', error)
    parsingStatus = 'FAILED'
  }

  // 4. Save to resumes table
  await supabase.from('resumes').insert({
    candidate_id: candidateData.id,
    file_url: filePath,
    original_filename: resumeFile.name,
    parsed_text: parsedText,
    parsing_status: parsingStatus,
  })

  // 5. Add to candidate_applications
  const { error: pipelineError } = await supabase
    .from('candidate_applications')
    .insert({
      job_id: jobId,
      candidate_id: candidateData.id,
      stage: 'APPLIED',
    })

  if (pipelineError) {
    console.error("Pipeline insert error:", pipelineError)
    return { error: 'Application submitted but could not link to job.' }
  }

  return { success: true }
}
