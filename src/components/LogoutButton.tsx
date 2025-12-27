// components/LogoutButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      alert('Failed to log out')
    } else {
      // Optional: soft refresh to update server-rendered parts
      router.refresh()
      // Or redirect if you want: router.push('/')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-secondary text-sm"
    >
      Log out
    </button>
  )
      }
