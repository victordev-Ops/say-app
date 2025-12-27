// app/confess/[slug]/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic' // Ensures fresh data on each request

export default async function ConfessPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const supabase = await supabaseServer()

  // Fetch profile with id and username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, slug')
    .eq('slug', slug)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { id: profileId, username } = profile

  // Server Action: Insert confession (anonymous)
  async function sendConfession(formData: FormData) {
    'use server'

    const message = (formData.get('message') as string)?.trim()

    if (!message || message.length < 1 || message.length > 1000) {
      return { error: 'Confession must be between 1 and 1000 characters.' }
    }

    const { error: insertError } = await supabase
      .from('confessions')
      .insert({
        profile_id: profileId,
        message,
      })

    if (insertError) {
      console.error('Confession insert failed:', insertError)
      return { error: 'Failed to send. Please try again.' }
    }

    // Revalidate the dashboard to show new confession instantly
    // (requires Next.js 14+ revalidatePath)
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/dashboard')
    } catch {
      // Ignore if not available
    }

    return { success: true }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Send an Anonymous Confession</h1>
          <p className="text-2xl mt-3">to @{username}</p>
        </div>

        <div className="p-8">
          <form action={sendConfession} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your confession (100% anonymous — no login required)
              </label>
              <textarea
                id="message"
                name="message"
                rows={7}
                placeholder="Pour your heart out... they'll never know it was you ❤️"
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 resize-none transition"
                required
                minLength={1}
                maxLength={1000}
              />
              <p className="mt-2 text-xs text-gray-500 text-right">
                Max 1000 characters
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition shadow-lg"
            >
              Send Confession Anonymously
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              This message is completely anonymous. 
              <br />
              The recipient will never know who sent it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
