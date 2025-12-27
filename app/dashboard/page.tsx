// app/dashboard/page.tsx (updated - inbox section removed)
import { supabaseServer } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import BottomNavbar from '@/components/BottomNavbar'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('username, slug')
      .eq('id', user.id)
      .single()

    profile = prof
  }

  const name = profile?.username ?? 'Anonymous'
  const slug = profile?.slug ?? 'anonymous'
  const confessUrl = `https://say-app.vercel.app/confess/${slug}`

  return (
    <>
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

            {/* Call to action for inbox */}
            {user && (
              <Link
                href="/inbox"
                className="inline-block px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition"
              >
                Open Inbox
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {user ? (
              <div className="space-y-6 text-center">
                <p className="text-sm text-gray-600">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </p>
                <div className="flex flex-col gap-4">
                  <LogoutButton />
                  <Link href="/login" className="text-sm text-blue-600 hover:underline">
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

      {/* Bottom Navbar - only for logged-in users */}
      {user && profile && <BottomNavbar profileId={user.id} />}
    </>
  )
            }
