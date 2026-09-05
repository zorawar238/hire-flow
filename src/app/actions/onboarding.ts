'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrganizationAction(data: any) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authData?.user) {
    return { error: 'Not authenticated.' }
  }

  // 1. Create Organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.companyName,
      industry: data.industry,
    })
    .select('id')
    .single()

  if (orgError) {
    return { error: orgError.message }
  }

  // 2. Upsert User Profile
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: authData.user.id,
      email: authData.user.email!,
      name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
      organization_id: orgData.id,
      role: 'ORG_ADMIN',
    })

  if (userError) {
    return { error: userError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
