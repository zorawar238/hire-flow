'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function initiateSeparationAction(formData: FormData, employeeId: string) {
  const supabase = await createClient()

  const type = formData.get('type') as string
  const reason = formData.get('reason') as string
  const lastWorkingDay = formData.get('lastWorkingDay') as string

  if (!type || !lastWorkingDay) {
    return { error: 'Type and Last Working Day are required' }
  }

  const { error } = await supabase
    .from('separations')
    .insert({
      employee_id: employeeId,
      type,
      reason,
      last_working_day: lastWorkingDay,
      status: 'PENDING'
    })

  if (error) {
    console.error('Initiate separation error:', error)
    return { error: 'Failed to initiate separation' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function createOffboardingTaskAction(formData: FormData, separationId: string, employeeId: string) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const dueDate = formData.get('dueDate') as string

  if (!title) {
    return { error: 'Task title is required' }
  }

  const { error } = await supabase
    .from('offboarding_tasks')
    .insert({
      separation_id: separationId,
      title,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      status: 'PENDING',
      type: 'INTERNAL'
    })

  if (error) {
    console.error('Create offboarding task error:', error)
    return { error: 'Failed to create task' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function finalizeSeparationAction(separationId: string, employeeId: string) {
  const supabase = await createClient()

  // Mark separation as completed
  const { error: sepError } = await supabase
    .from('separations')
    .update({ status: 'COMPLETED' })
    .eq('id', separationId)

  if (sepError) {
    console.error('Finalize separation error:', sepError)
    return { error: 'Failed to finalize separation' }
  }

  // Update employee status to SEPARATED
  const { error: empError } = await supabase
    .from('employees')
    .update({ status: 'SEPARATED' })
    .eq('id', employeeId)

  if (empError) {
    console.error('Update employee status error:', empError)
    return { error: 'Failed to update employee status' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}
