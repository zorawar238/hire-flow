import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      *,
      candidates (full_name, email, phone)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground mt-1">Manage your organization's workforce and separations.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border rounded-md mt-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No employees found. Hire candidates from the pipeline to see them here.
                    </td>
                  </tr>
                ) : (
                  employees?.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">
                        <Link href={`/dashboard/employees/${emp.id}`} className="hover:underline">
                          {emp.candidates?.full_name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.candidates?.email || 'N/A'}</td>
                      <td className="px-4 py-3">{emp.department}</td>
                      <td className="px-4 py-3">{emp.designation}</td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.status === 'ACTIVE' ? 'default' : emp.status === 'SEPARATED' ? 'destructive' : 'secondary'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/dashboard/employees/${emp.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
