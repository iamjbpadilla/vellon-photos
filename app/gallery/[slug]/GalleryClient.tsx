'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import Lightbox from '@/components/gallery/Lightbox'
import FloatingActionMenu from '@/components/gallery/FloatingActionMenu'
import { Photo } from '@/types'

interface GalleryClientProps {
  photos: Photo[]
}

export default function GalleryClient({ photos }: GalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  const handlePhotoClick = (photo: Photo, index: number) => {
    setCurrentIndex(index)
    setSelectedPhotoId(photo.id)
    setLightboxOpen(true)
  }

  const handleNext = () => {
    setCurrentIndex((prev: number) => (prev + 1) % photos.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev: number) => (prev - 1 + photos.length) % photos.length)
  }

  const handleFavorite = (photoId: string) => {
    setFavorites((prev: Set<string>) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(photoId)) {
        newFavorites.delete(photoId)
      } else {
        newFavorites.add(photoId)
      }
      return newFavorites
    })
  }

  const isFavorited = (photoId: string) => favorites.has(photoId)

  const handleUpload = () => {
    // TODO: Implement upload modal
    console.log('Upload clicked')
  }

  const handleShare = () => {
    // TODO: Implement share modal
    console.log('Share clicked')
  }

  const handleSlideshow = () => {
    // TODO: Implement slideshow mode
    console.log('Slideshow clicked')
  }

  const handleDownload = () => {
    // TODO: Implement download verification
    console.log('Download clicked')
  }

  return (
    <>
      <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
      
      {lightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFavorite={handleFavorite}
          isFavorited={isFavorited}
          layoutId={selectedPhotoId || undefined}
        />
      )}

      <button
        onClick={handleUpload}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-base shadow-lg shadow-[#C9A84C]/20 hover:bg-[#B8943D] hover:shadow-[#C9A84C]/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
      >
        <Upload size={20} />
        Share a Moment
      </button>
    </>
  )
}
