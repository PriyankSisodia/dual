'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0],
          fullName: fullName || username || email.split('@')[0],
        }),
      })

      const { data, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      // Account created successfully - redirect to home
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError('Failed to create account. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#121412] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#1E211E] rounded-xl p-8 border border-[#2ECC71]/30">
            <div className="w-16 h-16 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Account Created!</h2>
            <p className="text-[#F0F0F0]/70">Redirecting you to DUAL...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121412] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F0F0F0] mb-2">DUAL</h1>
          <p className="text-[#F0F0F0]/70">Join the conversation. Start a debate.</p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#1E211E] rounded-xl p-8 border border-[#1E211E]/50 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-[#F0F0F0] placeholder-[#F0F0F0]/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-[#F0F0F0] placeholder-[#F0F0F0]/50"
                placeholder="johndoe"
              />
              <p className="mt-1 text-xs text-[#F0F0F0]/50">Optional - will use email if not provided</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-[#F0F0F0] placeholder-[#F0F0F0]/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[#121412] border border-[#1E211E]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-[#F0F0F0] placeholder-[#F0F0F0]/50"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#F0F0F0]/50">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#F0F0F0]/70">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2ECC71] hover:text-[#27AE60] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

