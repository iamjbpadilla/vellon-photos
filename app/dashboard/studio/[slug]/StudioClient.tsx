'use client'

import { useState, useEffect } from 'react'
import { Gallery, Photo, Profile } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Share2, Download, BarChart3, Copy, Check, X, Link as LinkIcon, GripVertical, QrCode, Calendar, Eye, Clock, Printer, Type, Layout } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import ConfirmationModal from '@/components/ConfirmationModal'
import ToastContainer, { useToast } from '@/components/Toast'

interface StudioClientProps {
  gallery: Gallery
  photos: Photo[]
  userProfile: Profile | null
}

export default function StudioClient({ gallery, photos, userProfile }: StudioClientProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [photoList, setPhotoList] = useState(photos)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadEmail, setDownloadEmail] = useState('')
  const [downloadLinks, setDownloadLinks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'analytics' | 'qr' | 'settings'>('overview')
  const [description, setDescription] = useState(gallery.description || '')
  const [location, setLocation] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [qrLayout, setQrLayout] = useState({
    showTitle: true,
    showCode: true,
    showInstructions: true,
    showDate: false,
    showLogo: false,
    qrSize: 150,
    layout: 'minimal' as 'minimal' | 'elegant' | 'modern' | 'classic' | 'wedding' | 'corporate',
    paperSize: 'a4' as 'a4' | 'letter' | 'square' | 'instagram',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#C9A84C'
  })
  
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

  // Calculate storage retention date (15 days from event date or creation)
  const storageRetentionDate = new Date(
    (gallery.event_date ? new Date(gallery.event_date) : new Date(gallery.created_at)).getTime() + 15 * 24 * 60 * 60 * 1000
  )
  const daysUntilExpiry = Math.ceil((storageRetentionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  // Generate QR code
  useEffect(() => {
    const url = `${window.location.origin}/e/${gallery.slug}`
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF'
      }
    }, (error, dataUrl) => {
      if (!error) setQrCodeDataUrl(dataUrl)
    })
  }, [gallery.secure_code])

  const handleCopyLink = () => {
    const link = `${window.location.origin}/e/${gallery.secure_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newPhotoList = [...photoList]
    const [draggedPhoto] = newPhotoList.splice(draggedIndex, 1)
    newPhotoList.splice(dropIndex, 0, draggedPhoto)

    setPhotoList(newPhotoList)
    setDraggedIndex(null)

    // Update positions in database
    try {
      
      for (let i = 0; i < newPhotoList.length; i++) {
        await supabase
          .from('photos')
          .update({ position: i })
          .eq('id', newPhotoList[i].id)
      }
      success('Photo order updated successfully')
    } catch (err) {
      console.error('Failed to update photo positions:', err)
      error('Failed to update photo order')
    }
  }

  const handleCreateDownloadLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!downloadEmail) return

    setConfirmation({
      isOpen: true,
      title: 'Create Download Link',
      message: `Create a download link for ${downloadEmail}? This link will expire in 7 days.`,
      onConfirm: async () => {
        try {
          
          // Generate secure code
          const secureCode = Math.random().toString(36).substring(2, 8).toUpperCase()
          
          // Create download link
          const { data, error: dbError } = await supabase
            .from('download_links')
            .insert({
              gallery_id: gallery.id,
              email: downloadEmail,
              secure_code: secureCode,
              zip_url: '', // Will be generated when accessed
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            })
            .select()
            .single()

          if (dbError) throw dbError

          setDownloadLinks([...downloadLinks, data])
          setDownloadEmail('')
          setShowDownloadModal(false)
          success('Download link created successfully')
        } catch (err) {
          console.error('Failed to create download link:', err)
          error('Failed to create download link')
        }
      },
      variant: 'info'
    })
  }

  const handleSaveSettings = async () => {
    setConfirmation({
      isOpen: true,
      title: 'Save Settings',
      message: 'Are you sure you want to save these changes?',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('galleries')
            .update({
              description,
              // Add location field if it exists in the database
            })
            .eq('id', gallery.id)

          if (error) throw error
          success('Settings saved successfully')
        } catch (err) {
          console.error('Failed to save settings:', err)
          error('Failed to save settings')
        }
      },
      variant: 'info'
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-[#6B7280]" />
            </Link>
            <div>
              <h1 className="text-xl font-serif text-[#1F2937]">{gallery.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-full font-medium text-sm hover:bg-[#374151] transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mb-8 border-b border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'photos'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Photos
          </button>
          {userProfile?.user_type === 'b2b' && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-2 text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
              }`}
            >
              Analytics
            </button>
          )}
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'qr'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-[#1F2937] border-b-2 border-[#1F2937]'
                : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Gallery Settings
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Gallery Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#1F2937] mb-2">{gallery.title}</h1>
                <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {gallery.event_date ? new Date(gallery.event_date).toLocaleDateString() : new Date(gallery.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {gallery.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-lg">
                  <p className="text-2xl font-bold text-[#1F2937]">{photos.length}</p>
                  <p className="text-xs text-[#6B7280]">Photos</p>
                </div>
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-lg">
                  <p className="text-2xl font-bold text-[#1F2937]">{gallery.secure_code}</p>
                  <p className="text-xs text-[#6B7280]">Gallery Code</p>
                </div>
              </div>

              {/* Storage Info */}
              <div className="p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-[#92400E] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#92400E] mb-1">Photo Storage</p>
                    <p className="text-xs text-[#92400E]">
                      Photos stored until <span className="font-semibold">{storageRetentionDate.toLocaleDateString()}</span>
                      {daysUntilExpiry > 0 ? ` (${daysUntilExpiry} days remaining)` : ' (Expired)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href={`/e/${gallery.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1F2937] text-white font-medium rounded-lg hover:bg-[#374151] transition-colors"
                >
                  <Share2 size={18} />
                  <span>View Guest Gallery</span>
                </Link>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <Download size={18} />
                  <span>Create Download Link</span>
                </button>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-[#E5E7EB] rounded-lg">
              {qrCodeDataUrl && (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 mb-4" />
              )}
              <p className="text-sm text-[#6B7280] mb-4">Scan to view gallery</p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#1F2937] text-sm font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                <Copy size={14} />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'qr' ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Templates */}
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1F2937] mb-4">QR Templates</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'minimal', name: 'Minimal', icon: '✨', desc: 'Clean & simple' },
                  { id: 'elegant', name: 'Elegant', icon: '💎', desc: 'Sophisticated' },
                  { id: 'modern', name: 'Modern', icon: '🎨', desc: 'Bold & vibrant' },
                  { id: 'classic', name: 'Classic', icon: '📜', desc: 'Timeless' },
                  { id: 'wedding', name: 'Wedding', icon: '💒', desc: 'Romantic' },
                  { id: 'corporate', name: 'Corporate', icon: '🏢', desc: 'Professional' },
                ].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setQrLayout({ ...qrLayout, layout: template.id as any })}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      qrLayout.layout === template.id
                        ? 'border-[#1F2937] bg-[#F3F4F6]'
                        : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="text-sm font-medium text-[#1F2937]">{template.name}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{template.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview & Customization */}
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1F2937] mb-4">Preview & Customize</h2>
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-8 mb-6">
                <div 
                  id="qr-preview"
                  className="bg-white p-6 rounded-lg shadow-sm mx-auto"
                  style={{ 
                    backgroundColor: qrLayout.backgroundColor,
                    maxWidth: qrLayout.paperSize === 'a4' ? '210px' : qrLayout.paperSize === 'letter' ? '216px' : qrLayout.paperSize === 'square' ? '200px' : '200px',
                    aspectRatio: qrLayout.paperSize === 'square' ? '1/1' : qrLayout.paperSize === 'instagram' ? '1/1' : '210/297'
                  }}
                >
                  {qrLayout.showLogo && (
                    <div className="text-center mb-3">
                      <div className="text-2xl font-serif font-bold" style={{ color: qrLayout.accentColor }}>Vellon.photos</div>
                    </div>
                  )}
                  
                  {qrLayout.showTitle && (
                    <h3 className="text-lg font-serif font-bold text-center mb-2" style={{ color: qrLayout.textColor }}>{gallery.title}</h3>
                  )}
                  
                  {qrLayout.showDate && gallery.event_date && (
                    <p className="text-xs text-center mb-2" style={{ color: qrLayout.textColor }}>
                      {new Date(gallery.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  
                  {qrLayout.showCode && (
                    <p className="text-xs text-center mb-3" style={{ color: qrLayout.textColor }}>Code: {gallery.secure_code}</p>
                  )}
                  
                  <div className="flex justify-center mb-3">
                    {qrCodeDataUrl && (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code" 
                        style={{ width: `${qrLayout.qrSize}px`, height: `${qrLayout.qrSize}px` }}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                  
                  {qrLayout.showInstructions && (
                    <p className="text-xs text-center" style={{ color: qrLayout.textColor }}>
                      Scan to view and upload photos
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Paper Size */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Paper Size</label>
                  <div className="flex gap-2">
                    {(['a4', 'letter', 'square', 'instagram'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setQrLayout({ ...qrLayout, paperSize: size })}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          qrLayout.paperSize === size
                            ? 'bg-[#1F2937] text-white'
                            : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Size */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">QR Size: {qrLayout.qrSize}px</label>
                  <input
                    type="range"
                    min="80"
                    max={qrLayout.paperSize === 'square' || qrLayout.paperSize === 'instagram' ? 160 : 180}
                    step="10"
                    value={qrLayout.qrSize}
                    onChange={(e) => setQrLayout({ ...qrLayout, qrSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Background</label>
                    <input
                      type="color"
                      value={qrLayout.backgroundColor}
                      onChange={(e) => setQrLayout({ ...qrLayout, backgroundColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Text</label>
                    <input
                      type="color"
                      value={qrLayout.textColor}
                      onChange={(e) => setQrLayout({ ...qrLayout, textColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Accent</label>
                    <input
                      type="color"
                      value={qrLayout.accentColor}
                      onChange={(e) => setQrLayout({ ...qrLayout, accentColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Content Options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrLayout.showTitle}
                      onChange={(e) => setQrLayout({ ...qrLayout, showTitle: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <span className="text-sm text-[#1F2937]">Show Gallery Title</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrLayout.showCode}
                      onChange={(e) => setQrLayout({ ...qrLayout, showCode: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <span className="text-sm text-[#1F2937]">Show Gallery Code</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrLayout.showDate}
                      onChange={(e) => setQrLayout({ ...qrLayout, showDate: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <span className="text-sm text-[#1F2937]">Show Gallery Date</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrLayout.showLogo}
                      onChange={(e) => setQrLayout({ ...qrLayout, showLogo: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <span className="text-sm text-[#1F2937]">Show Logo</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrLayout.showInstructions}
                      onChange={(e) => setQrLayout({ ...qrLayout, showInstructions: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <span className="text-sm text-[#1F2937]">Show Instructions</span>
                  </label>
                </div>

                <button
                  onClick={async () => {
                    const preview = document.getElementById('qr-preview') as HTMLElement
                    if (preview) {
                      try {
                        const canvas = await html2canvas(preview, {
                          scale: 3,
                          backgroundColor: qrLayout.backgroundColor,
                          logging: false,
                          useCORS: true,
                          allowTaint: true
                        })
                        
                        const link = document.createElement('a')
                        link.download = `${gallery.slug}-qr-card.png`
                        link.href = canvas.toDataURL('image/png', 1.0)
                        link.click()
                        success('QR card downloaded successfully')
                      } catch (err) {
                        console.error('Error generating QR card:', err)
                        error('Failed to download QR card')
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1F2937] text-white font-medium rounded-lg hover:bg-[#374151] transition-colors"
                >
                  <Download size={18} />
                  <span>Download QR Card</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'photos' ? (
          <>
            {/* Photos Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-[#1F2937] mb-6">Photos</h2>
              
              {photoList.length === 0 ? (
                <div className="text-center py-32 border-2 border-dashed border-[#E5E7EB] rounded-xl">
                  <p className="text-[#6B7280]">No photos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photoList.map((photo, index) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`relative group cursor-move ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="aspect-square bg-[#F3F4F6] rounded-lg overflow-hidden relative">
                        <img
                          src={photo.preview_url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'analytics' ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="text-[#059669]" size={24} />
                  <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Total Downloads</span>
                </div>
                <p className="text-4xl font-serif text-[#1F2937]">{downloadLinks.length}</p>
                <p className="text-xs text-[#6B7280] mt-1">Links created</p>
              </div>
              
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <LinkIcon className="text-[#C9A84C]" size={24} />
                  <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Active Links</span>
                </div>
                <p className="text-4xl font-serif text-[#1F2937]">{downloadLinks.length + 1}</p>
                <p className="text-xs text-[#6B7280] mt-1">Including guest access</p>
              </div>
              
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-[#F472B6]" size={24} />
                  <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">Gallery Views</span>
                </div>
                <p className="text-4xl font-serif text-[#1F2937]">0</p>
                <p className="text-xs text-[#6B7280] mt-1">Unique visitors</p>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-serif text-[#1F2937] mb-6">Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-serif text-lg text-[#1F2937] mb-4">Photo Engagement</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Total Photos</span>
                      <span className="font-medium text-[#1F2937]">{photoList.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Most Viewed</span>
                      <span className="font-medium text-[#1F2937]">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Avg. View Time</span>
                      <span className="font-medium text-[#1F2937]">-</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-serif text-lg text-[#1F2937] mb-4">Download Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Total Downloads</span>
                      <span className="font-medium text-[#1F2937]">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Unique Downloaders</span>
                      <span className="font-medium text-[#1F2937]">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Avg. Download Size</span>
                      <span className="font-medium text-[#1F2937]">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Links Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-[#1F2937]">Delivery Links</h2>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-full font-medium text-sm hover:bg-[#374151] transition-colors"
                >
                  <Download size={16} />
                  <span>Create Download Link</span>
                </button>
              </div>
              
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#E5E7EB]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[#1F2937] mb-1">Guest Access Link</h3>
                      <p className="text-sm text-[#6B7280]">Share this link with your client for guest access</p>
                    </div>
                    <div className="px-3 py-1 bg-[#D1FAE5] text-[#059669] text-xs font-medium rounded-full">
                      Active
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/e/${gallery.secure_code}`}
                      readOnly
                      className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg text-[#1F2937] text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-[#1F2937] text-white rounded-lg font-medium text-sm hover:bg-[#374151] transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {downloadLinks.length > 0 && (
                  <div className="p-6">
                    <h4 className="font-serif text-lg text-[#1F2937] mb-4">Download Links</h4>
                    <div className="space-y-3">
                      {downloadLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-[#1F2937]">{link.email}</p>
                            <p className="text-xs text-[#6B7280]">
                              Expires: {new Date(link.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-[#D1FAE5] text-[#059669] text-xs font-medium rounded-full">
                            Active
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-serif text-[#1F2937] mb-2">Gallery Settings</h2>
            <p className="text-sm text-[#6B7280] mb-8">Customize your gallery details</p>

            <div className="space-y-6">
              {/* General Section */}
              <div>
                <h3 className="text-lg font-medium text-[#1F2937] mb-4">General</h3>
                <p className="text-sm text-[#6B7280] mb-6">Gallery details and media tags</p>

                <div className="space-y-4">
                  {/* Gallery Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Gallery Details
                    </label>
                    <input
                      type="text"
                      value={gallery.title}
                      readOnly
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg text-[#1F2937] text-sm"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">Gallery name cannot be changed after creation</p>
                  </div>

                  {/* Gallery Code */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Gallery Code
                    </label>
                    <input
                      type="text"
                      value={gallery.secure_code}
                      readOnly
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg text-[#1F2937] text-sm"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">Gallery code cannot be changed after creation</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description for your gallery..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-colors text-[#1F2937] text-sm placeholder-[#9CA3AF]"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter gallery location..."
                      className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-colors text-[#1F2937] text-sm placeholder-[#9CA3AF]"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-[#E5E7EB]">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-[#1F2937] text-white rounded-lg font-medium text-sm hover:bg-[#374151] transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-[#1F2937]">Share Gallery</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
              >
                <X size={20} className="text-[#6B7280]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Guest Access Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/e/${gallery.secure_code}`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg text-[#1F2937]"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-[#1F2937] text-white rounded-lg font-medium hover:bg-[#374151] transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-2">
                  This link allows guests to view the gallery with Ken Burns slideshow effect and upload photos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Link Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-[#1F2937]">Create Download Link</h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
              >
                <X size={20} className="text-[#6B7280]" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDownloadLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={downloadEmail}
                  onChange={(e) => setDownloadEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-colors text-[#1F2937] placeholder-[#9CA3AF]"
                  required
                />
              </div>
              
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-2">
                  This will create a secure download link valid for 7 days. The client will receive an email with the download instructions.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-4 py-3 border border-[#D1D5DB] font-medium text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1F2937] text-white font-medium text-sm hover:bg-[#374151] transition-colors rounded-lg"
                >
                  Create Link
                </button>
              </div>
            </form>
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
