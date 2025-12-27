// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { signUp } from '@/actions/auth'
import AuthForm from '@/components/AuthForm'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email)
      setMessage('Magic link sent! Check your email.')
      setEmail('') // Optional: clear input on success
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <AuthForm>
          <h1 className="text-2xl font-bold mb-4 text-center">Create account</h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Enter your email to get started.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary mt-2">
              Send magic link
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </AuthForm>

        {/* This paragraph is now correctly inside the return block */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
          }
