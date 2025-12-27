// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Start with a response that passes through the request
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update incoming request cookies (for Supabase internal use)
            request.cookies.set(name, value)
            // Update outgoing response cookies (for browser)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the auth session (this updates cookies if needed)
  // This is important for SSR pages like /dashboard to have access to the current user
  await supabase.auth.getUser()

  // No protection needed: /dashboard is public
  // Simply return the response
  return response
}

export const config = {
  matcher: [
    // Run middleware on:
    // - Dashboard and its subpaths (to ensure session is available for SSR)
    // - All other page routes (for consistent session handling)
    // - Exclude static files, API routes, etc.
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
      }
