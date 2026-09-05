'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStatsAction() {
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

  // Get jobs for this org
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('organization_id', orgId)

  const jobIds = jobs?.map(j => j.id) || []

  // 1. Total Open Jobs
  const { count: openJobsCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'OPEN')

  // 2. New Applicants (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: newApplicantsCount } = await supabase
    .from('candidate_applications')
    .select('id', { count: 'exact', head: true })
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('created_at', sevenDaysAgo.toISOString())

  // 3. Interviews Scheduled
  const { data: applications } = await supabase
    .from('candidate_applications')
    .select('id, stage')
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])

  const appIds = applications?.map(a => a.id) || []

  const { count: scheduledInterviewsCount } = await supabase
    .from('interviews')
    .select('id', { count: 'exact', head: true })
    .in('application_id', appIds.length > 0 ? appIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('status', 'SCHEDULED')

  // 4. Offers Sent
  const { count: offersSentCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .in('application_id', appIds.length > 0 ? appIds : ['00000000-0000-0000-0000-000000000000'])
    .in('status', ['SENT', 'ACCEPTED'])

  // Pipeline metrics
  let applied = 0, screening = 0, interview = 0, offer = 0
  applications?.forEach(app => {
    if (['APPLIED', 'AI_REVIEWED', 'RECRUITER_REVIEW'].includes(app.stage)) applied++
    if (['SHORTLISTED', 'SCREENING_CALL'].includes(app.stage)) screening++
    if (['INTERVIEW'].includes(app.stage)) interview++
    if (['OFFER_APPROVAL', 'OFFER_SENT', 'OFFER_ACCEPTED'].includes(app.stage)) offer++
  })

  // Recent Activity
  const { data: recentApps } = await supabase
    .from('candidate_applications')
    .select(`
      id,
      created_at,
      stage,
      candidates (full_name),
      jobs (title)
    `)
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
    .limit(5)

  const recentActivity = recentApps?.map((app: any) => ({
    id: app.id,
    user: app.candidates?.full_name || 'Unknown Candidate',
    action: 'applied for', 
    target: app.jobs?.title || 'Unknown Job',
    time: new Date(app.created_at).toLocaleDateString(),
    avatar: (app.candidates?.full_name || 'U C').substring(0, 2).toUpperCase()
  })) || []

  return {
    success: true,
    data: {
      openJobs: openJobsCount || 0,
      newApplicants: newApplicantsCount || 0,
      scheduledInterviews: scheduledInterviewsCount || 0,
      offersSent: offersSentCount || 0,
      pipeline: {
        applied,
        screening,
        interview,
        offer,
        total: applications?.length || 0
      },
      recentActivity
    }
  }
}
