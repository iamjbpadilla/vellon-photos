'use client'

import { useState, useEffect } from 'react'
import { Check, X, Plus, DollarSign, Users, LogOut, Shield, ShieldOff, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import ConfirmationModal from '@/components/ConfirmationModal'
import ToastContainer, { useToast } from '@/components/Toast'
import AdminFinancialAnalytics from '@/components/AdminFinancialAnalytics'

interface AdminClientProps {
  pendingPayments: any[]
  vouchers: any[]
  ledger: any[]
  rejectedPayments: any[]
  guestUploads: any[]
  agreements: any[]
  infrastructure: any
}

export default function AdminClient({ pendingPayments, vouchers, ledger, rejectedPayments, guestUploads, agreements, infrastructure }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'history' | 'vouchers' | 'users' | 'settings' | 'financial'>('overview')
  
  // Combine ledger and rejected payments for complete transaction history
  const allTransactions = [
    ...ledger.map(entry => ({
      ...entry,
      source: 'ledger',
      status: entry.status || 'completed'
    })),
    ...rejectedPayments.map(payment => ({
      ...payment,
      source: 'rejected',
      status: 'rejected',
      payment_type: 'b2c_event',
      amount: payment.amount
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showPaymentSettingsModal, setShowPaymentSettingsModal] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [voucherForm, setVoucherForm] = useState({ discountAmount: '', maxUses: '' })
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'b2c' | 'b2b'>('all')
  const [paymentSettings, setPaymentSettings] = useState<{ amount: number; recipient_name: string; qr_code_url: string | null; gcash_number: string } | null>(null)
  const [paymentSettingsForm, setPaymentSettingsForm] = useState({ amount: '', recipient_name: '', qr_code_url: '', gcash_number: '' })
  const [lightboxReceiptUrl, setLightboxReceiptUrl] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ paymentId: string; action: 'approve' | 'reject' } | null>(null)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  
  // Confirmation modal state
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning'
  })

  const { toasts, success, error, warning, info, removeToast } = useToast()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        if (session.user.email) {
          setUserEmail(session.user.email)
        }
        // Fetch full_name from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
        if (profile?.full_name) {
          setUserName(profile.full_name)
        }
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    async function fetchPaymentSettings() {
      const { data } = await supabase
        .from('payment_settings')
        .select('*')
        .single()
      if (data) {
        setPaymentSettings(data)
        setPaymentSettingsForm({
          amount: data.amount.toString(),
          recipient_name: data.recipient_name,
          qr_code_url: data.qr_code_url || '',
          gcash_number: data.gcash_number
        })
      }
    }
    fetchPaymentSettings()
  }, [])

  async function handleLogout() {
    setConfirmation({
      isOpen: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      onConfirm: async () => {
        await supabase.auth.signOut()
        success('Signed out successfully')
        window.location.href = '/'
      },
      variant: 'info'
    })
  }

  const loadUsers = async () => {
    if (users.length > 0) return
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setConfirmation({
      isOpen: true,
      title: currentStatus ? 'Revoke Admin Access' : 'Grant Admin Access',
      message: currentStatus ? 'Are you sure you want to revoke admin access for this user?' : 'Are you sure you want to grant admin access to this user?',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/admin/promote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, makeAdmin: !currentStatus }),
          })
          const data = await response.json()
          if (data.success) {
            setUsers(users.map(user => 
              user.id === userId ? { ...user, is_admin: !currentStatus } : user
            ))
            success(currentStatus ? 'Admin access revoked' : 'Admin access granted')
          } else {
            error('Failed to update admin status')
          }
        } catch (err) {
          console.error('Failed to update admin status:', err)
          error('Failed to update admin status')
        }
      },
      variant: 'warning'
    })
  }

  const toggleUserType = async (userId: string, currentType: string) => {
    const newType = currentType === 'b2c' ? 'b2b' : 'b2c'
    setConfirmation({
      isOpen: true,
      title: 'Change User Type',
      message: `Change user type from ${currentType.toUpperCase()} to ${newType.toUpperCase()}?`,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/admin/update-user-type', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userType: newType }),
          })
          const data = await response.json()
          if (data.success) {
            setUsers(users.map(user => 
              user.id === userId ? { ...user, user_type: newType } : user
            ))
            success(`User type changed to ${newType.toUpperCase()}`)
          } else {
            error('Failed to update user type')
          }
        } catch (err) {
          console.error('Failed to update user type:', err)
          error('Failed to update user type')
        }
      },
      variant: 'info'
    })
  }

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    if (tab === 'users') {
      loadUsers()
    }
  }

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setConfirmAction({ paymentId, action })
  }

  const confirmPaymentAction = async () => {
    if (!confirmAction) return
    try {
      const response = await fetch('/api/admin/payment-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentId: confirmAction.paymentId, 
          action: confirmAction.action
        }),
      })
      const data = await response.json()
      if (data.success) {
        success(confirmAction.action === 'approve' ? 'Payment approved' : 'Payment rejected')
        window.location.reload()
      } else {
        error('Failed to process payment')
      }
    } catch (err) {
      console.error('Failed to process payment:', err)
      error('Failed to process payment')
    }
  }

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountAmount: parseFloat(voucherForm.discountAmount),
          maxUses: parseInt(voucherForm.maxUses)
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowVoucherModal(false)
        setVoucherForm({ discountAmount: '', maxUses: '' })
        success('Voucher created successfully')
        window.location.reload()
      } else {
        error('Failed to create voucher')
      }
    } catch (err) {
      console.error('Failed to create voucher:', err)
      error('Failed to create voucher')
    }
  }

  const handleUpdatePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let qrCodeUrl = paymentSettingsForm.qr_code_url

      // If a new QR code file was selected, upload it
      if (qrCodeFile) {
        const fileName = `qr-code-${Date.now()}.png`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, qrCodeFile)

        if (uploadError) {
          console.error('Failed to upload QR code:', uploadError)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName)

        qrCodeUrl = publicUrl
      }

      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentSettingsForm.amount),
          recipient_name: paymentSettingsForm.recipient_name,
          qr_code_url: qrCodeUrl || null,
          gcash_number: paymentSettingsForm.gcash_number
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowPaymentSettingsModal(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update payment settings:', error)
    }
  }

  const handleQrCodeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-xl sm:text-2xl tracking-tight">
            <span className="text-[#C9A84C]">Vellon</span>
            <span className="text-[#6B7280] font-light">.photos</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">
              {userName || userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-[#E5E7EB]">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('payments')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => handleTabChange('vouchers')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'vouchers'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Vouchers
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => handleTabChange('financial')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'financial'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Financial
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Platform Health */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Platform Health</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Total Users</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{infrastructure?.totalUsers || 0}</p>
                </div>
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Active Galleries</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{infrastructure?.activeGalleries || 0}</p>
                </div>
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Total Photos</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{infrastructure?.totalPhotos?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Storage Used</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{infrastructure?.storageUsed || '0 GB'}</p>
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Revenue Trend (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-32">
                {(() => {
                  const dailyRevenue = [0, 0, 0, 0, 0, 0, 0]
                  ledger.forEach(entry => {
                    const daysAgo = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    if (daysAgo >= 0 && daysAgo < 7) {
                      dailyRevenue[6 - daysAgo] += (entry.amount || 0)
                    }
                  })
                  const maxRevenue = Math.max(...dailyRevenue, 1)
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  const today = new Date().getDay()
                  const adjustedDays = [...days.slice(today), ...days.slice(0, today)]
                  
                  return dailyRevenue.map((revenue, index) => {
                    const height = (revenue / maxRevenue) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-[#C9A84C] rounded-t transition-all hover:bg-[#B8973B]"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="text-xs text-[#6B7280]">{adjustedDays[index]}</span>
                      </div>
                    )
                  })
                })()}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Total this week: ₱{ledger
                  .filter(entry => {
                    const daysAgo = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    return daysAgo >= 0 && daysAgo < 7
                  })
                  .reduce((sum, entry) => sum + (entry.amount || 0), 0)
                  .toLocaleString()}</span>
                <span className="text-[#1F2937] font-medium">{ledger.length} transactions</span>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Pending Payments</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{pendingPayments.length}</p>
                </div>
                
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Active Vouchers</p>
                  <p className="text-2xl font-serif text-[#1F2937]">{vouchers.length}</p>
                </div>
                
                <div className="p-4 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Total Revenue</p>
                  <p className="text-2xl font-serif text-[#1F2937]">₱{ledger.reduce((sum, entry) => sum + (entry.amount || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Activity Distribution */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Activity Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#1F2937]">Galleries</span>
                    <span className="text-sm text-[#6B7280]">{infrastructure?.activeGalleries || 0}</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                    <div 
                      className="h-3 bg-[#C9A84C] rounded-full transition-all"
                      style={{ width: `${Math.min(((infrastructure?.activeGalleries || 0) / Math.max(infrastructure?.totalUsers || 1, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#1F2937]">Photos per Gallery</span>
                    <span className="text-sm text-[#6B7280]">{infrastructure?.activeGalleries ? Math.round((infrastructure?.totalPhotos || 0) / infrastructure.activeGalleries) : 0}</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                    <div 
                      className="h-3 bg-[#059669] rounded-full transition-all"
                      style={{ width: `${Math.min(((infrastructure?.activeGalleries ? (infrastructure?.totalPhotos || 0) / infrastructure.activeGalleries : 0) / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#1F2937]">Storage Efficiency</span>
                    <span className="text-sm text-[#6B7280]">95% Savings</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                    <div className="h-3 bg-[#6366F1] rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingPayments.length > 0 && (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg text-left hover:bg-[#FDE68A] transition-colors"
                  >
                    <p className="text-sm font-medium text-[#92400E] mb-1">
                      {pendingPayments.length} Payment{pendingPayments.length !== 1 ? 's' : ''} Pending
                    </p>
                    <p className="text-xs text-[#92400E]">Review and verify</p>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('vouchers')}
                  className="p-4 bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg text-left hover:bg-[#BFDBFE] transition-colors"
                >
                  <p className="text-sm font-medium text-[#1E40AF] mb-1">
                    {vouchers.length} Active Voucher{vouchers.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[#1E40AF]">Manage discount codes</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-[#F3E8FF] border border-[#E9D5FF] rounded-lg text-left hover:bg-[#E9D5FF] transition-colors"
                >
                  <p className="text-sm font-medium text-[#6B21A8] mb-1">
                    {infrastructure?.totalUsers || 0} Total Users
                  </p>
                  <p className="text-xs text-[#6B21A8]">Manage accounts</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {pendingPayments.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center text-[#6B7280]">
                No pending payments
              </div>
            ) : (
              pendingPayments.map((payment) => (
                <div key={payment.id} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                        <Users size={24} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-[#1F2937]">
                          {payment.profiles?.full_name || payment.profiles?.email}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          {payment.galleries?.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif text-[#1F2937] font-bold">
                        ₱{payment.amount}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Details */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">
                            Reference Number
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="px-4 py-3 bg-[#F3F4F6] rounded-lg text-xl font-mono font-bold text-[#1F2937]">
                              {payment.reference_number}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(payment.reference_number)}
                              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                              title="Copy reference number"
                            >
                              <Copy size={16} className="text-[#6B7280]" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Receipt */}
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
                          Receipt Screenshot
                        </label>
                        {payment.receipt_url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxReceiptUrl(payment.receipt_url)}
                            className="block w-full"
                          >
                            <img
                              src={payment.receipt_url}
                              alt="Receipt screenshot"
                              className="w-full h-64 object-cover border border-[#E5E7EB] rounded-lg hover:border-[#C9A84C] transition-colors cursor-pointer"
                            />
                          </button>
                        ) : (
                          <div className="w-full h-64 border-2 border-dashed border-[#D1D5DB] rounded-lg flex items-center justify-center bg-[#F9FAFB]">
                            <span className="text-sm text-[#9CA3AF]">No receipt uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex gap-3">
                      <button 
                        onClick={() => handlePaymentAction(payment.id, 'approve')}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#059669] text-white font-medium text-sm hover:bg-[#047857] transition-colors rounded-lg"
                      >
                        <Check size={18} />
                        <span>Approve Payment</span>
                      </button>
                      <button 
                        onClick={() => handlePaymentAction(payment.id, 'reject')}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-[#EF4444] text-sm hover:bg-[#FEF2F2] transition-colors rounded-lg"
                        title="Reject Payment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB]">
              <h2 className="font-serif text-xl text-[#1F2937]">Transaction History</h2>
            </div>
            {allTransactions.length === 0 ? (
              <div className="p-12 text-center text-[#6B7280]">
                No transaction history
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {allTransactions.map((entry) => {
                  const isRejected = entry.status === 'rejected'
                  const user = entry.profiles || (entry.source === 'rejected' ? { full_name: entry.profiles?.full_name, email: entry.profiles?.email } : null)
                  const gallery = entry.galleries || (entry.source === 'rejected' ? { title: entry.galleries?.title } : null)
                  
                  return (
                    <div key={entry.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-lg text-[#1F2937]">
                            {gallery?.title || entry.payment_type === 'b2b_subscription' ? 'B2B Subscription' : 'Event Payment'}
                          </h3>
                          <p className="text-sm text-[#6B7280]">
                            {user?.full_name || user?.email || 'Unknown user'}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                          {entry.reference_number && (
                            <p className="text-xs text-[#6B7280] mt-1">
                              Ref: {entry.reference_number}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-serif ${isRejected ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                            ₱{(entry.amount || 0).toLocaleString()}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            isRejected
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : entry.status === 'approved' || entry.status === 'completed'
                              ? 'bg-[#D1FAE5] text-[#059669]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}>
                            {isRejected ? 'Rejected' : entry.status === 'completed' ? 'Completed' : entry.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#1F2937]">Vouchers</h2>
              <button
                onClick={() => setShowVoucherModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white font-medium text-sm hover:bg-[#374151] transition-colors rounded-lg"
              >
                <Plus size={18} />
                <span>Create</span>
              </button>
            </div>
            
            {vouchers.length === 0 ? (
              <div className="p-12 text-center text-[#6B7280]">
                No vouchers created
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-mono text-lg text-[#1F2937]">
                          {voucher.code}
                        </h3>
                        <p className="text-sm text-[#6B7280] mt-1">
                          ₱{voucher.discount_amount} discount
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {voucher.current_uses} / {voucher.max_uses} uses
                        </p>
                      </div>
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                        voucher.current_uses >= voucher.max_uses
                          ? 'bg-[#FECDD3] text-[#DC2626]'
                          : 'bg-[#D1FAE5] text-[#059669]'
                      }`}>
                        {voucher.current_uses >= voucher.max_uses ? 'Exhausted' : 'Active'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#1F2937]">Users</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserTypeFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    userTypeFilter === 'all'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setUserTypeFilter('b2c')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    userTypeFilter === 'b2c'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  B2C
                </button>
                <button
                  onClick={() => setUserTypeFilter('b2b')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    userTypeFilter === 'b2b'
                      ? 'bg-[#1F2937] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  B2B
                </button>
              </div>
            </div>
            {loadingUsers ? (
              <div className="p-12 text-center text-[#6B7280]">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-[#6B7280]">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {users
                  .filter(user => userTypeFilter === 'all' || user.user_type === userTypeFilter)
                  .map((user) => (
                  <div key={user.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-lg text-[#1F2937]">
                          {user.full_name || user.email}
                        </h3>
                        <p className="text-sm text-[#6B7280]">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-[#6B7280]">
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.is_admin ? (
                          <div className="px-3 py-1 bg-[#D1FAE5] text-[#059669] text-xs font-medium rounded-full flex items-center gap-1">
                            <Shield size={14} />
                            Admin
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-full">
                            User
                          </div>
                        )}
                        <button
                          onClick={() => toggleUserType(user.id, user.user_type)}
                          className="px-3 py-1.5 text-xs font-medium text-[#1F2937] border border-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                          title={`Switch to ${user.user_type === 'b2c' ? 'B2B' : 'B2C'}`}
                        >
                          {user.user_type === 'b2c' ? 'Make B2B' : 'Make B2C'}
                        </button>
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className={`p-2 transition-colors ${
                            user.is_admin
                              ? 'text-[#DC2626] hover:text-[#B91C1C]'
                              : 'text-[#059669] hover:text-[#047857]'
                          }`}
                          title={user.is_admin ? 'Revoke admin' : 'Make admin'}
                        >
                          {user.is_admin ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-6">Payment Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  value={paymentSettingsForm.amount}
                  onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={paymentSettingsForm.recipient_name}
                  onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, recipient_name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  GCash Number
                </label>
                <input
                  type="text"
                  value={paymentSettingsForm.gcash_number}
                  onChange={(e) => setPaymentSettingsForm({...paymentSettingsForm, gcash_number: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  QR Code
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleQrCodeSelect}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1F2937] file:text-white hover:file:bg-[#374151]"
                  />
                  {(qrCodePreview || paymentSettingsForm.qr_code_url) && (
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">
                        QR Code Preview
                      </label>
                      <img 
                        src={qrCodePreview || paymentSettingsForm.qr_code_url}
                        alt="QR Code Preview"
                        className="w-48 h-48 object-contain border border-[#E5E7EB] rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdatePaymentSettings}
                  className="w-full py-3 bg-[#1F2937] text-white font-medium text-sm hover:bg-[#374151] transition-colors rounded-lg"
                >
                  Update Payment Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-4">Financial & Growth Metrics</h2>
            <p className="text-[#6B7280] mb-6">Track MRR, churn, storage efficiency, and infrastructure scaling projections.</p>
            <AdminFinancialAnalytics />
          </div>
        )}
      </main>

      {/* Create Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-6">
              Create Voucher
            </h2>
            
            <form onSubmit={handleCreateVoucher} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Discount Amount (₱)
                </label>
                <input
                  type="number"
                  value={voucherForm.discountAmount}
                  onChange={(e) => setVoucherForm({...voucherForm, discountAmount: e.target.value})}
                  placeholder="500"
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={voucherForm.maxUses}
                  onChange={(e) => setVoucherForm({...voucherForm, maxUses: e.target.value})}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] text-[#1F2937] placeholder-[#9CA3AF]"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="flex-1 px-4 py-3 border border-[#D1D5DB] font-medium text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1F2937] text-white font-medium text-sm hover:bg-[#374151] transition-colors rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Lightbox */}
      <AnimatePresence>
        {lightboxReceiptUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
            onClick={() => setLightboxReceiptUrl(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:text-[#C9A84C] transition-colors z-10"
              onClick={() => setLightboxReceiptUrl(null)}
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <img
                src={lightboxReceiptUrl}
                alt="Receipt screenshot full size"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Action Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-[#1F2937] mb-2">
                {confirmAction.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h3>
              <p className="text-sm text-[#6B7280] mb-6">
                {confirmAction.action === 'approve' 
                  ? 'Are you sure you want to approve this payment? This will activate the gallery.'
                  : 'Are you sure you want to reject this payment? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-3 border border-[#D1D5DB] font-medium text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPaymentAction}
                  className={`flex-1 px-4 py-3 font-medium text-sm text-white transition-colors rounded-lg ${
                    confirmAction.action === 'approve'
                      ? 'bg-[#059669] hover:bg-[#047857]'
                      : 'bg-[#EF4444] hover:bg-[#DC2626]'
                  }`}
                >
                  {confirmAction.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
