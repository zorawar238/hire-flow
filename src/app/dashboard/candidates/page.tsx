import { createClient } from '@/lib/supabase/server'
import KanbanBoard from './KanbanBoard'

export default async function CandidatesPage() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  let applications: any[] = []
  
  if (authData?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', authData.user.id)
      .single()

    if (userData?.organization_id) {
      const { data: orgJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('organization_id', userData.organization_id)

      if (orgJobs && orgJobs.length > 0) {
        const jobIds = orgJobs.map(j => j.id)
        const { data: apps } = await supabase
          .from('candidate_applications')
          .select(`
            *,
            candidates (*),
            jobs (title)
          `)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })

        applications = apps || []
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Candidates Pipeline</h2>
      </div>
      
      {applications.length === 0 ? (
        <div className="border rounded-md p-8 text-center text-gray-500 bg-white">
          No candidates found.
        </div>
      ) : (
        <KanbanBoard initialApplications={applications} />
      )}
    </div>
  )
}
