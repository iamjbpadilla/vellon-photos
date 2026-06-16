'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, CheckCircle, AlertCircle, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userType: 'b2c' | 'b2b'
}

export default function CreateEventModal({ isOpen, onClose, onSuccess, userType }: Props) {
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventSlug, setEventSlug] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [showVoucherField, setShowVoucherField] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentSettings, setPaymentSettings] = useState<{ amount: number; recipient_name: string; qr_code_url: string | null; gcash_number: string } | null>(null)

  // Set default date to today on mount
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setEventDate(formattedDate)
  }, [])

  // Fetch payment settings on mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      const { data } = await supabase
        .from('payment_settings')
        .select('*')
        .single()
      if (data) {
        setPaymentSettings(data)
      }
    }
    fetchPaymentSettings()
  }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setEventName(name)
    setEventSlug(generateSlug(name))
  }

  const handleNextStep = () => {
    if (!eventName || !eventDate || !eventSlug) {
      setError('Please fill in all required event details.')
      return
    }
    setError('')
    setCurrentStep(2)
  }

  const handleBackStep = () => {
    setCurrentStep(1)
    setError('')
  }

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

    // B2B users skip payment - create gallery directly
    if (userType === 'b2b') {
      if (!eventName || !eventDate || !eventSlug) {
        setError('Please fill in all required event details.')
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const response = await fetch('/api/event/create-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            eventName,
            eventDate,
            eventSlug,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create event')
        }

        setSuccess(true)
      } catch (err) {
        console.error('Event creation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // B2C users go through payment flow
    if (!eventName || !eventDate || !eventSlug || !referenceNumber || !receiptFile) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    try {
      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `receipts/temp/${fileName}`

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

      // Submit event creation with payment
      const response = await fetch('/api/event/create-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          eventName,
          eventDate,
          eventSlug,
          voucherCode: voucherCode || undefined,
          referenceNumber,
          receiptUrl: publicUrl,
          amount: paymentSettings?.amount || 999,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      setSuccess(true)
    } catch (err) {
      console.error('Event creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      // Reset form after close animation
      setTimeout(() => {
        setEventName('')
        setEventDate('')
        setEventSlug('')
        setVoucherCode('')
        setShowVoucherField(false)
        setReferenceNumber('')
        setReceiptFile(null)
        setReceiptPreview(null)
        setError('')
        setSuccess(false)
        setCurrentStep(1)
      }, 300)
    }
  }

  // Handle escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [loading])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const inputCls = "w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Drag handle (mobile) */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#E5E7EB] mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="pt-5 sm:pt-7 pb-0 px-6 sm:px-8 text-center">
              <span className="font-serif text-2xl font-bold">
                <span className="text-[#C9A84C]">Vellon</span>
                <span className="text-[#6B7280] font-light">.photos</span>
              </span>
              <p className="mt-1 text-xs tracking-widest text-[#9CA3AF] uppercase font-medium">
                Create Your Event
              </p>
            </div>

            <hr className="mx-6 sm:mx-8 mt-4 border-[#E5E7EB]" />

            <div className="px-6 sm:px-8 pt-5 pb-6 sm:pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-[#C9A84C]" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">
                    Event Created
                  </h2>
                  <p className="text-[#6B7280] text-sm mb-6">
                    {userType === 'b2b' 
                      ? 'Your event is now active and ready to use.'
                      : 'Your event is being verified. We\'ll activate it once payment is confirmed.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      handleClose()
                      onSuccess()
                    }}
                    className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {/* Step Indicator - only show for B2C users */}
                  {userType === 'b2c' && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 1 ? 'bg-[#C9A84C] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
                          1
                        </div>
                        <span className="text-sm font-medium">Event Details</span>
                      </div>
                      <div className={`flex-1 h-0.5 ${currentStep === 1 ? 'bg-[#E5E7EB]' : 'bg-[#C9A84C]'}`} />
                      <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 2 ? 'bg-[#C9A84C] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
                          2
                        </div>
                        <span className="text-sm font-medium">Payment</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={userType === 'b2b' ? handleSubmit : (currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit)} className="space-y-6">
                    {/* Step 1: Event Details */}
                    {(currentStep === 1 || userType === 'b2b') && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-medium text-[#1F2937]">Event Details</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            Event Name
                          </label>
                          <input
                            type="text"
                            value={eventName}
                            onChange={handleEventNameChange}
                            placeholder="e.g., Sarah & John's Wedding"
                            className={inputCls}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            Event Date
                          </label>
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={inputCls}
                            required
                          />
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            Past dates are not allowed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            URL Slug <span className="text-[#9CA3AF] font-normal">(auto-generated)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">Vellon.photos/</span>
                            <input
                              type="text"
                              value={eventSlug}
                              onChange={(e) => setEventSlug(e.target.value)}
                              placeholder="sarah-john-wedding"
                              className={inputCls + " pl-28"}
                              required
                            />
                          </div>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            Auto-generated from event name, but you can edit it
                          </p>
                        </div>

                        {/* Hidden voucher field trigger - only for B2C users */}
                        {userType === 'b2c' && !showVoucherField && (
                          <button
                            type="button"
                            onClick={() => setShowVoucherField(true)}
                            className="text-xs text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors mt-2"
                          >
                            Have a voucher?
                          </button>
                        )}

                        {userType === 'b2c' && showVoucherField && (
                          <div>
                            <label className="block text-sm font-medium text-[#374151] mb-1.5">
                              Voucher Code
                            </label>
                            <input
                              type="text"
                              value={voucherCode}
                              onChange={(e) => setVoucherCode(e.target.value)}
                              placeholder="Enter your voucher code"
                              className={inputCls}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Payment */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-medium text-[#1F2937]">Payment</h3>

                        {/* Compact Payment Card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                          <div className="flex gap-4">
                            {/* QR Code */}
                            {paymentSettings?.qr_code_url ? (
                              <img
                                src={paymentSettings.qr_code_url}
                                alt="Payment QR Code"
                                className="w-48 h-48 border border-[#E5E7EB] rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div className="w-48 h-48 border-2 border-dashed border-[#D1D5DB] rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-[#9CA3AF]">QR Code</span>
                              </div>
                            )}

                            {/* Payment Info */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="text-xs text-[#6B7280]">Amount</p>
                                <p className="text-xl font-bold text-[#1F2937]">₱{paymentSettings?.amount || 999}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#6B7280]">Send to</p>
                                <p className="text-sm font-medium text-[#1F2937]">{paymentSettings?.recipient_name || 'JU**T P.'}</p>
                              </div>
                              <p className="text-xs text-[#6B7280]">Scan with GCash or any Instapay-linked bank app</p>
                            </div>
                          </div>
                        </div>

                        {/* Reference Number */}
                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            Payment Reference Number
                          </label>
                          <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Enter GCash reference / transaction ID"
                            className={inputCls}
                            required
                          />
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            Found in GCash app → Transaction History after payment
                          </p>
                        </div>

                        {/* Receipt Upload */}
                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-1.5">
                            Upload Receipt Screenshot
                          </label>
                          {receiptPreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB]">
                              <img src={receiptPreview} alt="Receipt preview" className="w-full h-32 object-cover" />
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
                            <label className="block border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl p-4 cursor-pointer transition-colors">
                              <div className="flex flex-col items-center gap-1 text-center">
                                <Upload size={20} className="text-[#9CA3AF]" />
                                <span className="text-sm text-[#6B7280]">Click to upload receipt</span>
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
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                      {userType === 'b2c' && currentStep === 2 && (
                        <button
                          type="button"
                          onClick={handleBackStep}
                          className="flex-1 py-3.5 rounded-xl border border-[#D1D5DB] font-semibold text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors flex items-center justify-center gap-2"
                        >
                          <ArrowLeft size={16} />
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl bg-[#C9A84C] text-white font-semibold text-sm hover:bg-[#B8943D] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {userType === 'b2b' ? 'Creating Event...' : (currentStep === 1 ? 'Processing...' : 'Creating Event...')}
                          </>
                        ) : (
                          userType === 'b2b' ? 'Create Event' : (currentStep === 1 ? 'Continue to Payment' : 'Create Event & Submit Payment')
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
