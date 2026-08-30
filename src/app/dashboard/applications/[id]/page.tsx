import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ApplicationView from './application-view'

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the candidate application along with related data
  const { data: application, error: appError } = await supabase
    .from('candidate_applications')
    .select(`
      *,
      candidates (*),
      jobs (id, title, department, location, organization_id),
      interviews (*),
      offers (*),
      onboarding_tasks (*),
      candidate_documents (*)
    `)
    .eq('id', id)
    .single()

  if (appError || !application) {
    notFound()
  }

  // Also fetch the resume text
  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('candidate_id', application.candidate_id)
    .single()

  // Fetch users for interviewers dropdown
  const { data: users } = await supabase
    .from('users')
    .select('id, name')

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ApplicationView 
        application={application} 
        resume={resume} 
        users={users || []} 
      />
    </div>
  )
}
