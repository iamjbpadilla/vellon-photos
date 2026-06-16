'use client'

import { useState, useEffect, useRef } from 'react'
import { Gallery, Photo, Profile } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Share2, X, Lock, Eye, EyeOff, ZoomIn, Play, Pause, Music, Download, CheckCircle, Send, Camera, AlertCircle } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { supabase } from '@/lib/supabase'

interface EventClientProps {
  gallery: Gallery
  photos: Photo[]
  userProfile: Profile | null
}

export default function EventClient({ gallery, photos, userProfile }: EventClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPinScreen, setShowPinScreen] = useState(true)
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinError, setPinError] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxDirection, setLightboxDirection] = useState<"next" | "prev" | null>(null)
  const [isSlideshow, setIsSlideshow] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadCode, setDownloadCode] = useState('')
  const [downloadVerified, setDownloadVerified] = useState(false)
  const [typographyMode, setTypographyMode] = useState<'heritage' | 'contemporary'>('heritage')
  const [gridDensity, setGridDensity] = useState(3)
  const [scrolled, setScrolled] = useState(false)
  const [visibleCount, setVisibleCount] = useState(20)
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos)
  const [uploaderName, setUploaderName] = useState('')
  const [saveName, setSaveName] = useState(true)
  const [note, setNote] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const MAX_UPLOADS = 4
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Scroll detection for fixed header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lazy loading with sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < localPhotos.length) {
          setVisibleCount((c) => Math.min(c + 20, localPhotos.length))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleCount, localPhotos.length])
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lightboxPhoto = lightboxIndex !== null ? localPhotos[lightboxIndex] : null
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if PIN was previously entered for this gallery
  // Skip PIN screen for demo-like experience (can be re-enabled for security)
  useEffect(() => {
    const savedPin = localStorage.getItem(`vellon_pin_${gallery.id}`)
    if (savedPin === gallery.secure_code) {
      setShowPinScreen(false)
    }
    // Auto-skip PIN for demo-like experience
    setShowPinScreen(false)
  }, [gallery.id, gallery.secure_code])

  // Reset upload states on mount to prevent stuck loading
  useEffect(() => {
    setUploading(false)
    setShowUploadModal(false)
    setShowSuccess(false)
    setUploadError('')
    setSelectedFiles([])
    setPreviewUrls([])
  }, [])

  // Load saved uploader name
  useEffect(() => {
    const savedName = localStorage.getItem('vellon_uploader_name')
    if (savedName) {
      setUploaderName(savedName)
      setSaveName(true)
    }
  }, [])

  // Save uploader name preference
  useEffect(() => {
    if (saveName && uploaderName) {
      localStorage.setItem('vellon_uploader_name', uploaderName)
    } else if (!saveName) {
      localStorage.removeItem('vellon_uploader_name')
    }
  }, [uploaderName, saveName])

  // Auto-hide success message
  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => setShowSuccess(false), 5000)
    return () => clearTimeout(t)
  }, [showSuccess])

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying || localPhotos.length === 0 || showPinScreen) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % localPhotos.length)
    }, 5000) // 5 seconds per slide

    return () => clearInterval(interval)
  }, [isPlaying, localPhotos.length, showPinScreen])

  // Lightbox slideshow
  useEffect(() => {
    if (isSlideshow && lightboxIndex !== null) {
      slideshowIntervalRef.current = setInterval(() => {
        setLightboxDirection("next")
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % localPhotos.length : 0))
      }, 3000)
    } else {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current)
        slideshowIntervalRef.current = null
      }
    }
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current)
      }
    }
  }, [isSlideshow, lightboxIndex, localPhotos.length])

  // Keyboard shortcuts for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === " ") {
        e.preventDefault()
        toggleSlideshow()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxIndex])

  const handlePinSubmit = () => {
    if (pin === gallery.secure_code) {
      localStorage.setItem(`vellon_pin_${gallery.id}`, gallery.secure_code)
      setShowPinScreen(false)
      setPinError('')
    } else {
      setPinError('Incorrect code')
      setPin('')
    }
  }

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxDirection("prev")
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : localPhotos.length - 1)
    }
  }

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxDirection("next")
      setLightboxIndex(lightboxIndex < localPhotos.length - 1 ? lightboxIndex + 1 : 0)
    }
  }

  const toggleSlideshow = () => {
    if (isSlideshow) {
      setIsSlideshow(false)
    } else {
      setIsSlideshow(true)
    }
  }

  const handleDownloadVerify = () => {
    if (downloadCode === gallery.download_code) {
      setDownloadVerified(true)
    }
  }

  const breakpointCols = {
    default: gridDensity,
    1400: gridDensity + 1,
    1100: gridDensity,
    768: gridDensity - 1,
    500: 2
  }

  const openUploadModal = () => {
    setNote('')
    setSelectedFiles([])
    setPreviewUrls([])
    setShowUploadModal(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_UPLOADS)
    if (!files.length) return
    setSelectedFiles(files)
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!uploaderName.trim() || !selectedFiles.length) return
    setUploading(true)
    setUploadError('')

    try {
      // Upload all photos in parallel for speed
      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('gallery_id', gallery.id)
        formData.append('uploaded_by', uploaderName.trim())

        return fetch('/api/guest-upload', {
          method: 'POST',
          body: formData,
        }).then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.error || 'Upload failed')
            })
          }
          return response.json()
        })
      })

      const results = await Promise.all(uploadPromises)

      setUploading(false)
      setShowUploadModal(false)
      setShowSuccess(true)
      setNote('')
      setSelectedFiles([])
      setPreviewUrls([])
      
      // Add new photos to local state
      const newPhotos = results.map(r => r.photo).filter(Boolean)
      console.log('New photos from upload:', newPhotos)
      setLocalPhotos(prev => {
        const updated = [...prev, ...newPhotos]
        console.log('Updated photos count:', updated.length)
        // Increase visible count to show new photos immediately
        setVisibleCount(updated.length)
        return updated
      })
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploading(false)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      setUploadError(errorMessage)
    }
  }

  // PIN Entry Screen
  if (showPinScreen) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-8 max-w-md w-full shadow-sm"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-[#6B7280]" />
            </div>
            <h1 className="text-2xl font-serif text-[#1F2937] mb-2">{gallery.title}</h1>
            <p className="text-[#6B7280]">Enter the event code to view and share photos</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                placeholder="Enter code"
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF] text-center text-lg tracking-widest"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {pinError && (
              <p className="text-sm text-[#DC2626] text-center">{pinError}</p>
            )}

            <button
              onClick={handlePinSubmit}
              className="w-full px-6 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
            >
              View Gallery
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (localPhotos.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif text-[#1F2937]">{gallery.title}</h1>
              {gallery.description && (
                <p className="text-sm text-[#6B7280]">{gallery.description}</p>
              )}
            </div>
            <button
              onClick={openUploadModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
            >
              <Upload size={18} />
              <span>Share a Photo</span>
            </button>
          </div>
        </header>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload size={40} className="text-[#9CA3AF]" />
          </div>
          <h2 className="text-2xl font-serif text-[#1F2937] mb-2">No photos yet</h2>
          <p className="text-[#6B7280] mb-6">Be the first to share a moment from this event!</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-base shadow-lg shadow-[#C9A84C]/20 hover:bg-[#B8943D] hover:shadow-[#C9A84C]/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Camera size={20} />
          Share a Moment
        </button>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E5E7EB] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-xl font-semibold text-[#1F2937]">Share a Moment</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                    <X size={18} />
                  </button>
                </div>

                {uploading ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4">
                      <span className="w-6 h-6 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Uploading your photos...</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Please keep this page open while uploading</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        <strong>Don't close this browser</strong> or your upload may be interrupted
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={uploaderName}
                          onChange={(e) => setUploaderName(e.target.value)}
                          placeholder="e.g. Tita Lorna"
                          className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all pr-10"
                        />
                        {uploaderName && (
                          <button
                            type="button"
                            onClick={() => { setUploaderName(''); setSaveName(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                        <input
                          type="checkbox"
                          checked={saveName}
                          onChange={(e) => setSaveName(e.target.checked)}
                          className="rounded border-[#D1D5DB] text-[#C9A84C] focus:ring-[#C9A84C]"
                        />
                        Remember my name for future uploads
                      </label>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Leave a Note <span className="text-[#9CA3AF] font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="A quick message for the couple..."
                        className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Photos <span className="text-[#9CA3AF] font-normal">· Choose up to 4 images</span>
                      </label>
                      {previewUrls.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl py-8 flex flex-col items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                        >
                          <Upload size={22} />
                          <span className="text-sm">Tap to choose photos</span>
                          <span className="text-xs text-[#9CA3AF]">Up to 4 at a time</span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {previewUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB]">
                              <img src={url} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removePreview(idx)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {previewUrls.length < MAX_UPLOADS && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 flex flex-col items-center justify-center gap-1 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                            >
                              <Upload size={16} />
                              <span className="text-xs">Add more</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 mb-4">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{uploadError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={!uploaderName.trim() || !selectedFiles.length || uploading}
                      className="w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      Share to Gallery
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-base shadow-lg shadow-[#C9A84C]/20 hover:bg-[#B8943D] hover:shadow-[#C9A84C]/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Camera size={20} />
          Share a Moment
        </button>
      </div>
    )
  }

  const currentPhoto = localPhotos[currentIndex]

  const guestCount = new Set(localPhotos.map(p => p.guest_tags?.uploaded_by || 'Guest')).size

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] pb-28">
      {/* Fixed header on scroll */}
      <AnimatePresence>
        {scrolled && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]"
          >
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 h-12 flex items-center justify-between">
              <h2 className={`text-sm font-bold text-[#1F2937] truncate max-w-[60%] ${typographyMode === 'heritage' ? 'font-serif' : 'font-sans'}`}>
                {gallery.title}
              </h2>
              <span className="text-xs text-[#9CA3AF]">{localPhotos.length} photos · {guestCount} guests</span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Hero Section - Full viewport height */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-12">
          <h1 className={`text-3xl sm:text-4xl font-bold text-[#1F2937] mb-2 ${typographyMode === 'heritage' ? 'font-serif' : 'font-sans'}`}>
            {gallery.title}
          </h1>
          {gallery.description && (
            <p className="text-[#6B7280] text-sm max-w-xl mx-auto">{gallery.description}</p>
          )}
          <p className="text-xs text-[#9CA3AF] mt-3">
            {localPhotos.length} photos · {guestCount} guests
          </p>

          {/* Powered by Vellon badge - only for B2C */}
          {userProfile?.user_type === 'b2c' && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-xs text-[#9CA3AF]">Captured by {userProfile.full_name || 'Studio'}</span>
              <span className="text-xs text-[#C9A84C]">•</span>
              <a 
                href="https://vellon.photos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#C9A84C] hover:text-[#B8943D] transition-colors"
              >
                Powered by Vellon
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <Masonry
          breakpointCols={breakpointCols}
          className="flex gap-2 sm:gap-3"
          columnClassName="flex flex-col gap-2 sm:gap-3"
        >
          {localPhotos.slice(0, visibleCount).map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="relative group cursor-pointer rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#C9A84C]/30 transition-colors"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={photo.preview_url}
                alt={`Photo ${index + 1}`}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-white/80">{photo.guest_tags?.uploaded_by || 'Guest'}</span>
                  <ZoomIn size={14} className="text-white/80" />
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>

        {visibleCount < photos.length && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#C9A84C] rounded-full animate-spin" />
          </div>
        )}
      </main>

      {/* Audio for slideshow */}
      {gallery.audio_track_url && (
        <audio
          ref={audioRef}
          loop
          src={gallery.audio_track_url}
        />
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] transition-colors z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={18} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); toggleSlideshow(); }}
              className={`absolute top-4 left-4 w-10 h-10 rounded-full border flex items-center justify-center transition-colors z-10 ${
                isSlideshow
                  ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
                  : 'bg-white/10 border-white/20 text-white hover:text-[#C9A84C]'
              }`}
            >
              {isSlideshow ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setShowDownloadModal(true); }}
              className="absolute top-4 left-16 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
            >
              <Download size={18} />
            </button>

            <button
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] hover:bg-white/20 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <motion.div
              key={lightboxPhoto.id}
              initial={{
                opacity: 0,
                x: lightboxDirection === "next" ? 10 : lightboxDirection === "prev" ? -10 : 0
              }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onAnimationComplete={() => setLightboxDirection(null)}
              className="flex flex-col items-center"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                (e.currentTarget as HTMLElement).dataset.touchStartX = String(touch.clientX);
              }}
              onTouchEnd={(e) => {
                const startX = Number((e.currentTarget as HTMLElement).dataset.touchStartX);
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (diff > 50) goNext();
                if (diff < -50) goPrev();
              }}
            >
              <img
                src={lightboxPhoto.preview_url}
                alt="Full size"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
              <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                <span>{lightboxIndex! + 1} / {localPhotos.length}</span>
                {lightboxPhoto.guest_tags?.uploaded_by && (
                  <span>· Shared by {lightboxPhoto.guest_tags.uploaded_by}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDownloadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-[#1F2937]">Download Photos</h2>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
                >
                  <X size={20} className="text-[#6B7280]" />
                </button>
              </div>

              {!downloadVerified ? (
                <div className="space-y-4">
                  <p className="text-[#6B7280]">Enter the download code to access full-resolution photos.</p>
                  <input
                    type="text"
                    value={downloadCode}
                    onChange={(e) => setDownloadCode(e.target.value)}
                    placeholder="Enter download code"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937]"
                  />
                  <button
                    onClick={handleDownloadVerify}
                    className="w-full px-6 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-[#059669]" />
                  </div>
                  <p className="text-[#1F2937]">Download code verified!</p>
                  <button
                    className="w-full px-6 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
                  >
                    Download All Photos
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E5E7EB] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl font-semibold text-[#1F2937]">Share a Moment</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                  <X size={18} />
                </button>
              </div>

              {uploading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4">
                    <span className="w-6 h-6 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Uploading your photos...</h3>
                  <p className="text-sm text-[#6B7280] mb-4">Please keep this page open while uploading</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      <strong>Don't close this browser</strong> or your upload may be interrupted
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={uploaderName}
                        onChange={(e) => setUploaderName(e.target.value)}
                        placeholder="e.g. Tita Lorna"
                        className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all pr-10"
                      />
                      {uploaderName && (
                        <button
                          type="button"
                          onClick={() => { setUploaderName(''); setSaveName(false); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <label className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                      <input
                        type="checkbox"
                        checked={saveName}
                        onChange={(e) => setSaveName(e.target.checked)}
                        className="rounded border-[#D1D5DB] text-[#C9A84C] focus:ring-[#C9A84C]"
                      />
                      Remember my name for future uploads
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Leave a Note <span className="text-[#9CA3AF] font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="A quick message for the couple..."
                      className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-[16px] text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Photos <span className="text-[#9CA3AF] font-normal">· Choose up to 4 images</span>
                    </label>
                    {previewUrls.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 rounded-xl py-8 flex flex-col items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                      >
                        <Upload size={22} />
                        <span className="text-sm">Tap to choose photos</span>
                        <span className="text-xs text-[#9CA3AF]">Up to 4 at a time</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB]">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePreview(idx)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {previewUrls.length < MAX_UPLOADS && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#C9A84C]/40 flex flex-col items-center justify-center gap-1 text-[#9CA3AF] hover:text-[#6B7280] transition-all"
                          >
                            <Upload size={16} />
                            <span className="text-xs">Add more</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={!uploaderName.trim() || !selectedFiles.length || uploading}
                    className="w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    Share to Gallery
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <button
        onClick={() => setShowUploadModal(true)}
        disabled={uploading}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-base shadow-lg shadow-[#C9A84C]/20 hover:bg-[#B8943D] hover:shadow-[#C9A84C]/30 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
      >
        <Camera size={20} />
        Share a Moment
      </button>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-sm border border-[#E5E7EB] shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-[#FDF6E3] border border-[#F0E6CC] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle size={28} className="text-[#C9A84C]" />
              </motion.div>
              <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Photo Shared!</h3>
              <p className="text-[#6B7280] mb-6">Your photo has been uploaded and is pending approval.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-[#1F2937]">Share Gallery</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
                >
                  <X size={20} className="text-[#6B7280]" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">
                    Gallery Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/e/${gallery.slug}`}
                      readOnly
                      className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg text-[#1F2937]"
                    />
                    <button className="px-4 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
