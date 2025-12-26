// app/dashboard/page.tsx
import { supabaseServer } from '@/lib/supabase/server'

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
    <div>
      <h1>Dashboard</h1>
      <p>Name: {name}</p>
      <p>Slug: {slug}</p>
    </div>
  )
}
