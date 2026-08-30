'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToJobAction(formData: FormData) {
  const supabase = await createClient()

  const jobId = formData.get('jobId') as string
  const orgId = formData.get('orgId') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const resumeFile = formData.get('resume') as File

  if (!jobId || !orgId || !fullName || !email || !resumeFile || resumeFile.size === 0) {
    return { error: 'Missing required fields' }
  }

  // 1. Upload Resume
  const fileExt = resumeFile.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${orgId}/${jobId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, resumeFile)

  if (uploadError) {
    return { error: `Failed to upload resume: ${uploadError.message}` }
  }

  // 2. Insert Candidate
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      organization_id: orgId,
      full_name: fullName,
      email,
      phone,
      source: 'Public Job Page',
    })
    .select('id')
    .single()

  if (candidateError) {
    return { error: candidateError.message }
  }

  // 3. Insert Resume Record
  await supabase
    .from('resumes')
    .insert({
      candidate_id: candidate.id,
      file_url: uploadData.path,
      original_filename: resumeFile.name,
    })

  // 4. Insert Candidate Application (with Mock AI Score)
  const mockScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65 // Random between 65 and 95
  
  const { error: appError } = await supabase
    .from('candidate_applications')
    .insert({
      candidate_id: candidate.id,
      job_id: jobId,
      stage: 'APPLIED',
      fit_score: mockScore,
    })

  if (appError) {
    return { error: appError.message }
  }

  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}
