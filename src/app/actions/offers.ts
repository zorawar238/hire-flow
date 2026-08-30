'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOfferAction(formData: FormData, applicationId: string) {
  const supabase = await createClient()

  const baseSalary = parseFloat(formData.get('baseSalary') as string)
  const currency = formData.get('currency') as string || 'USD'
  const equityDetails = formData.get('equityDetails') as string
  const startDate = formData.get('startDate') as string

  if (!baseSalary) {
    return { error: 'Base salary is required' }
  }

  const { error } = await supabase
    .from('offers')
    .insert({
      application_id: applicationId,
      base_salary: baseSalary,
      currency,
      equity_details: equityDetails || null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      status: 'SENT'
    })

  if (error) {
    console.error('Create offer error:', error)
    return { error: 'Failed to create offer' }
  }

  // Update application stage to OFFER_SENT
  await supabase
    .from('candidate_applications')
    .update({ stage: 'OFFER_SENT' })
    .eq('id', applicationId)

  revalidatePath(`/dashboard/applications/${applicationId}`)
  return { success: true }
}
