// app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Default fallback redirects
  let redirectTo = '/dashboard' // We'll decide final destination below

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', req.url))
  }

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

  // Verify the magic link / OTP
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'email',
  })

  if (error || !data.user) {
    console.error('OTP verification failed:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
  }

  // Successfully authenticated!
  // Now check if user has a profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile check error:', profileError)
    // Optional: fallback to setup if DB error
    redirectTo = '/auth/setup'
  } else if (!profile) {
    // No profile → new user → send to username setup
    redirectTo = '/auth/setup'
  } else {
    // Profile exists → returning user → go straight to dashboard
    redirectTo = '/dashboard'
  }

  // Update redirect with final destination
  response.headers.set('Location', new URL(redirectTo, req.url).toString())

  return response
        }
