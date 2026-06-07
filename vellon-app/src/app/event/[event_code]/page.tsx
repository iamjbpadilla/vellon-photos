'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Camera, Download, Share2, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import confetti from 'canvas-confetti'

const easing = [0.16, 1, 0.3, 1] as const

interface Photo {
  id: string
  storage_url: string
  caption: string
  uploader_name: string
  created_at: string
}

interface Event {
  id: string
  event_code: string
  title: string
  status: string
  photo_count: number
  expires_at: string
}

export default function EventGalleryPage({ params }: { params: { event_code: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [params.event_code])

  const loadEvent = async () => {
    const supabase = createClient()

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('event_code', params.event_code)
      .single()

    if (!eventData) {
      router.push('/')
      return
    }

    setEvent(eventData)

    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventData.id)
      .order('created_at', { ascending: false })

    setPhotos(photosData || [])
    setLoading(false)

    // Generate QR code
    const galleryUrl = `${window.location.origin}/event/${params.event_code}`
    const qrDataUrl = await QRCode.toDataURL(galleryUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#F8FAFC',
      },
    })
    setQrCode(qrDataUrl)
  }

  const handleUpload = async (files: FileList) => {
    if (!event) return

    const supabase = createClient()
    setUploading(true)

    try {
      for (let i = 0; i < Math.min(files.length, 4); i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${event.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-photos')
          .getPublicUrl(filePath)

        await supabase.from('photos').insert({
          event_id: event.id,
          storage_path: filePath,
          storage_url: publicUrl,
          uploader_name: 'Guest',
        })
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F8FAFC'],
      })

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      loadEvent()
      setShowUpload(false)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadAll = async () => {
    if (!photos.length) return

    const zip = new JSZip()
    const folder = zip.folder(`${event?.title || 'gallery'}`) || zip

    for (const photo of photos) {
      const response = await fetch(photo.storage_url)
      const blob = await response.blob()
      if (folder instanceof JSZip) {
        folder.file(photo.id + '.jpg', blob)
      } else {
        zip.file(photo.id + '.jpg', blob)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event?.title || 'gallery'}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md -z-10" />

      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
              {event.title}
            </h1>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">{photos.length} photos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownloadAll}
              className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easing }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: easing }}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={photo.storage_url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  {photo.caption && (
                    <p className="text-[#F8FAFC] text-xs font-sans truncate">{photo.caption}</p>
                  )}
                  {photo.uploader_name && (
                    <p className="text-[#F8FAFC]/60 text-xs font-sans">by {photo.uploader_name}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easing }}
            className="text-center py-20"
          >
            <p className="text-[#F8FAFC]/60 mb-4 font-sans">No photos yet</p>
            <p className="text-[#F8FAFC]/40 text-sm font-sans">Be the first to capture a moment!</p>
          </motion.div>
        )}
      </main>

      {/* Upload CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: easing }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 min-h-12 px-8 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 font-sans flex items-center gap-2"
      >
        <Camera className="h-5 w-5" />
        Capture a Moment
      </motion.button>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: easing }}
              className="bg-[#020617] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
                  Upload Photos
                </h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-8 text-center mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <Camera className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
                  <p className="text-[#F8FAFC] font-sans mb-2">
                    {uploading ? 'Uploading...' : 'Click to select photos'}
                  </p>
                  <p className="text-[#F8FAFC]/60 text-sm font-sans">
                    Up to 4 photos at a time
                  </p>
                </label>
              </div>

              <button
                onClick={() => setShowUpload(false)}
                disabled={uploading}
                className="w-full min-h-10 px-4 py-2 text-sm font-medium text-[#F8FAFC] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50 font-sans"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: easing }}
              className="bg-[#020617] border-2 border-[#D4AF37] rounded-2xl p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
                  Share Gallery
                </h2>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl mb-4">
                {qrCode && <img src={qrCode} alt="QR Code" className="w-full" />}
              </div>

              <p className="text-center text-[#F8FAFC]/60 text-sm font-sans mb-4">
                Scan to view gallery
              </p>

              <p className="text-center text-[#D4AF37] font-serif text-lg mb-4">
                {event.event_code}
              </p>

              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = qrCode
                  link.download = `vellon-${event.event_code}-qr.png`
                  link.click()
                }}
                className="w-full min-h-10 px-4 py-2 text-sm font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
              >
                Download QR Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
