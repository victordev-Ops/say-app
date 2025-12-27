// app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') // Dynamic: 'email', 'signup', etc.

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', req.url))
  }

  // Temporary redirect response (we'll update location later)
  let redirectTo = '/dashboard' // Default for returning users
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

  // Use the dynamic type from the magic link
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any, // Allows 'email', 'signup', 'magiclink', etc.
  })

  if (error || !data.user) {
    console.error('Magic link verification failed:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
  }

  // Session successfully set via cookies!

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    redirectTo = '/auth/setup' // New user only
  }

  // Final redirect
  response.headers.set('Location', new URL(redirectTo, req.url).toString())
  return response
}
