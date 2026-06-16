import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import Lightbox from '@/components/gallery/Lightbox'
import AudioPlayer from '@/components/gallery/AudioPlayer'
import GalleryClient from './GalleryClient'
import GalleryPinGate from './GalleryPinGate'
import { Photo } from '@/types'

interface GalleryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    pin?: string
  }>
}

async function getGallery(slug: string) {
  const { data: gallery, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !gallery) {
    return null
  }

  return gallery
}

async function getPhotos(galleryId: string) {
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('position', { ascending: true })

  if (error) {
    return []
  }

  return photos as Photo[]
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const { slug } = await params
  const { pin } = await searchParams
  
  const gallery = await getGallery(slug)

  if (!gallery) {
    notFound()
  }

  // Check if gallery is private and requires PIN
  if (gallery.is_private && gallery.event_pin) {
    const providedPin = pin
    
    // If no PIN provided or PIN doesn't match, show PIN gate
    if (!providedPin || providedPin !== gallery.event_pin) {
      return <GalleryPinGate galleryTitle={gallery.title} />
    }
  }

  const photos = await getPhotos(gallery.id)

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      gallery.canvas_tone === 'linen' ? 'bg-linen' :
      gallery.canvas_tone === 'sepia' ? 'bg-sepia' :
      'bg-obsidian'
    }`}>
      {/* Header */}
      <header className="pt-16 pb-8 px-6 md:px-12">
        <h1 className={`text-4xl md:text-6xl font-serif mb-4 ${
          gallery.canvas_tone === 'obsidian' ? 'text-white' : 'text-foreground'
        }`}>
          {gallery.title}
        </h1>
        {gallery.description && (
          <p className={`text-lg md:text-xl ${
            gallery.canvas_tone === 'obsidian' ? 'text-white/70' : 'text-foreground-muted'
          }`}>
            {gallery.description}
          </p>
        )}
      </header>

      {/* Audio Player */}
      {gallery.audio_track_url && (
        <AudioPlayer audioUrl={gallery.audio_track_url} title={gallery.title} />
      )}

      {/* Photo Grid */}
      <div className="px-6 md:px-12 pb-24">
        <GalleryClient photos={photos} />
      </div>

      {/* Footer Attribution */}
      <footer className={`py-8 px-6 md:px-12 text-center border-t ${
        gallery.canvas_tone === 'obsidian' ? 'border-white/10 text-white/50' : 'border-foreground/10 text-foreground-muted'
      }`}>
        <p className="text-sm">
          Captured by Studio — Powered by Vellon
        </p>
      </footer>
    </main>
  )
}
