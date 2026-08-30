'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export async function createJobAction(data: any) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    return { error: 'Not authenticated.' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', authData.user.id)
    .single()

  if (userError || !userData?.organization_id) {
    return { error: 'No organization found.' }
  }

  const { error: insertError } = await supabase
    .from('jobs')
    .insert({
      organization_id: userData.organization_id,
      title: data.title,
      department: data.department,
      location: data.location,
      employment_type: data.employmentType,
      workplace_type: data.workplaceType,
      description: data.description,
      min_salary: data.minSalary ? parseFloat(data.minSalary) : null,
      max_salary: data.maxSalary ? parseFloat(data.maxSalary) : null,
      recruiter_id: authData.user.id,
      status: 'OPEN',
      opening_date: new Date().toISOString(),
    })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}

export async function generateJobDescriptionAction(data: {
  title: string
  department?: string
  location?: string
  employmentType?: string
  workplaceType?: string
}) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  
  if (!authData?.user) {
    return { error: 'Not authenticated' }
  }

  const prompt = `You are an expert HR recruiter. Generate a professional and comprehensive job description for the following position:
Job Title: ${data.title}
${data.department ? `Department: ${data.department}\n` : ''}${data.location ? `Location: ${data.location}\n` : ''}${data.employmentType ? `Employment Type: ${data.employmentType}\n` : ''}${data.workplaceType ? `Workplace Type: ${data.workplaceType}\n` : ''}

The job description should include:
- A brief company introduction placeholder [Company Name]
- Role overview
- Key responsibilities
- Requirements/Qualifications
- Benefits placeholder [Benefits]

Keep it concise, engaging, and well-structured with bullet points.`

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
    })

    return { description: text }
  } catch (error: any) {
    console.error('Error generating job description:', error)
    return { error: 'Failed to generate job description.' }
  }
}
