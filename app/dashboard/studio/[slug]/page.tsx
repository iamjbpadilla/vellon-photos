import { supabase, supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Photo, Gallery, Profile } from '@/types'
import StudioClient from './StudioClient'

interface StudioPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getGalleryBySlug(slug: string) {
  const { data: gallery, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !gallery) {
    return null
  }

  return gallery as Gallery
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

async function getUserProfile(userId: string) {
  if (!supabaseAdmin) {
    return null
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  return profile as Profile
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params
  const gallery = await getGalleryBySlug(slug)

  if (!gallery) {
    notFound()
  }

  const photos = await getPhotos(gallery.id)
  const profile = await getUserProfile(gallery.user_id)

  return (
    <StudioClient 
      gallery={gallery}
      photos={photos}
      userProfile={profile}
    />
  )
}
