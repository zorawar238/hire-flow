import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function JobsPage() {
  const supabase = await createClient()

  // Get current user to find their organization
  const { data: authData } = await supabase.auth.getUser()
  let jobs: any[] = []
  
  if (authData?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', authData.user.id)
      .single()

    if (userData?.organization_id) {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('created_at', { ascending: false })
      
      jobs = data || []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <Link href="/dashboard/jobs/new" className={buttonVariants()}>Create Job</Link>
      </div>
      
      {jobs.length === 0 ? (
        <div className="border rounded-md p-8 text-center text-gray-500 bg-white">
          No jobs found. Create your first job opening to get started.
        </div>
      ) : (
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <Link href={`/jobs/${job.id}`} className="hover:underline text-blue-600">
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.employment_type}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'OPEN' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/jobs/${job.id}/pipeline`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      View Pipeline
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
