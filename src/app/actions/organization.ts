'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentUserRole(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role
}

export async function updateOrganizationDetails(orgId: string, data: any) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized: Only Organization Admins can update settings.' }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      website: data.website,
      industry: data.industry,
      size: data.size,
    })
    .eq('id', orgId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createDepartment(orgId: string, data: any) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized: Only Admins can manage departments.' }
  }

  const { error } = await supabase
    .from('departments')
    .insert({
      organization_id: orgId,
      name: data.name,
      head_id: data.head_id || null,
    })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function updateDepartment(id: string, data: any) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('departments')
    .update({
      name: data.name,
      head_id: data.head_id || null,
      status: data.status,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function archiveDepartment(id: string) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('departments')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function inviteTeamMember(orgId: string, data: any) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized: Only Admins can invite users.' }
  }

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabase
    .from('team_invitations')
    .insert({
      organization_id: orgId,
      email: data.email,
      role: data.role,
      token,
      expires_at: expiresAt.toISOString(),
    })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return { success: true, token }
}

export async function revokeInvitation(id: string) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') return { error: 'Unauthorized' }

  const { error } = await supabase.from('team_invitations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return { success: true }
}

export async function updateUserRole(userId: string, targetRole: string) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') return { error: 'Unauthorized' }

  const { error } = await supabase.from('users').update({ role: targetRole }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return { success: true }
}

export async function removeUser(userId: string) {
  const supabase = await createClient()
  const role = await getCurrentUserRole(supabase)
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') return { error: 'Unauthorized' }

  const { error } = await supabase.from('users').update({ status: 'INACTIVE' }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings/team')
  return { success: true }
}
