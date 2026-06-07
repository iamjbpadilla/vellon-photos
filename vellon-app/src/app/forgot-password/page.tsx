'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const easing = [0.16, 1, 0.3, 1] as const

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage('Error sending reset email. Please try again.')
    } else {
      setMessage('Check your email for the reset link.')
    }

    setLoading(false)
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
            Reset Password
          </h1>
          <p className="text-[#F8FAFC]/60 text-center mb-8 font-sans text-sm">
            Enter your email to receive a reset link
          </p>

          {message && (
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-[#D4AF37] text-sm hover:underline font-sans"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
