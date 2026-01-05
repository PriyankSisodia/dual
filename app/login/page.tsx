'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseClient()
      let email = emailOrUsername

      // Check if input is an email (contains @) or username
      const isEmail = emailOrUsername.includes('@')

      if (!isEmail) {
        // It's a username - look up the email using a database function
        const { data: emailData, error: emailError } = await supabase.rpc('get_user_email_by_username', {
          username_param: emailOrUsername.toLowerCase().trim()
        })

        if (emailError || !emailData || (Array.isArray(emailData) && emailData.length === 0)) {
          setError('Invalid username or password')
          setLoading(false)
          return
        }

        const emailResult = Array.isArray(emailData) ? emailData[0] : emailData
        if (!emailResult || !emailResult.email) {
          setError('Invalid username or password')
          setLoading(false)
          return
        }

        email = emailResult.email
      }

      // Sign in directly with client-side Supabase (handles cookies automatically)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // Handle email confirmation error
        if (signInError.message.includes('email') && signInError.message.includes('confirm')) {
          setError('Email not confirmed. Please check your email and click the confirmation link.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email/username or password')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      // Success - ensure session is established
      if (data?.session) {
        // Session is already set, redirect
        router.push('/')
        router.refresh()
      } else {
        // Wait a bit for session to be established, then redirect
        await new Promise(resolve => setTimeout(resolve, 300))
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError('Failed to sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">DUAL</h1>
          <p className="text-gray-600">Welcome back. Let's continue the conversation.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl p-8 border border-purple-200 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-900 mb-2">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="you@example.com or username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

