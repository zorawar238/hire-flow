import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // BYPASS LOGIN FOR DEVELOPMENT
  supabase.auth.getUser = async () => {
    return {
      data: {
        user: {
          id: 'e9863b99-0871-4c4d-a812-81a15573fc9a',
          email: 'nishantkr238@gmail.com',
          role: 'authenticated',
          aud: 'authenticated',
        },
      },
      error: null,
    } as any
  }

  return supabase
}
