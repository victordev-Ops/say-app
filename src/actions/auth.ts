'use server'
import { supabaseServer } from '@/lib/supabase/server'

export async function signUp(email: string) {
  const supabase = await supabaseServer()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') // remove trailing slash if any

  if (!siteUrl) {
    throw new Error('Site URL not configured')
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  })

  if (error) {
    console.error('Supabase OTP error:', error)
    throw new Error(error.message || 'Failed to send magic link')
  }
      }
