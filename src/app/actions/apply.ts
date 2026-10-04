'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export async function applyToJobAction(formData: FormData) {
  // Use the Service Role Key to bypass RLS for public form submissions
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const jobId = formData.get('jobId') as string
  const orgId = formData.get('orgId') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const resumeFile = formData.get('resume') as File

  if (!jobId || !orgId || !fullName || !email || !resumeFile || resumeFile.size === 0) {
    return { error: 'Missing required fields' }
  }

  // 1. Fetch Job Description for AI Analysis
  const { data: job } = await supabase
    .from('jobs')
    .select('title, description')
    .eq('id', jobId)
    .single()

  const jobContext = job
    ? `Job Title: ${job.title}\nJob Description: ${job.description}`
    : 'No job description provided.'

  // 2. Read the file
  const arrayBuffer = await resumeFile.arrayBuffer()
  const fileBytes = Buffer.from(arrayBuffer)

  let parsedText = 'No resume text available.'
  let isPdf = resumeFile.type === 'application/pdf' || resumeFile.name.toLowerCase().endsWith('.pdf')
  
  // 3. If it's a Word Doc, parse it with Mammoth first
  if (!isPdf) {
    try {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer: fileBytes })
      if (result.value && result.value.trim().length > 0) {
        parsedText = result.value
      }
    } catch (err) {
      console.error('Failed to parse Word Document:', err)
    }
  }

  // 4. Use Gemini Vision to read PDF (or analyze Word text)
  let aiAnalysis: any = {
    totalExperience: 0,
    expectedSalary: null,
    noticePeriod: null,
    location: 'Unknown',
    fitScore: 65,
    fitExplanation: { strengths: [], missing_info: [], concerns: [] },
  }

  try {
    const aiSchema = z.object({
      resumeText: z
        .string()
        .describe('Full extracted text content of the resume, preserving all details.'),
      totalExperience: z
        .number()
        .describe('Total years of professional experience. Default to 0 if not found.'),
      expectedSalary: z
        .number()
        .nullable()
        .describe('Expected salary as a number if mentioned, otherwise null.'),
      noticePeriod: z
        .number()
        .nullable()
        .describe('Notice period in days if mentioned, otherwise null.'),
      location: z.string().describe('Current city/location of the candidate.'),
      fitScore: z
        .number()
        .min(0)
        .max(100)
        .describe('Score from 0-100 on how well the candidate matches the job requirements.'),
      fitExplanation: z.object({
        strengths: z
          .array(z.string())
          .describe("Candidate's key strengths that match the job requirements."),
        missing_info: z
          .array(z.string())
          .describe('Required skills or qualifications missing from resume.'),
        concerns: z
          .array(z.string())
          .describe('Concerns or gaps about the candidate for this role.'),
      }),
    })

    let aiMessages: any[] = []

    if (isPdf) {
      // Send PDF to Gemini Vision
      const base64Pdf = fileBytes.toString('base64')
      aiMessages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert HR recruiter. Read this resume PDF carefully and:\n1. Extract the full text from the resume\n2. Analyze the candidate against the job requirements below\n3. Provide a structured assessment\n\n${jobContext}`,
            },
            {
              type: 'file',
              data: base64Pdf,
              mimeType: 'application/pdf',
            },
          ],
        },
      ]
    } else {
      // Send extracted Word Text to Gemini Text
      aiMessages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert HR recruiter. Read this resume text carefully and:\n1. Re-output the full text cleanly\n2. Analyze the candidate against the job requirements below\n3. Provide a structured assessment\n\nJob Context:\n${jobContext}\n\nResume Text:\n${parsedText.substring(0, 20000)}`,
            }
          ],
        },
      ]
    }

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      schema: aiSchema,
      messages: aiMessages,
    })

    if (object.resumeText) {
      parsedText = object.resumeText
    }
    
    aiAnalysis = {
      totalExperience: object.totalExperience,
      expectedSalary: object.expectedSalary,
      noticePeriod: object.noticePeriod,
      location: object.location,
      fitScore: object.fitScore,
      fitExplanation: object.fitExplanation,
    }
  } catch (err) {
    console.error('Failed to analyze resume with Gemini:', err)
  }

  // 5. Upload Resume File to Storage
  const fileExt = resumeFile.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${orgId}/${jobId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, resumeFile)

  if (uploadError) {
    return { error: `Failed to upload resume: ${uploadError.message}` }
  }

  // 6. Insert Candidate with AI-extracted details
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      organization_id: orgId,
      full_name: fullName,
      email,
      phone,
      source: 'Public Job Page',
      location: aiAnalysis.location,
      total_experience: aiAnalysis.totalExperience,
      expected_salary: aiAnalysis.expectedSalary,
      notice_period: aiAnalysis.noticePeriod,
    })
    .select('id')
    .single()

  if (candidateError) {
    return { error: candidateError.message }
  }

  // 7. Insert Resume Record with parsed text
  await supabase.from('resumes').insert({
    candidate_id: candidate.id,
    file_url: uploadData.path,
    original_filename: resumeFile.name,
    parsed_text: parsedText,
  })

  // 8. Insert Application with real AI score
  const { error: appError } = await supabase.from('candidate_applications').insert({
    candidate_id: candidate.id,
    job_id: jobId,
    stage: 'APPLIED',
    fit_score: aiAnalysis.fitScore,
    fit_explanation: aiAnalysis.fitExplanation,
  })

  if (appError) {
    return { error: appError.message }
  }

  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}
