'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardClient from './DashboardClient'
import { Profile, Gallery } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshGalleries = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: galleriesData } = await supabase
      .from('galleries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setGalleries(galleriesData || [])
  }

  useEffect(() => {
    async function loadDashboard() {
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUserId(session.user.id)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profileData) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData)

      // Get user's galleries
      const { data: galleriesData } = await supabase
        .from('galleries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setGalleries(galleriesData || [])
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#6B7280]">Loading...</div>
      </div>
    )
  }

  if (!profile || !userId) {
    return null
  }

  return (
    <DashboardClient 
      profile={profile} 
      galleries={galleries}
      userId={userId}
      refreshGalleries={refreshGalleries}
    />
  )
}
