'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { decode } from 'blurhash'
import { Photo as FullPhoto } from '@/types'

interface PhotoGridProps {
  photos: FullPhoto[]
  onPhotoClick: (photo: FullPhoto, index: number) => void
}

export default function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [visiblePhotos, setVisiblePhotos] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleImageLoad = (photoId: string) => {
    setLoadedImages(prev => new Set(prev).add(photoId))
  }

  const getBlurhashDataURL = (blurhash: string) => {
    try {
      const pixels = decode(blurhash, 32, 32)
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (!ctx) return ''
      
      const imageData = ctx.createImageData(32, 32)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL('image/png')
    } catch {
      return ''
    }
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const photoId = entry.target.getAttribute('data-photo-id')
            if (photoId) {
              setVisiblePhotos(prev => new Set(prev).add(photoId))
            }
          }
        })
      },
      { rootMargin: '200px' }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // Predictive prefetching - preload adjacent images
  const prefetchImage = (url: string) => {
    const img = new Image()
    img.src = url
  }

  // Group photos by chapter
  const chapters = photos.reduce((acc, photo) => {
    const chapter = photo.chapter || 'Gallery'
    if (!acc[chapter]) acc[chapter] = []
    acc[chapter].push(photo)
    return acc
  }, {} as Record<string, FullPhoto[]>)

  return (
    <div className="w-full editorial-spacing">
      {Object.entries(chapters).map(([chapterName, chapterPhotos], chapterIndex) => (
        <div key={chapterName} className="mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-5xl font-heritage text-foreground mb-12 leading-none"
          >
            {chapterName}
          </motion.h2>
          
          <div className="editorial-grid">
            {chapterPhotos.map((photo, index) => {
              const globalIndex = photos.findIndex(p => p.id === photo.id)
              const isLoaded = loadedImages.has(photo.id)
              const blurhashUrl = getBlurhashDataURL(photo.blurhash)
              
              // Asymmetric grid spans based on index
              const spanClass = index % 3 === 0 ? 'editorial-span-8' : 
                               index % 3 === 1 ? 'editorial-span-4' : 'editorial-span-6'
              
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.08,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className={spanClass}
                >
                  <motion.button
                    layoutId={photo.id}
                    onClick={() => onPhotoClick(photo, globalIndex)}
                    className="relative w-full overflow-hidden border border-foreground/5 group focus:outline-none"
                    data-photo-id={photo.id}
                    ref={(el) => {
                      if (el && observerRef.current) {
                        observerRef.current.observe(el)
                      }
                    }}
                  >
                    {/* Blurhash placeholder */}
                    {!isLoaded && blurhashUrl && (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backgroundImage: `url(${blurhashUrl})`,
                          backgroundSize: 'cover',
                        }}
                      />
                    )}
                    
                    {/* Actual image - only load when visible */}
                    {visiblePhotos.has(photo.id) && (
                      <img
                        src={photo.preview_url}
                        alt={`Photo ${photo.position}`}
                        onLoad={() => {
                          handleImageLoad(photo.id)
                          // Prefetch next image
                          const nextIndex = (globalIndex + 1) % photos.length
                          if (photos[nextIndex]) {
                            prefetchImage(photos[nextIndex].preview_url)
                          }
                        }}
                        className={`w-full h-auto transition-opacity duration-700 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    )}
                    
                    {/* Subtle hover overlay */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
