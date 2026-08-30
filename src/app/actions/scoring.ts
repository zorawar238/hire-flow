'use server'

import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export async function generateFitScoreAction(candidateId: string, jobId: string) {
  const supabase = await createClient()

  // Fetch job description
  const { data: jobData } = await supabase
    .from('jobs')
    .select('title, description')
    .eq('id', jobId)
    .single()

  if (!jobData) {
    return { error: 'Job not found' }
  }

  // Fetch parsed resume text
  const { data: resumeData } = await supabase
    .from('resumes')
    .select('parsed_text')
    .eq('candidate_id', candidateId)
    .single()

  if (!resumeData || !resumeData.parsed_text) {
    return { error: 'Resume text not found or not parsed yet' }
  }

  const prompt = `You are an expert HR recruiter evaluating a candidate for a role.
Job Title: ${jobData.title}
Job Description & Requirements:
${jobData.description}

---
Candidate's Resume Text:
${resumeData.parsed_text}

---
Please evaluate the candidate's resume against the job description. Provide a Fit Score out of 100, and list their strengths, any missing information, and potential concerns based on the requirements.
`

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        score: z.number().describe('A score from 0 to 100 indicating how well the candidate matches the job.'),
        strengths: z.array(z.string()).describe('List of key strengths and matching requirements found in the resume.'),
        missing_info: z.array(z.string()).describe('List of requirements or expected information that is completely missing from the resume.'),
        concerns: z.array(z.string()).describe('Potential gaps or concerns based on the candidate\'s experience vs the job requirements.'),
      }),
      prompt: prompt,
    })

    // Save the fit score to candidate_applications
    const { error: updateError } = await supabase
      .from('candidate_applications')
      .update({
        fit_score: object.score,
        fit_explanation: object,
      })
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      
    if (updateError) {
      console.error('Failed to update candidate application:', updateError)
    }

    return { success: true, evaluation: object }
  } catch (error: any) {
    console.error('Error generating fit score:', error)
    return { error: 'Failed to generate fit score' }
  }
}
