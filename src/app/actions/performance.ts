'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGoalAction(formData: FormData, employeeId: string) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dueDate = formData.get('dueDate') as string

  if (!title) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('performance_goals')
    .insert({
      employee_id: employeeId,
      title,
      description,
      status: 'NOT_STARTED',
      progress: 0,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })

  if (error) {
    console.error('Create goal error:', error)
    return { error: 'Failed to create goal' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function updateGoalProgressAction(goalId: string, progress: number, employeeId: string) {
  const supabase = await createClient()

  let status = 'IN_PROGRESS'
  if (progress === 100) status = 'COMPLETED'
  if (progress === 0) status = 'NOT_STARTED'

  const { error } = await supabase
    .from('performance_goals')
    .update({ progress, status })
    .eq('id', goalId)

  if (error) {
    console.error('Update goal progress error:', error)
    return { error: 'Failed to update goal progress' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function submitReviewAction(formData: FormData, employeeId: string, reviewerId: string) {
  const supabase = await createClient()

  const cycleName = formData.get('cycleName') as string
  const ratingStr = formData.get('rating') as string
  const comments = formData.get('comments') as string

  if (!ratingStr) {
    return { error: 'Rating is required' }
  }

  const rating = parseInt(ratingStr, 10)

  const { error } = await supabase
    .from('performance_reviews')
    .insert({
      employee_id: employeeId,
      reviewer_id: reviewerId,
      cycle_name: cycleName,
      rating,
      comments,
      status: 'SUBMITTED',
    })

  if (error) {
    console.error('Submit review error:', error)
    return { error: 'Failed to submit review' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function addFeedbackAction(formData: FormData, employeeId: string, providerId: string) {
  const supabase = await createClient()

  const type = formData.get('type') as string || 'CONTINUOUS'
  const content = formData.get('content') as string

  if (!content) {
    return { error: 'Feedback content is required' }
  }

  const { error } = await supabase
    .from('employee_feedback')
    .insert({
      employee_id: employeeId,
      provider_id: providerId,
      type,
      content,
    })

  if (error) {
    console.error('Add feedback error:', error)
    return { error: 'Failed to add feedback' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function saveMeetingNoteAction(formData: FormData, employeeId: string, managerId: string) {
  const supabase = await createClient()

  const meetingDate = formData.get('meetingDate') as string
  const notes = formData.get('notes') as string
  
  if (!meetingDate) {
    return { error: 'Meeting date is required' }
  }

  const { error } = await supabase
    .from('meeting_notes')
    .insert({
      employee_id: employeeId,
      manager_id: managerId,
      meeting_date: new Date(meetingDate).toISOString(),
      notes,
      action_items: [],
    })

  if (error) {
    console.error('Save meeting note error:', error)
    return { error: 'Failed to save meeting note' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function saveCareerPathAction(formData: FormData, employeeId: string) {
  const supabase = await createClient()

  const currentRole = formData.get('currentRole') as string
  const targetRole = formData.get('targetRole') as string
  const targetDate = formData.get('targetDate') as string
  
  if (!currentRole || !targetRole) {
    return { error: 'Current and target roles are required' }
  }

  const { error } = await supabase
    .from('career_paths')
    .insert({
      employee_id: employeeId,
      current_role: currentRole,
      target_role: targetRole,
      skills_needed: [],
      target_date: targetDate ? new Date(targetDate).toISOString() : null,
    })

  if (error) {
    console.error('Save career path error:', error)
    return { error: 'Failed to save career path' }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}
