// app/dashboard/page.tsx
const { data: { user } } = await supabase.auth.getUser()

const { data: profile } = user
  ? await supabase.from('profiles').select('username, slug').eq('id', user.id).single()
  : { data: null }

const name = profile?.username ?? 'Anonymous'
const slug = profile?.slug ?? 'anonymous'
