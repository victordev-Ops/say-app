// app/dashboard/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'  // ← Add this

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('username, slug')
        .eq('id', user.id)
        .single()
    : { data: null }

  const name = profile?.username ?? 'Anonymous'
  const slug = profile?.slug ?? 'anonymous'

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="mt-2">Name: {name}</p>
      <p>Slug: {slug}</p>

      {user && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">
            Logged in as {user.email}
          </p>
          <LogoutButton />
        </div>
      )}

      {!user && (
        <p className="mt-6 text-sm text-gray-600">
          Not logged in (public view)
        </p>
      )}
    </div>
  )
          }
