'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPreboardingTaskAction(formData: FormData, applicationId: string) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const dueDate = formData.get('dueDate') as string

  if (!title) {
    return { error: 'Task title is required' }
  }

  const { error } = await supabase
    .from('onboarding_tasks')
    .insert({
      application_id: applicationId,
      title,
      type,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      status: 'PENDING'
    })

  if (error) {
    console.error('Create task error:', error)
    return { error: 'Failed to create task' }
  }

  revalidatePath(`/dashboard/applications/${applicationId}`)
  return { success: true }
}

export async function convertToEmployeeAction(applicationId: string, candidateId: string, orgId: string) {
  const supabase = await createClient()

  // First check if already an employee
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('candidate_id', candidateId)
    .single()

  if (existing) {
    return { error: 'Candidate is already converted to an employee.' }
  }

  // Fetch candidate details to carry over
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (!candidate) return { error: 'Candidate not found.' }

  // Create employee record
  const { error: employeeError } = await supabase
    .from('employees')
    .insert({
      organization_id: orgId,
      candidate_id: candidateId,
      department: 'TBD',
      designation: candidate.current_designation || 'TBD',
      joining_date: new Date().toISOString(),
      status: 'ACTIVE'
    })

  if (employeeError) {
    console.error('Convert employee error:', employeeError)
    return { error: 'Failed to create employee record' }
  }

  // Update application stage to JOINED
  await supabase
    .from('candidate_applications')
    .update({ stage: 'JOINED' })
    .eq('id', applicationId)

  revalidatePath(`/dashboard/applications/${applicationId}`)
  return { success: true }
}
