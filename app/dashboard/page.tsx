// app/dashboard/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, slug')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      profile = data
    }
  }

  const name = profile?.username ?? 'Anonymous'
  const slug = profile?.slug ?? 'anonymous'
  const confessUrl = `https://sayappz.netlify.app/confess/${slug}`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Dashboard</h1>

        {/* Profile Info */}
        <div className="space-y-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Display Name</p>
            <p className="text-xl font-semibold">{name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Your Unique Link</p>
            <div className="mt-2 p-4 bg-gray-100 rounded-xl font-mono text-sm break-all">
              {confessUrl}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Share this link so people can send you anonymous confessions!
            </p>
          </div>
        </div>

        {/* Auth Status */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          {user ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                Logged in as <span className="font-medium">{user.email}</span>
              </p>

              <div className="flex flex-col gap-3">
                <LogoutButton />
                <Link
                  href="/login"
                  className="text-center text-sm text-blue-600 hover:underline"
                >
                  Switch to another account
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Not logged in — this is a public preview
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Log in with Email
              </Link>
            </div>
          )}
        </div>

        {/* Optional: Quick actions */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            Tip: Bookmark your link or add it to your bio!
          </p>
        </div>
      </div>
    </div>
  )
}
