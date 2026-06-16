import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Photo, Profile } from '@/types'
import EventClient from './EventClient'

interface EventPageProps {
  params: Promise<{
    event_code: string
  }>
}

async function getGalleryBySlug(slug: string) {
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

async function getUserProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  return profile as Profile
}

export default async function EventPage({ params }: EventPageProps) {
  const { event_code } = await params
  const gallery = await getGalleryBySlug(event_code)

  if (!gallery) {
    notFound()
  }

  const photos = await getPhotos(gallery.id)
  const userProfile = await getUserProfile(gallery.user_id)

  return (
    <EventClient 
      gallery={gallery}
      photos={photos}
      userProfile={userProfile}
    />
  )
}
