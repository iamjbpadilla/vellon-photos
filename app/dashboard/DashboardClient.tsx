'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Upload, Image as ImageIcon, LogOut, Share2, Eye, Calendar, CreditCard, Lock, Clock, QrCode, Download, Users, Settings, HardDrive, AlertCircle, CheckCircle } from 'lucide-react'
import B2BSubscriptionManager from '@/components/B2BSubscriptionManager'
import B2BAnalytics from '@/components/B2BAnalytics'
import { Profile, Gallery } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import CreateEventModal from '@/components/CreateEventModal'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import ConfirmationModal from '@/components/ConfirmationModal'
import ToastContainer, { useToast } from '@/components/Toast'

interface DashboardClientProps {
  profile: Profile
  galleries: Gallery[]
  userId: string
  refreshGalleries: () => Promise<void>
}

interface GalleryWithPhotoCount extends Gallery {
  photo_count?: number
}

export default function DashboardClient({ profile, galleries, userId, refreshGalleries }: DashboardClientProps) {
  const router = useRouter()
  const [galleryPhotoCounts, setGalleryPhotoCounts] = useState<{[key: string]: number}>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrGallery, setQrGallery] = useState<Gallery | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<'galleries' | 'analytics' | 'tools' | 'storage' | 'billings'>('galleries')
  
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

  const isTrial = !profile.is_verified
  const isB2B = profile.user_type === 'b2b'

  // Calculate total storage usage for B2B
  const totalPhotos = Object.values(galleryPhotoCounts).reduce((sum, count) => sum + count, 0)
  const totalPhotoCap = galleries.reduce((sum, gallery) => sum + (gallery.fair_use_cap_photos || 0), 0)
  const totalStorageCap = galleries.reduce((sum, gallery) => sum + (gallery.fair_use_cap_storage_gb || 0), 0)
  const photoUsagePercent = totalPhotoCap > 0 ? (totalPhotos / totalPhotoCap) * 100 : 0
  const storageUsagePercent = totalStorageCap > 0 ? 0 : 0 // Storage calculation would need actual file sizes

  // Generate QR code when gallery is selected
  useEffect(() => {
    if (qrGallery) {
      const code = qrGallery.secure_code
      QRCode.toDataURL(code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      }, (error, dataUrl) => {
        if (error) {
          console.error('Failed to generate QR code:', error)
        } else {
          setQrCodeDataUrl(dataUrl)
        }
      })
    }
  }, [qrGallery])
  useEffect(() => {
    async function fetchPhotoCounts() {
      const counts: {[key: string]: number} = {}
      for (const gallery of galleries) {
        const { count } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('gallery_id', gallery.id)
        counts[gallery.id] = count || 0
      }
      setGalleryPhotoCounts(counts)
    }
    if (galleries.length > 0) {
      fetchPhotoCounts()
    }
  }, [galleries])

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
              {profile.full_name || profile.email}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#1F2937] mb-2">
            {isB2B ? 'Studio Dashboard' : 'My Events'}
          </h1>
          <p className="text-[#6B7280]">
            {galleries.length} {galleries.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-[#E5E7EB]">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('galleries')}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === 'galleries'
                  ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
              }`}
            >
              {isB2B ? 'Galleries' : 'Events'}
            </button>
            {isB2B && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'tools'
                      ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  Business Tools
                </button>
                <button
                  onClick={() => setActiveTab('storage')}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'storage'
                      ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  Storage
                </button>
                <button
                  onClick={() => setActiveTab('billings')}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'billings'
                      ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  Billings
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'galleries' && (
          <>
            {/* Quick Actions */}
            <div className="mb-12 flex gap-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-[#1F2937] text-white rounded-full font-semibold text-sm hover:bg-[#374151] transition-colors"
              >
                <Plus size={18} />
                <span>Create Event</span>
              </button>
            </div>

            {/* Galleries Grid */}
            {galleries.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-[#E5E7EB] rounded-lg">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F3F4F6] mb-6 rounded-full">
                  <ImageIcon size={40} className="text-[#9CA3AF]" />
                </div>
                <h2 className="text-2xl font-serif text-[#1F2937] mb-3">
                  No events yet
                </h2>
                <p className="text-[#6B7280] mb-8">
                  Create your first event to start sharing your photos
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#1F2937] text-white rounded-full font-semibold text-sm hover:bg-[#374151] transition-colors"
                >
                  <Plus size={18} />
                  <span>Create Event</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery) => {
                  const photoCount = galleryPhotoCounts[gallery.id] || 0
                  const isTrialGallery = gallery.title.toLowerCase().includes('trial')
                  const isUnpaid = !gallery.is_active && !isTrialGallery
                  
                  return (
                    <div key={gallery.id} className="group">
                      <div className="bg-white border border-[#E5E7EB] overflow-hidden hover:border-[#D1D5DB] transition-all rounded-xl shadow-sm p-5">
                        {/* Status Badge */}
                        <div className="mb-4">
                          {isTrialGallery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs font-semibold rounded-full">
                              <Lock size={12} />
                              Trial • 10 photos max
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-semibold rounded-full">
                              <Clock size={12} />
                              Pending Verification
                            </span>
                          )}
                          {gallery.is_active && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold rounded-full">
                              <Eye size={12} />
                              Active
                            </span>
                          )}
                        </div>
                        
                        {/* Gallery Info */}
                        <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-1 group-hover:text-[#6B7280] transition-colors">
                          {gallery.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-[#6B7280] mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(gallery.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ImageIcon size={12} />
                            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                          </span>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                          {isUnpaid ? (
                            <span className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F3F4F6] text-[#6B7280] text-sm font-medium rounded-lg">
                              <Clock size={16} />
                              <span>Pending Verification</span>
                            </span>
                          ) : (
                            <>
                              <Link
                                href={`/dashboard/studio/${gallery.slug}`}
                                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                                <span>View Event</span>
                              </Link>
                              <button
                                onClick={() => {
                                  setQrGallery(gallery)
                                  setShowQRModal(true)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] text-sm font-medium rounded-lg transition-colors"
                              >
                                <QrCode size={16} />
                                <span>QR</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && isB2B && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-4">Studio Performance Analytics</h2>
            <p className="text-[#6B7280] mb-6">Track gallery traffic, guest engagement, and download activity across your events.</p>
            <B2BAnalytics userId={userId} galleries={galleries} />
          </div>
        )}

        {activeTab === 'tools' && isB2B && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-4">Business Tools</h2>
            <p className="text-[#6B7280] mb-6">Professional tools to manage your photography business.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-[#E5E7EB] rounded-lg hover:border-[#D1D5DB] transition-colors">
                <Download size={24} className="text-[#1F2937] mb-3" />
                <h3 className="font-serif text-lg text-[#1F2937] mb-2">Download Links</h3>
                <p className="text-sm text-[#6B7280]">Generate secure download links for clients with expiration dates.</p>
              </div>
              <div className="p-6 border border-[#E5E7EB] rounded-lg hover:border-[#D1D5DB] transition-colors">
                <QrCode size={24} className="text-[#1F2937] mb-3" />
                <h3 className="font-serif text-lg text-[#1F2937] mb-2">QR Code Designer</h3>
                <p className="text-sm text-[#6B7280]">Create custom QR cards with your branding for events.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && isB2B && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-4">Storage & Usage Limits</h2>
            <p className="text-[#6B7280] mb-8">Monitor your storage usage and fair use caps across all events.</p>

            {/* Overall Status Card */}
            <div className={`p-6 rounded-xl mb-8 ${
              photoUsagePercent >= 90
                ? 'bg-[#FEF2F2] border border-[#FECACA]'
                : photoUsagePercent >= 70
                ? 'bg-[#FFFBEB] border border-[#FDE68A]'
                : 'bg-[#F0FDF4] border border-[#BBF7D0]'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  photoUsagePercent >= 90
                    ? 'bg-[#DC2626]'
                    : photoUsagePercent >= 70
                    ? 'bg-[#D97706]'
                    : 'bg-[#059669]'
                }`}>
                  {photoUsagePercent >= 90 ? (
                    <AlertCircle size={24} className="text-white" />
                  ) : (
                    <CheckCircle size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-serif text-lg font-semibold mb-1 ${
                    photoUsagePercent >= 90
                      ? 'text-[#991B1B]'
                      : photoUsagePercent >= 70
                      ? 'text-[#92400E]'
                      : 'text-[#065F46]'
                  }`}>
                    {photoUsagePercent >= 90
                      ? 'Approaching Storage Limit'
                      : photoUsagePercent >= 70
                      ? 'Storage Usage Moderate'
                      : 'Storage Usage Healthy'
                    }
                  </h3>
                  <p className={`text-sm ${
                    photoUsagePercent >= 90
                      ? 'text-[#B91C1C]'
                      : photoUsagePercent >= 70
                      ? 'text-[#A16207]'
                      : 'text-[#047857]'
                  }`}>
                    {photoUsagePercent >= 90
                      ? 'You are nearing your photo upload limit. Consider upgrading or archiving older events.'
                      : photoUsagePercent >= 70
                      ? 'You have moderate storage usage. Keep an eye on your uploads.'
                      : 'Your storage usage is well within limits.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Photo Usage */}
              <div className="p-6 border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <ImageIcon size={20} className="text-[#1F2937]" />
                  <h3 className="font-serif text-lg text-[#1F2937]">Photo Usage</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-serif text-[#1F2937]">{totalPhotos.toLocaleString()}</span>
                    <span className="text-sm text-[#6B7280]">of {totalPhotoCap.toLocaleString()} photos</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        photoUsagePercent >= 90
                          ? 'bg-[#DC2626]'
                          : photoUsagePercent >= 70
                          ? 'bg-[#D97706]'
                          : 'bg-[#059669]'
                      }`}
                      style={{ width: `${Math.min(photoUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-[#6B7280]">
                  {totalPhotoCap - totalPhotos} photos remaining
                </p>
              </div>

              {/* Storage Usage */}
              <div className="p-6 border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive size={20} className="text-[#1F2937]" />
                  <h3 className="font-serif text-lg text-[#1F2937]">Storage Usage</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-serif text-[#1F2937]">--</span>
                    <span className="text-sm text-[#6B7280]">of {totalStorageCap} GB</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                    <div className="h-3 rounded-full bg-[#059669]" style={{ width: '0%' }} />
                  </div>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Storage calculation coming soon
                </p>
              </div>
            </div>

            {/* Per-Gallery Breakdown */}
            <div>
              <h3 className="font-serif text-lg text-[#1F2937] mb-4">Per-Event Usage</h3>
              <div className="space-y-4">
                {galleries.map((gallery) => {
                  const photoCount = galleryPhotoCounts[gallery.id] || 0
                  const photoCap = gallery.fair_use_cap_photos || 0
                  const usagePercent = photoCap > 0 ? (photoCount / photoCap) * 100 : 0
                  const isTrial = gallery.title.toLowerCase().includes('trial')
                  
                  return (
                    <div key={gallery.id} className="p-4 border border-[#E5E7EB] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#1F2937]">{gallery.title}</h4>
                          {isTrial && (
                            <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs font-medium rounded-full">
                              Trial
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-[#6B7280]">
                          {photoCount} / {photoCap} photos
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usagePercent >= 90
                              ? 'bg-[#DC2626]'
                              : usagePercent >= 70
                              ? 'bg-[#D97706]'
                              : 'bg-[#059669]'
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billings' && isB2B && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-4">Subscription & Billing</h2>
            <p className="text-[#6B7280] mb-8">Manage your B2B subscription, view invoices, and update payment methods.</p>
            <B2BSubscriptionManager userId={userId} />
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshGalleries}
        userType={profile.user_type}
      />

      {/* QR Code Modal */}
      {showQRModal && qrGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-[#1F2937]">Event QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-[#F3F4F6] rounded-lg">
                <Upload size={20} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border border-[#E5E7EB]">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Event QR Code" className="w-full h-full p-2" />
                ) : (
                  <QrCode size={64} className="text-[#6B7280]" />
                )}
              </div>
              <p className="text-sm text-[#6B7280] text-center">Scan to upload photos to this event</p>
              <div className="w-full p-3 bg-[#F3F4F6] rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Event Access Code</p>
                <p className="text-sm font-medium text-[#1F2937] truncate">{qrGallery.secure_code}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrGallery.secure_code)
                  success('Access code copied to clipboard')
                }}
                className="w-full px-4 py-3 bg-[#1F2937] text-white text-sm font-medium rounded-lg hover:bg-[#374151] transition-colors"
              >
                Copy Access Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        variant={confirmation.variant}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
