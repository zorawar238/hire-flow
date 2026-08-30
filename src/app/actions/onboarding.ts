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

  // 2. Update User Profile
  const { error: userError } = await supabase
    .from('users')
    .update({
      organization_id: orgData.id,
      role: 'ORG_ADMIN',
    })
    .eq('id', authData.user.id)

  if (userError) {
    return { error: userError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
