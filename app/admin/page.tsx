'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import AdminClient from './AdminClient'

export default function AdminPage() {
  const router = useRouter()
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [vouchers, setVouchers] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [rejectedPayments, setRejectedPayments] = useState<any[]>([])
  const [guestUploads, setGuestUploads] = useState<any[]>([])
  const [agreements, setAgreements] = useState<any[]>([])
  const [infrastructure, setInfrastructure] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminData() {
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile || !profile.is_admin) {
        router.push('/dashboard')
        return
      }

      // Get pending payment queue via API (server-side bypasses RLS)
      const paymentsResponse = await fetch('/api/admin/pending-payments')
      if (!paymentsResponse.ok) {
        console.error('Failed to fetch payments:', paymentsResponse.status)
        setPendingPayments([])
        setRejectedPayments([])
      } else {
        const paymentsData = await paymentsResponse.json()
        setPendingPayments(paymentsData.pending || [])
        setRejectedPayments(paymentsData.rejected || [])
      }

      // Get all vouchers
      const { data: vouchersData } = await supabase
        .from('voucher_pool')
        .select('*')
        .order('created_at', { ascending: false })

      // Get payment ledger with user and gallery details
      const { data: ledgerData } = await supabase
        .from('payment_ledger')
        .select(`
          *,
          profiles!inner (
            full_name,
            email
          ),
          galleries (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // Get pending guest uploads
      const { data: guestUploadsData } = await supabase
        .from('guest_uploads')
        .select('*, galleries(title, slug)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      // Get recent agreements
      const { data: agreementsData } = await supabase
        .from('user_agreements')
        .select('*, profiles(full_name, email), galleries(title)')
        .order('consented_at', { ascending: false })
        .limit(20)

      // Get infrastructure stats
      const infraResponse = await fetch('/api/admin/infrastructure')
      const infraData = await infraResponse.json()

      setVouchers(vouchersData || [])
      setLedger(ledgerData || [])
      setGuestUploads(guestUploadsData || [])
      setAgreements(agreementsData || [])
      setInfrastructure(infraData.infrastructure || null)
      setLoading(false)
    }

    loadAdminData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[#6B7280]">Loading...</div>
      </div>
    )
  }

  return (
    <AdminClient 
      pendingPayments={pendingPayments}
      vouchers={vouchers}
      ledger={ledger}
      rejectedPayments={rejectedPayments}
      guestUploads={guestUploads}
      agreements={agreements}
      infrastructure={infrastructure}
    />
  )
}
