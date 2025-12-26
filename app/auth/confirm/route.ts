// app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth/setup'  // Redirect to username setup page

  // Build redirect URL
  let redirectUrl = new URL(next, req.url)
  redirectUrl.searchParams.delete('token_hash')
  redirectUrl.searchParams.delete('type')
  redirectUrl.searchParams.delete('next')

  if (!token_hash || !type) {
    redirectUrl = new URL('/signup?error=invalid_link', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Create response for cookie handling
  const response = NextResponse.redirect(redirectUrl)

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

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'email',  // Force 'email' – safest for modern flows
  })

  if (error) {
    console.error('Verify OTP error:', error)  // Log for debugging
    redirectUrl = new URL('/signup?error=auth_failed', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Success → session cookies are now set in response
  return response
}
