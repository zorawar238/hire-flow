'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrganizationDetails(orgId: string, data: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      logo_url: data.logo_url,
      industry: data.industry,
      size: data.size,
      website: data.website,
      address: data.address,
      country: data.country,
      timezone: data.timezone,
      currency: data.currency,
    })
    .eq('id', orgId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createDepartment(orgId: string, data: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('departments')
    .insert({
      organization_id: orgId,
      name: data.name,
      head_id: data.head_id || null,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function updateDepartment(id: string, data: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('departments')
    .update({
      name: data.name,
      head_id: data.head_id || null,
      status: data.status,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function archiveDepartment(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('departments')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/departments')
  return { success: true }
}

export async function inviteTeamMember(orgId: string, data: any) {
  const supabase = await createClient()

  // Generate a mock secure token (In production, use crypto.randomBytes)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

  const { error } = await supabase
    .from('team_invitations')
    .insert({
      organization_id: orgId,
      email: data.email,
      role: data.role,
      token,
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/team')
  return { success: true, token }
}

export async function revokeInvitation(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/team')
  return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/team')
  return { success: true }
}

export async function removeUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ status: 'INACTIVE' })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings/team')
  return { success: true }
}
