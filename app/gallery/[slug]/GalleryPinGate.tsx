'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

interface GalleryPinGateProps {
  galleryTitle: string
}

export default function GalleryPinGate({ galleryTitle }: GalleryPinGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length === 4) {
      // Redirect with PIN in URL
      router.push(`?pin=${pin}`)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center">
              <Lock size={32} className="text-foreground/60" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-serif text-foreground text-center mb-2">
            Private Gallery
          </h1>
          <p className="text-foreground-muted text-center mb-8">
            {galleryTitle}
          </p>

          {/* PIN Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 text-center">
                Enter 4-digit PIN
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''))
                  setError(false)
                }}
                className="w-full text-center text-3xl tracking-widest px-4 py-4 border-2 border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937]"
                placeholder="••••"
              />
              {error && (
                <p className="text-red-600 text-sm text-center mt-2">
                  Invalid PIN. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter Gallery
            </button>
          </form>

          {/* Help Text */}
          <p className="text-xs text-foreground-muted text-center mt-6">
            Contact the photographer if you don't have the PIN
          </p>
        </div>
      </div>
    </div>
  )
}
