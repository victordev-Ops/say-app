// app/confess/[slug]/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug?: string }
  searchParams: { status?: string; error?: string }
}

export default async function ConfessPage({ params, searchParams }: PageProps) {
  const slug = params.slug?.trim()
  const { status, error: urlError } = searchParams

  // Early guard: no slug = 404
  if (!slug) {
    notFound()
  }

  const safeSlug = slug.toLowerCase()

  const supabase = await supabaseServer()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('slug', safeSlug)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const { id: profileId, username } = profile

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

    redirect(`/confess/${slug}?status=success`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-10 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Send an Anonymous Confession</h1>
          <p className="text-2xl md:text-3xl mt-4">to @{username}</p>
        </div>

        <div className="p-8">
          {status === 'success' && (
            <div className="mb-8 p-6 bg-green-50 border border-green-300 rounded-2xl text-center">
              <p className="text-green-800 font-bold text-lg">Confession sent successfully! ✨</p>
              <p className="text-green-700 mt-2">@{username} will see it soon.</p>
            </div>
          )}

          {urlError && (
            <div className="mb-8 p-6 bg-red-50 border border-red-300 rounded-2xl text-center">
              <p className="text-red-800 font-bold">Error: {urlError}</p>
            </div>
          )}

          <form action={sendConfession} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-3">
                Your confession (100% anonymous)
              </label>
              <textarea
                id="message"
                name="message"
                rows={8}
                placeholder="Say anything... they'll never know it's you ❤️"
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 resize-none transition-shadow"
                required
                minLength={1}
                maxLength={1000}
                defaultValue={status === 'success' ? '' : undefined}
              />
              <p className="mt-2 text-xs text-gray-500 text-right">Max 1000 characters</p>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Send Anonymously
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-600 leading-relaxed">
            This message is <span className="font-semibold">completely anonymous</span>.
            <br />
            The recipient will never know who sent it.
          </p>
        </div>
      </div>
    </div>
  )
            }
