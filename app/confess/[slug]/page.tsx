// app/confess/[slug]/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ConfessPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const supabase = await supabaseServer()

  // Fetch the profile by slug to confirm it exists + get username for display
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, slug')
    .eq('slug', slug)
    .single()

  if (error || !profile) {
    notFound() // 404 if slug doesn't exist
  }

  const username = profile.username

  // Server action to handle submission
  async function sendConfession(formData: FormData) {
    'use server'

    const message = (formData.get('message') as string)?.trim()

    if (!message || message.length < 1 || message.length > 1000) {
      return { error: 'Message must be 1-1000 characters.' }
    }

    const { error: insertError } = await supabase
      .from('confessions')
      .insert({
        profile_id: profile.id, // We'll add id to select above
        message,
        // Optional: add timestamp, ip, etc. later
      })

    if (insertError) {
      console.error('Confession insert error:', insertError)
      return { error: 'Failed to send confession. Try again.' }
    }

    return { success: true }
  }

  // Wait, we need profile.id for insert — update select
  // Actually, let's refetch with id
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('slug', slug)
    .single()

  if (!fullProfile) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Send an anonymous confession to
        </h1>
        <p className="text-2xl font-semibold text-center text-purple-600 mb-8">
          @{username}
        </p>

        <form action={sendConfession} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your confession (completely anonymous)
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Type your confession here... No login required!"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
              minLength={1}
              maxLength={1000}
            />
            <p className="mt-2 text-xs text-gray-500 text-right">
              {1000} characters max
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
          >
            Send Confession Anonymously
          </button>
        </form>

        {/* Success/Error message handling via redirect or revalidate can be added later */}
        <p className="mt-8 text-center text-sm text-gray-500">
          This confession is 100% anonymous. The recipient will never know who sent it.
        </p>
      </div>
    </div>
  )
}
