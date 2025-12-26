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
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
    }
  }

  return (
    <AuthForm>
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary mt-2">Send magic link</button>
      </form>
      {message && <p className="mt-3 text-sm text-center text-gray-600">{message}</p>}
    </AuthForm>
  )
}
