'use client'

import { useEffect, useRef } from 'react'
import { Home, Inbox, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function BottomNavbar({ profileId }: { profileId: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const unreadCountRef = useRef(0)
  const hasNewMessage = useRef(false)

  // Determine active tab
  const isHomeActive = pathname === '/dashboard'
  const isInboxActive = pathname === '/inbox'
  const isSettingsActive = pathname === '/settings'

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('confessions')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)

      unreadCountRef.current = count || 0
      hasNewMessage.current = count > 0
    }

    if (profileId) fetchUnread()
  }, [profileId, supabase])

  // Real-time listener for new confessions
  useEffect(() => {
    if (!profileId) return

    const channel = supabase
      .channel(`confessions-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'confessions',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          unreadCountRef.current += 1
          hasNewMessage.current = true
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, supabase, router])

  // Mark all as read when inbox is visited
  useEffect(() => {
    if (isInboxActive && unreadCountRef.current > 0) {
      unreadCountRef.current = 0
      hasNewMessage.current = false

      supabase
        .from('confessions')
        .update({ is_read: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)
        .then(() => router.refresh())
    }
  }, [isInboxActive, profileId, supabase, router])

  const unreadCount = unreadCountRef.current

  const tabClass = (isActive: boolean) =>
    `group relative flex flex-col items-center gap-1 p-4 rounded-2xl transition-all duration-200 ${
      isActive
        ? 'text-purple-600'
        : 'text-gray-500 hover:text-purple-600'
    }`

  const iconClass = "group-active:scale-90 transition-transform"

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-3 z-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-around items-center">
          {/* Home */}
          <Link
            href="/dashboard"
            prefetch={true}
            className={tabClass(isHomeActive)}
            onClick={(e) => isHomeActive && e.preventDefault()}
          >
            <Home size={26} strokeWidth={2.5} className={iconClass} />
            <span className="text-xs font-medium">Home</span>
            {isHomeActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-full" />
            )}
          </Link>

          {/* Inbox */}
          <Link
            href="/inbox"
            prefetch={true}
            className={tabClass(isInboxActive)}
            onClick={(e) => isInboxActive && e.preventDefault()}
          >
            <div className="relative">
              <Inbox size={26} strokeWidth={2.5} className={iconClass} />
              {/* Unread badge */}
              {unreadCount > 0 && (
                <span
                  className={`absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg transition-all ${
                    hasNewMessage.current ? 'animate-ping-once' : ''
                  }`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Inbox</span>
            {isInboxActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-full" />
            )}
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            prefetch={true}
            className={tabClass(isSettingsActive)}
            onClick={(e) => isSettingsActive && e.preventDefault()}
          >
            <Settings size={26} strokeWidth={2.5} className={iconClass} />
            <span className="text-xs font-medium">Settings</span>
            {isSettingsActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-full" />
            )}
          </Link>
        </div>
      </div>

      {/* Custom ping animation */}
      <style jsx>{`
        @keyframes ping-once {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-ping-once {
          animation: ping-once 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
    </div>
  )
        }
