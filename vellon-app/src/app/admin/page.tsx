'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, Image as ImageIcon, CreditCard, Clock, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const easing = [0.16, 1, 0.3, 1] as const

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    pendingPayments: 0,
    totalPhotos: 0,
    expiringSoon: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    const [usersCount, eventsCount, paymentsCount, photosCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('payment_proofs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('photos').select('*', { count: 'exact', head: true }),
    ])

    const { count: activeEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: expiringEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trial'])
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())

    setStats({
      totalUsers: usersCount.count || 0,
      totalEvents: eventsCount.count || 0,
      activeEvents: activeEventsCount || 0,
      pendingPayments: paymentsCount.count || 0,
      totalPhotos: photosCount.count || 0,
      expiringSoon: expiringEventsCount || 0,
    })

    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
              Admin Portal
            </h1>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">Vellon.photos</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[#F8FAFC]/60 hover:text-[#D4AF37] text-sm font-sans transition-colors"
            >
              Client View
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
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing }}
          className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Users</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.totalUsers}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Events</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.totalEvents}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Active</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.activeEvents}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Pending</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.pendingPayments}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Photos</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.totalPhotos}</p>
          </div>

          <div className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-red-400" />
              <span className="text-[#F8FAFC]/60 text-sm font-sans">Expiring</span>
            </div>
            <p className="font-serif text-3xl text-[#F8FAFC]">{stats.expiringSoon}</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easing }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Link
            href="/admin/users"
            className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-colors group"
          >
            <Users className="h-8 w-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">Users</h3>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">Manage user accounts</p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-colors group"
          >
            <Calendar className="h-8 w-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">Events</h3>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">View all events</p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-colors group"
          >
            <CreditCard className="h-8 w-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">Payments</h3>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">Verify payments</p>
          </Link>

          <Link
            href="/admin/vouchers"
            className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl p-6 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-colors group"
          >
            <Settings className="h-8 w-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">Vouchers</h3>
            <p className="text-[#F8FAFC]/60 text-sm font-sans">Manage discount codes</p>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
