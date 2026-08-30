import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EmployeeView from './employee-view'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the employee along with related data
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select(`
      *,
      candidates (*),
      separations (
        *,
        offboarding_tasks (*)
      ),
      performance_goals (*),
      performance_reviews (*),
      employee_feedback (*),
      meeting_notes (*),
      career_paths (*)
    `)
    .eq('id', id)
    .single()

  if (empError || !employee) {
    notFound()
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <EmployeeView employee={employee} />
    </div>
  )
}
