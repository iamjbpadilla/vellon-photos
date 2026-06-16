'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Share2, Play, Download, X, ChevronUp, Music } from 'lucide-react'

interface FloatingActionMenuProps {
  onUpload?: () => void
  onShare?: () => void
  onSlideshow?: () => void
  onDownload?: () => void
  onMusic?: () => void
  isMusicPlaying?: boolean
}

export default function FloatingActionMenu({ 
  onUpload, 
  onShare, 
  onSlideshow, 
  onDownload,
  onMusic,
  isMusicPlaying = false
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const actions = [
    { icon: Share2, label: 'Share Gallery', action: onShare, color: 'bg-[#1F2937]' },
    { icon: Play, label: 'Play Slideshow', action: onSlideshow, color: 'bg-[#1F2937]' },
    { icon: Music, label: isMusicPlaying ? 'Pause Music' : 'Play Music', action: onMusic, color: 'bg-[#1F2937]' },
    { icon: Download, label: 'Download All', action: onDownload, color: 'bg-[#1F2937]' },
  ]

  // Gesture recognition
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      }

      const deltaX = touchEnd.x - touchStartRef.current.x
      const deltaY = touchEnd.y - touchStartRef.current.y
      const deltaTime = touchEnd.time - touchStartRef.current.time

      // Long press detection (>500ms, minimal movement)
      if (deltaTime > 500 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
        setIsOpen(prev => !prev)
      }

      // Swipe up detection (fast upward movement)
      if (deltaTime < 300 && deltaY < -50 && Math.abs(deltaX) < 50) {
        setIsOpen(true)
      }

      touchStartRef.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const handleAction = (action?: () => void) => {
    if (action) action()
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end" ref={fabRef}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mb-3 space-y-2"
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAction(action.action)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow ${
                    action.color === 'bg-[#C9A84C]' 
                      ? 'bg-[#C9A84C] text-white' 
                      : 'bg-white text-[#1F2937]'
                  }`}
                >
                  <action.icon size={18} />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isOpen 
              ? 'bg-[#1F2937] text-white' 
              : 'bg-[#C9A84C] text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}
