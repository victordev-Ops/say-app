// components/BottomNavbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { Home, Inbox, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNavbar({ profileId }: { profileId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const pathname = usePathname()

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('confessions')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    if (profileId) fetchUnread()
  }, [profileId])

  // Real-time: new message → increase badge
  useEffect(() => {
    if (!profileId) return

    const channel = supabase
      .channel('new-confessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'confessions',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId])

  // Mark all as read when visiting /inbox
  useEffect(() => {
    if (pathname === '/inbox' && unreadCount > 0) {
      supabase
        .from('confessions')
        .update({ is_read: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)

      setUnreadCount(0)
    }
  }, [pathname, profileId, unreadCount])

  // Determine active states
  const isHomeActive = pathname === '/dashboard'
  const isInboxActive = pathname === '/inbox'
  const isSettingsActive = pathname === '/settings'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Home Icon */}
          <Link
            href="/dashboard"
            className={`p-3 rounded-xl transition-all ${
              isHomeActive
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Home size={28} strokeWidth={2.5} />
          </Link>

          {/* Inbox Icon (Center) */}
          <Link
            href="/inbox"
            className={`relative p-4 rounded-full transition-all ${
              isInboxActive
                ? 'bg-purple-100 text-purple-600 scale-110 shadow-lg'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Inbox size={32} strokeWidth={2.5} />

            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-6 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Settings Icon */}
          <Link
            href="/settings"
            className={`p-3 rounded-xl transition-all ${
              isSettingsActive
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Settings size={28} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
      }
