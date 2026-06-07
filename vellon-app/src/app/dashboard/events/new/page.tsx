'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X, Check } from 'lucide-react'

const easing = [0.16, 1, 0.3, 1] as const

export default function NewEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [showVoucherInput, setShowVoucherInput] = useState(false)
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null)
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateVoucher = async (code: string) => {
    if (!code) {
      setVoucherValid(null)
      setDiscountedPrice(null)
      return
    }

    const supabase = createClient()
    const { data } = await supabase.rpc('validate_voucher', {
      p_code: code,
      p_base_amount: 699,
    })

    if (data && data.length > 0) {
      const result = data[0]
      setVoucherValid(result.valid)
      setDiscountedPrice(result.final_amount)
    } else {
      setVoucherValid(false)
      setDiscountedPrice(null)
    }
  }

  const handleVoucherBlur = () => {
    validateVoucher(voucherCode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let voucherId: string | null = null
      if (voucherValid && discountedPrice !== null) {
        const { data: voucherData } = await supabase.rpc('validate_voucher', {
          p_code: voucherCode,
          p_base_amount: 699,
        })
        if (voucherData && voucherData.length > 0) {
          voucherId = voucherData[0].voucher_id
          await supabase.rpc('redeem_voucher', { p_voucher_id: voucherId })
        }
      }

      const { data: eventData } = await supabase
        .from('events')
        .insert({
          title,
          description,
          host_id: user.id,
          status: 'trial',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          voucher_id: voucherId,
        })
        .select()
        .single()

      router.push(`/dashboard/events/${eventData.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link
            href="/dashboard"
            className="text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl text-[#F8FAFC] ml-4" style={{ letterSpacing: '-0.02em' }}>
            Create Event
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing }}
          className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-2xl p-8 backdrop-blur-sm"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                placeholder="My Wedding"
              />
            </div>

            <div>
              <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans resize-none"
                placeholder="Add a description for your event..."
              />
            </div>

            {/* Minimal Voucher Input */}
            {!showVoucherInput ? (
              <button
                type="button"
                onClick={() => setShowVoucherInput(true)}
                className="text-[#D4AF37] text-sm hover:underline font-sans"
              >
                Have a voucher?
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[#F8FAFC] text-sm font-medium font-sans">
                    Voucher Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVoucherInput(false)
                      setVoucherCode('')
                      setVoucherValid(null)
                      setDiscountedPrice(null)
                    }}
                    className="text-[#F8FAFC]/60 hover:text-[#D4AF37] text-sm font-sans"
                  >
                    <X className="h-4 w-4 inline" />
                  </button>
                </div>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase())
                    setVoucherValid(null)
                    setDiscountedPrice(null)
                  }}
                  onBlur={handleVoucherBlur}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans uppercase"
                  placeholder="CODE123"
                />
                {voucherValid === true && (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-sans">
                    <Check className="h-4 w-4" />
                    <span>
                      ₱699 → ₱{discountedPrice}
                    </span>
                  </div>
                )}
                {voucherValid === false && voucherCode && (
                  <p className="text-red-400 text-sm font-sans">Invalid voucher code</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-[#D4AF37]/20">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
