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

export async function getInterviewsAction() {
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

  const orgId = userData.organization_id

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      id,
      title,
      scheduled_at,
      duration_minutes,
      meeting_link,
      status,
      candidate_applications!inner (
        jobs!inner ( organization_id, title ),
        candidates ( full_name )
      ),
      users ( name )
    `)
    .eq('candidate_applications.jobs.organization_id', orgId)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching interviews:', error)
    return { error: 'Failed to fetch interviews.' }
  }

  const formattedInterviews = interviews?.map((interview: any) => ({
    id: interview.id,
    title: interview.title,
    scheduledAt: interview.scheduled_at,
    duration: interview.duration_minutes,
    meetingLink: interview.meeting_link,
    status: interview.status,
    candidateName: interview.candidate_applications?.candidates?.full_name || 'Unknown Candidate',
    jobTitle: interview.candidate_applications?.jobs?.title || 'Unknown Job',
    interviewerName: interview.users?.name || 'Unassigned'
  }))

  return { success: true, data: formattedInterviews }
}
