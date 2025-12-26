// app/auth/setup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'  // ← this now works

const supabase = createClient()  // ← now valid

export default function SetupUsername() {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Update metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { username },
      })

      if (metaError) throw metaError

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw userError || new Error('No user')

      // Generate unique slug
      let baseSlug = username.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (!baseSlug) baseSlug = 'user'

      let slug = baseSlug
      let i = 0
      while (true) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (!data) break
        i++
        slug = `\( {baseSlug}- \){i}`
      }

      // Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          username,
          slug,
        })

      if (profileError) {
        if (profileError.code === '23505') { // unique violation
          setMessage('Username or slug already taken')
        } else {
          throw profileError
        }
      } else {
        router.push('/dashboard')
        router.refresh() // optional: force refresh server data
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Choose a username</h1>
      <p className="text-gray-600 mb-6">This will be your public name and link</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Username"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Continue'}
        </button>
      </form>
      
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  )
}
