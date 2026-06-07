'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const easing = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easing }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#020617]/60 border border-[#D4AF37]/20 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="font-serif text-3xl text-[#F8FAFC] text-center mb-2" style={{ letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p className="text-[#F8FAFC]/60 text-center mb-8 font-sans text-sm">
            Sign in to access your gallery
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-[#D4AF37] text-sm hover:underline font-sans"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[#F8FAFC]/60 text-sm font-sans">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#D4AF37] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
