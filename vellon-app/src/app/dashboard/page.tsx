'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, Image as ImageIcon, Eye, LogOut, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const easing = [0.16, 1, 0.3, 1] as const

interface Event {
  id: string
  event_code: string
  title: string
  status: string
  photo_count: number
  view_count: number
  expires_at: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

  const checkOnboarding = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', authUser.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true)
    }
  }

  const completeOnboarding = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', authUser.id)

    setShowOnboarding(false)
  }

  useEffect(() => {
    loadEvents()
    checkOnboarding()
  }, [])

  const loadEvents = async () => {
    const supabase = createClient()
    
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }
    setUser(authUser)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', authUser.id)
      .order('created_at', { ascending: false })

    setEvents(eventsData || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'trial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
            Vellon.photos
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Total Events</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{events.length}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Total Photos</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">
              {events.reduce((sum, e) => sum + e.photo_count, 0)}
            </p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Total Views</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">
              {events.reduce((sum, e) => sum + e.view_count, 0)}
            </p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Active Events</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">
              {events.filter(e => e.status === 'active').length}
            </p>
          </div>
        </motion.div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easing }}
          className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl overflow-hidden backdrop-blur-sm"
        >
          <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
              Your Events
            </h2>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 min-h-10 px-4 py-2 text-sm font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#F8FAFC]/60 font-sans">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#F8FAFC]/60 mb-4 font-sans">No events yet</p>
              <Link
                href="/dashboard/events/new"
                className="inline-flex items-center gap-2 min-h-10 px-4 py-2 text-sm font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20">
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Event</th>
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Code</th>
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Status</th>
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Photos</th>
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Views</th>
                    <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Expires</th>
                    <th className="text-right p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="font-serif text-[#F8FAFC] hover:text-[#D4AF37] transition-colors"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <code className="text-[#D4AF37] font-mono text-sm">{event.event_code}</code>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)} font-sans`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#F8FAFC] font-sans">{event.photo_count}</td>
                      <td className="p-4 text-[#F8FAFC] font-sans">{event.view_count}</td>
                      <td className="p-4 text-[#F8FAFC] font-sans">
                        {event.expires_at ? (
                          <span className={getDaysUntilExpiry(event.expires_at) <= 3 ? 'text-red-400' : ''}>
                            {getDaysUntilExpiry(event.expires_at)} days
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/event/${event.event_code}`}
                          target="_blank"
                          className="text-[#D4AF37] hover:underline text-sm font-sans"
                        >
                          View Gallery
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: easing }}
              className="bg-[#020617] border-2 border-[#D4AF37] rounded-2xl p-8 max-w-md w-full"
            >
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {onboardingStep === 0 && (
                <div>
                  <h2 className="font-serif text-2xl text-[#F8FAFC] mb-4" style={{ letterSpacing: '-0.02em' }}>
                    Welcome to Vellon
                  </h2>
                  <p className="text-[#F8FAFC]/70 mb-6 font-sans">
                    Your gallery has been created with 3 demo photos. Let's get you started.
                  </p>
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
                  >
                    Continue
                  </button>
                </div>
              )}

              {onboardingStep === 1 && (
                <div>
                  <h2 className="font-serif text-2xl text-[#F8FAFC] mb-4" style={{ letterSpacing: '-0.02em' }}>
                    Share Your Gallery
                  </h2>
                  <p className="text-[#F8FAFC]/70 mb-6 font-sans">
                    Share your event code with guests so they can upload photos.
                  </p>
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
                  >
                    Continue
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div>
                  <h2 className="font-serif text-2xl text-[#F8FAFC] mb-4" style={{ letterSpacing: '-0.02em' }}>
                    Activate Your Gallery
                  </h2>
                  <p className="text-[#F8FAFC]/70 mb-6 font-sans">
                    Upgrade to a full 15-day gallery for ₱699 to keep your memories forever.
                  </p>
                  <button
                    onClick={completeOnboarding}
                    className="w-full min-h-12 px-4 py-3 text-base font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
                  >
                    Got it
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
