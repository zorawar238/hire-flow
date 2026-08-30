import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import KanbanBoard from './kanban-board'

export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Fetch applications with candidate details
  const { data: applications, error: appError } = await supabase
    .from('candidate_applications')
    .select(`
      *,
      candidates:candidate_id (
        id,
        full_name,
        email,
        current_company,
        current_designation,
        total_experience
      )
    `)
    .eq('job_id', id)

  if (appError) {
    console.error("Error fetching applications:", appError)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{job.title} - Pipeline</h2>
          <p className="text-muted-foreground">Manage candidates for this role</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard applications={applications || []} jobId={id} />
      </div>
    </div>
  )
}
