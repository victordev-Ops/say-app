// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)  // For internal Supabase logic
            response.cookies.set(name, value, options)  // For browser
          })
        },
      },
    }
  )

  // Refresh session / get user
  await supabase.auth.getUser()

  // Protection logic
  if (!supabase.auth.getUser().then(({ data }) => data.user) && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    // Run on all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
              }
