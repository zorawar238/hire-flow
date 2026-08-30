import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

  // If user is not logged in and trying to access protected route, redirect to login
  if (!user && (isDashboardRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in
  if (user) {
    // Check if they have an organization
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const hasOrg = !!profile?.organization_id

    // If they have no org and are trying to access dashboard, redirect to onboarding
    if (!hasOrg && isDashboardRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If they have an org and are on auth or onboarding pages, redirect to dashboard
    if (hasOrg && (isAuthRoute || isOnboardingRoute)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If they have no org but are on auth pages, redirect to onboarding
    if (!hasOrg && isAuthRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
