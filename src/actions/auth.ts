'use server'
import { supabaseServer } from '@/lib/supabase/server'

export async function signUp(email: string) {
  const supabase = await supabaseServer()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) throw new Error(error.message)
}
