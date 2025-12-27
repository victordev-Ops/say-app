// app/dashboard/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import BottomNavbar from '@/components/BottomNavbar' // ← Add this import

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let confessions = []

  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('username, slug')
      .eq('id', user.id)
      .single()

    profile = prof

    const { data: msgs } = await supabase
      .from('confessions')
      .select('id, message, created_at, is_read') // optional: include is_read if you want
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    confessions = msgs || []
  }

  const name = profile?.username ?? 'Anonymous'
  const slug = profile?.slug ?? 'anonymous'
  const confessUrl = `https://say-app.vercel.app/confess/${slug}`

  return (
    <>
      {/* Main content with bottom padding to make room for navbar */}
      <div className="min-h-screen bg-gray-50 py-12 px-4 pb-32">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-10">Your Say Dashboard</h1>

          <div className="space-y-8 text-center">
            <div>
              <p className="text-sm text-gray-600">Your Name</p>
              <p className="text-2xl font-bold">{name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3">Share this link:</p>
              <div className="p-5 bg-gray-100 rounded-2xl font-mono text-sm break-all">
                {confessUrl}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Anyone with this link can send you anonymous confessions!
              </p>
            </div>
          </div>

          {/* Confessions Inbox - Only visible to logged-in owner */}
          {user && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <h2 className="text-2xl font-bold text-center mb-6">
                Your Confessions ({confessions.length})
              </h2>

              {confessions.length === 0 ? (
                <p className="text-center text-gray-500 py-10 text-lg">
                  No confessions yet. Share your link and check back soon! ✨
                </p>
              ) : (
                <div className="space-y-4">
                  {confessions.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6"
                    >
                      <p className="text-gray-800 italic text-lg">"{c.message}"</p>
                      <p className="text-xs text-gray-500 mt-4 text-right">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Auth Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {user ? (
              <div className="space-y-6 text-center">
                <p className="text-sm text-gray-600">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </p>
                <div className="flex flex-col gap-4">
                  <LogoutButton />
                  <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Switch account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  This is a public preview. Log in to see your confessions.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition"
                >
                  Log In with Email
                </Link>
              </div>
            )}
          </div>

          <p className="mt-10 text-center text-xs text-gray-500">
            Tip: Add your link to your bio, stories, or QR code!
          </p>
        </div>
      </div>

      {/* Bottom Navbar with Inbox Icon + Notification Badge */}
      {/* Only shown to logged-in users */}
      {user && profile && <BottomNavbar profileId={user.id} />}
    </>
  )
                }
