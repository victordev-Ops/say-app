// app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') // 'signup' or 'email' or 'magiclink' etc.

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', req.url))
  }

  // Start with dashboard as target (we'll adjust if needed)
  let redirectTo = '/dashboard'

  const response = NextResponse.redirect(new URL(redirectTo, req.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  // Critical: Use the actual `type` from the URL
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any, // Supabase types are limited, but it accepts string
  })

  if (error || !data.user) {
    console.error('OTP verification failed:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
  }

  // Now check for profile to decide final redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    redirectTo = '/auth/setup' // New user → setup username
  }
  // Else: returning user → stay on /dashboard

  // Update the redirect location
  response.headers.set('Location', new URL(redirectTo, req.url).toString())

  return response
                                 }
