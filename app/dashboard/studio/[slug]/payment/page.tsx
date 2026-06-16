import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PaymentClient from './PaymentClient'

interface PaymentPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getGallery(slug: string) {
  const { data: gallery, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !gallery) {
    return null
  }

  return gallery
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { slug } = await params
  const gallery = await getGallery(slug)

  if (!gallery) {
    notFound()
  }

  return <PaymentClient gallery={gallery} />
}
