import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApplyForm from './apply-form'

export default async function JobPage({ params }: { params: Promise<{ org_id: string, job_id: string }> }) {
  const { org_id, job_id } = await params
  const supabase = await createClient()

  // Fetch organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', org_id)
    .single()

  if (!orgData) {
    notFound()
  }

  // Fetch job
  const { data: jobData } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', job_id)
    .eq('organization_id', org_id)
    .single()

  if (!jobData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-5xl">
          <h1 className="text-xl font-bold">{orgData.name} Careers</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">{jobData.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                <span>{jobData.location}</span>
                <span>&bull;</span>
                <span>{jobData.employment_type}</span>
                <span>&bull;</span>
                <span>{jobData.workplace_type}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Job Description</h3>
              <div className="whitespace-pre-wrap text-gray-700">{jobData.description}</div>
            </div>
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Apply for this Job</CardTitle>
                <CardDescription>Submit your application for {jobData.title} at {orgData.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ApplyForm orgId={org_id} jobId={job_id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
