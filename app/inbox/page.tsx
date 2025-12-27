// app/inbox/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Inbox, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Confession = {
  id: string
  message: string
  created_at: string
  is_read: boolean
}

export default function InboxPage() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const fetchConfessions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/dashboard')
      return
    }

    const { data } = await supabase
      .from('confessions')
      .select('id, message, created_at, is_read')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    setConfessions(data || [])
    setLoading(false)
    setRefreshing(false)

    // Mark all as read when opening inbox
    if (data && data.some(c => !c.is_read)) {
      await supabase
        .from('confessions')
        .update({ is_read: true })
        .eq('profile_id', user.id)
        .eq('is_read', false)
    }
  }

  useEffect(() => {
    fetchConfessions()

    // Real-time subscription
    const channel = supabase
      .channel('confessions-rt')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'confessions',
        },
        (payload) => {
          const { data: { user } } = supabase.auth.getUser()
          if (payload.new.profile_id === user?.id) {
            setConfessions((prev) => [payload.new as Confession, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchConfessions()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white pb-32">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
          <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Inbox size={28} className="text-purple-600" />
                Inbox
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {confessions.length} {confessions.length === 1 ? 'message' : 'messages'}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <RefreshCw size={22} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Pull to Refresh Indicator */}
        {refreshing && (
          <div className="flex justify-center py-3">
            <RefreshCw className="animate-spin text-purple-600" size={24} />
          </div>
        )}

        {/* Message List */}
        <div className="max-w-2xl mx-auto px-6 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="bg-gray-100 w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center">
                <Inbox size={56} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Your inbox is empty
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Share your link and start receiving anonymous messages from your friends!
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition shadow-lg"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {confessions.map((confession) => (
                <div
                  key={confession.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
                >
                  <p className="text-gray-800 text-lg leading-relaxed mb-4">
                    "{confession.message}"
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(confession.created_at)}
                    </span>
                    {!confession.is_read && (
                      <span className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-pulse"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navbar (already includes the inbox icon with badge) */}
      {/* It will appear automatically if imported in layout or dashboard */}
    </>
  )
      }
