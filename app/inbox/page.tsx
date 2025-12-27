// app/inbox/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in → redirect to dashboard (or login)
  if (!user) {
    redirect('/dashboard')
  }

  // Fetch profile and confessions
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { data: confessions } = await supabase
    .from('confessions')
    .select('id, message, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  const name = profile?.username || 'You'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Inbox</h1>
            <p className="text-gray-600 mt-2">All your anonymous confessions</p>
          </div>

          {(!confessions || confessions.length === 0) ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No messages yet.</p>
              <p className="text-gray-400 mt-4">Share your link and wait for the magic ✨</p>
              <Link
                href="/dashboard"
                className="mt-8 inline-block px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {confessions.map((c) => (
                <div
                  key={c.id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 hover:shadow-md transition"
                >
                  <p className="text-gray-800 italic text-lg leading-relaxed">"{c.message}"</p>
                  <p className="text-xs text-gray-500 mt-5 text-right">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="text-purple-600 hover:underline font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
    }
