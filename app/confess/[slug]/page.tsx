// app/confess/[slug]/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConfessPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { status?: string; error?: string }
}) {
  const { slug } = params
  const { status, error: urlError } = searchParams

  const supabase = await supabaseServer()

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, slug')
    .eq('slug', slug)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const { id: profileId, username } = profile

  // Server Action — NO RETURN VALUE ALLOWED
  async function sendConfession(formData: FormData) {
    'use server'

    const message = (formData.get('message') as string)?.trim()

    if (!message || message.length < 1 || message.length > 1000) {
      redirect(`/confess/${slug}?error=Message must be 1–1000 characters`)
    }

    const { error: insertError } = await supabase
      .from('confessions')
      .insert({
        profile_id: profileId,
        message,
      })

    if (insertError) {
      console.error('Insert failed:', insertError)
      redirect(`/confess/${slug}?error=Failed to send confession`)
    }

    // Success — redirect with status
    redirect(`/confess/${slug}?status=success`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Send an Anonymous Confession</h1>
          <p className="text-2xl mt-3">to @{username}</p>
        </div>

        <div className="p-8">
          {/* Success Message */}
          {status === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border border-green-300 rounded-2xl text-center">
              <p className="text-green-800 font-bold text-lg">Confession sent! ✨</p>
              <p className="text-green-700 mt-2">@{username} will see it soon.</p>
            </div>
          )}

          {/* Error Message */}
          {urlError && (
            <div className="mb-8 p-6 bg-red-50 border border-red-300 rounded-2xl text-center">
              <p className="text-red-800 font-bold">Error: {urlError}</p>
            </div>
          )}

          <form action={sendConfession} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your confession (100% anonymous)
              </label>
              <textarea
                id="message"
                name="message"
                rows={7}
                placeholder="Say anything... they'll never know it's you ❤️"
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 resize-none"
                required
                minLength={1}
                maxLength={1000}
                defaultValue={status === 'success' ? '' : undefined}
              />
              <p className="mt-2 text-xs text-gray-500 text-right">Max 1000 characters</p>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              Send Anonymously
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600">
            This message is fully anonymous.<br />
            The recipient will never know who sent it.
          </p>
        </div>
      </div>
    </div>
  )
  }
