'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Heart, Download } from 'lucide-react'

interface Photo {
  id: string
  preview_url: string
  blurhash: string
  position: number
}

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onFavorite?: (photoId: string) => void
  isFavorited?: (photoId: string) => boolean
  layoutId?: string
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onFavorite,
  isFavorited,
  layoutId,
}: LightboxProps) {
  const [direction, setDirection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentPhoto = photos[currentIndex]
  const favorite = isFavorited ? isFavorited(currentPhoto.id) : false

  // Keyboard navigation (vim-style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Vim-style navigation
      if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        setDirection(1)
        onNext()
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'ArrowLeft') {
        setDirection(-1)
        onPrevious()
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        // Jump to next chapter or scroll down
        setDirection(1)
        onNext()
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        // Jump to previous chapter or scroll up
        setDirection(-1)
        onPrevious()
      } else if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        onClose()
      } else if (e.key === 'f' || e.key === 'F') {
        onFavorite?.(currentPhoto.id)
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        // Space or P to toggle slideshow
        setIsPlaying(!isPlaying)
      } else if (e.key === 'd' || e.key === 'D') {
        // D to toggle drawer
        // This would trigger a drawer component
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPhoto.id, onNext, onPrevious, onClose, onFavorite, isPlaying])

  // Auto-play slideshow
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setDirection(1)
      onNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, onNext])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <X size={32} />
        </button>

        {/* Navigation buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDirection(-1)
            onPrevious()
          }}
          className="absolute left-4 p-3 text-white/80 hover:text-white transition-colors z-10"
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={40} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setDirection(1)
            onNext()
          }}
          className="absolute right-4 p-3 text-white/80 hover:text-white transition-colors z-10"
          disabled={currentIndex === photos.length - 1}
        >
          <ChevronRight size={40} />
        </button>

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite(currentPhoto.id)
            }}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <Heart
              size={28}
              className={favorite ? 'fill-red-500 text-red-500' : ''}
            />
          </button>
        )}

        {/* Play/Pause slideshow */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(!isPlaying)
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 hover:bg-white/20 transition-colors z-10 font-contemporary text-xs tracking-widest uppercase"
        >
          {isPlaying ? 'Pause Story' : 'Play Story'}
        </button>

        {/* Download button - mobile-first tap to save */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            const link = document.createElement('a')
            link.href = currentPhoto.preview_url
            link.download = `Vellon-photo-${currentPhoto.position}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white/90 hover:bg-white/20 transition-colors z-10"
          title="Download photo"
        >
          <Download size={20} />
        </button>

        {/* Photo counter */}
        <div className="absolute bottom-4 left-4 text-white/60 text-sm z-10 font-contemporary text-xs tracking-widest uppercase">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Main image with Ken Burns effect */}
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          layoutId={layoutId}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.4 },
            layout: { type: 'spring', stiffness: 400, damping: 25 }
          }}
          className="relative max-w-full max-h-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            src={currentPhoto.preview_url}
            alt={`Photo ${currentPhoto.position}`}
            className="max-w-full max-h-[90vh] object-contain border border-foreground/10 shadow-2xl"
            animate={isPlaying ? {
              scale: [1, 1.05, 1],
              x: [0, 10, -10, 0],
              y: [0, -10, 10, 0],
            } : {}}
            transition={isPlaying ? {
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            } : {}}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
