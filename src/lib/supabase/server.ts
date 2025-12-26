import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const supabaseServer = async () => {
  // Await cookies() in server components
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? undefined,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.delete(name, options),
      },
    }
  )
}
