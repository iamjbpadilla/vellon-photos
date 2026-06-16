'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, CheckCircle, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

interface PaymentClientProps {
  gallery: {
    id: string
    title: string
    slug: string
  }
}

export default function PaymentClient({ gallery }: PaymentClientProps) {
  const [referenceNumber, setReferenceNumber] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [amount, setAmount] = useState('699')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const preview = URL.createObjectURL(file)
      setReceiptPreview(preview)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!referenceNumber || !receiptFile) {
      setError('Please provide a reference number and upload your receipt.')
      setLoading(false)
      return
    }

    try {
      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `receipts/${gallery.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Submit payment via API
      const response = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          galleryId: gallery.id,
          referenceNumber,
          receiptUrl: publicUrl,
          amount,
          voucherCode: voucherCode || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payment')
      }

      setSuccess(true)
    } catch (err) {
      console.error('Payment submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border border-[#E5E7EB] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">
            Payment Submitted
          </h1>
          <p className="text-[#6B7280] text-sm mb-6">
            Your payment is being verified. We'll activate your gallery once confirmed.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <span className="text-sm font-medium text-[#1F2937]">Complete Payment</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#1F2937] mb-2">
            Activate Your Gallery
          </h1>
          <p className="text-[#6B7280] text-sm">
            Complete your payment to activate <span className="font-medium text-[#1F2937]">{gallery.title}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GCash Instructions */}
            <div className="bg-[#FDF6E3] border border-[#F0E6CC] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[#1F2937] mb-1">GCash Payment Instructions</p>
                  <p className="text-[#6B7280]">
                    Send ₱699 to <span className="font-mono font-medium text-[#1F2937]">0917-XXX-XXXX</span>. 
                    Include your reference number in the message.
                  </p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">₱</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 pl-8 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
                  readOnly
                />
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                GCash Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
                required
              />
              <p className="text-xs text-[#9CA3AF] mt-1">
                Enter the reference number from your GCash transaction
              </p>
            </div>

            {/* Voucher Code */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Voucher Code <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Enter your voucher code"
                className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">
                Have a voucher? Enter it here for potential discounts
              </p>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Upload Receipt
              </label>
              {receiptPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB]">
                  <img src={receiptPreview} alt="Receipt preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null)
                      setReceiptPreview(null)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl p-8 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload size={24} className="text-[#9CA3AF]" />
                    <span className="text-sm text-[#6B7280]">Click to upload receipt</span>
                    <span className="text-xs text-[#9CA3AF]">PNG, JPG up to 5MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#C9A84C] text-white font-semibold text-sm hover:bg-[#B8943D] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Payment'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Payments are typically verified within 24 hours
        </p>
      </div>
    </div>
  )
}
