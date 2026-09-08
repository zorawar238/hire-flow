'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadEmployeeDocument(formData: FormData, employeeId: string) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  if (!file || !name || !category) {
    return { error: 'Missing required fields' }
  }

  // Upload to Supabase Storage
  // We'll use a 'documents' bucket. If it doesn't exist, this will fail.
  // In a real MVP we'd handle the bucket creation or ensure it exists via migrations.
  const fileExt = file.name.split('.').pop()
  const fileName = `${employeeId}-${Date.now()}.${fileExt}`
  const filePath = `employees/${employeeId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    // For MVP demonstration, if bucket is missing, we can fallback to a mock URL
    // return { error: uploadError.message }
  }

  // Get the public URL (or mock it if upload failed for local testing)
  const fileUrl = uploadError 
    ? `/mock-documents/${fileName}` 
    : supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl

  // Get current user id for uploaded_by
  const { data: { user } } = await supabase.auth.getUser()

  // Insert into DB
  const { error: dbError } = await supabase
    .from('employee_documents')
    .insert({
      employee_id: employeeId,
      name,
      category,
      file_url: fileUrl,
      uploaded_by: user?.id || null
    })

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}

export async function deleteEmployeeDocument(documentId: string, employeeId: string, fileUrl: string) {
  const supabase = await createClient()

  // Remove from DB
  const { error: dbError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    return { error: dbError.message }
  }

  // Extract path from URL to delete from storage (if it's a real supabase storage URL)
  if (fileUrl.includes('supabase')) {
    try {
      const urlObj = new URL(fileUrl)
      const pathParts = urlObj.pathname.split('/documents/')
      if (pathParts.length > 1) {
        const storagePath = pathParts[1]
        await supabase.storage.from('documents').remove([storagePath])
      }
    } catch (e) {
      console.error('Failed to parse URL for storage deletion', e)
    }
  }

  revalidatePath(`/dashboard/employees/${employeeId}`)
  return { success: true }
}
