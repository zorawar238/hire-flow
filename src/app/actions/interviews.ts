'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function scheduleInterviewAction(formData: FormData, applicationId: string) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const interviewerId = formData.get('interviewerId') as string
  const scheduledAt = formData.get('scheduledAt') as string
  const duration = parseInt(formData.get('duration') as string || '60')
  const meetingLink = formData.get('meetingLink') as string

  if (!title || !scheduledAt) {
    return { error: 'Title and scheduled time are required' }
  }

  const { error } = await supabase
    .from('interviews')
    .insert({
      application_id: applicationId,
      interviewer_id: interviewerId || null,
      title,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      meeting_link: meetingLink,
      status: 'SCHEDULED'
    })

  if (error) {
    console.error('Schedule interview error:', error)
    return { error: 'Failed to schedule interview' }
  }

  // Update application stage to INTERVIEW
  await supabase
    .from('candidate_applications')
    .update({ stage: 'INTERVIEW' })
    .eq('id', applicationId)

  revalidatePath(`/dashboard/applications/${applicationId}`)
  return { success: true }
}
