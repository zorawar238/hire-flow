import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ApplicationForm from "./ApplicationForm"

export default async function PublicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch job and related organization name
  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      organizations ( name )
    `)
    .eq('id', id)
    .single()

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-500 mt-2">{job.organizations?.name}</p>
            </div>
            <Button>Apply Now</Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline">{job.department}</Badge>
            <Badge variant="outline">{job.location}</Badge>
            <Badge variant="outline">{job.workplace_type}</Badge>
            <Badge variant="outline">{job.employment_type}</Badge>
          </div>
        </div>
        <div className="p-8 prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div className="whitespace-pre-wrap text-gray-700">{job.description}</div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <ApplicationForm jobId={job.id} orgId={job.organization_id} />
      </div>
    </div>
  )
}
