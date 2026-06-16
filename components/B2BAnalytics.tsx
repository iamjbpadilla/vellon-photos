'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Download, Eye, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface B2BAnalyticsProps {
  userId: string
  galleries: any[]
}

interface AnalyticsData {
  totalViews: number
  uniqueSessions: number
  totalInteractions: number
  totalDownloads: number
  topPhotos: { photo_id: string; count: number }[]
  dailyViews: { date: string; views: number }[]
  downloadLogs: {
    downloaded_by: string
    downloaded_at: string
    photo_id: string
    file_size_bytes: number
  }[]
}

export default function B2BAnalytics({ userId, galleries }: B2BAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGallery, setSelectedGallery] = useState<string | 'all'>('all')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedGallery])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const galleryIds = selectedGallery === 'all' 
        ? galleries.map(g => g.id)
        : [selectedGallery]

      // Fetch page views
      const { data: views } = await supabase
        .from('gallery_page_views')
        .select('gallery_id, session_id, viewed_at')
        .in('gallery_id', galleryIds)

      // Fetch photo interactions
      const { data: interactions } = await supabase
        .from('photo_interactions')
        .select('gallery_id, photo_id, interaction_type, interacted_at')
        .in('gallery_id', galleryIds)

      // Fetch download logs
      const { data: downloads } = await supabase
        .from('download_audit_logs')
        .select('gallery_id, photo_id, downloaded_by, downloaded_at, file_size_bytes')
        .in('gallery_id', galleryIds)
        .order('downloaded_at', { ascending: false })
        .limit(20)

      // Calculate metrics
      const uniqueSessions = new Set(views?.map(v => v.session_id) || []).size
      const totalViews = views?.length || 0
      const totalInteractions = interactions?.length || 0
      const totalDownloads = downloads?.length || 0

      // Top photos by interactions
      const photoCounts = new Map<string, number>()
      interactions?.forEach(i => {
        photoCounts.set(i.photo_id, (photoCounts.get(i.photo_id) || 0) + 1)
      })
      const topPhotos = Array.from(photoCounts.entries())
        .map(([photo_id, count]) => ({ photo_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Daily views (last 7 days)
      const dailyViews: { date: string; views: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayViews = views?.filter(v => 
          v.viewed_at.startsWith(dateStr)
        ).length || 0
        dailyViews.push({ date: dateStr, views: dayViews })
      }

      setAnalytics({
        totalViews,
        uniqueSessions,
        totalInteractions,
        totalDownloads,
        topPhotos,
        dailyViews,
        downloadLogs: downloads || []
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B7280]">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-[#6B7280]">
        No analytics data available
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Gallery Filter */}
      <div className="flex items-center gap-4">
        <select
          value={selectedGallery}
          onChange={(e) => setSelectedGallery(e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20"
        >
          <option value="all">All Events</option>
          {galleries.map(gallery => (
            <option key={gallery.id} value={gallery.id}>
              {gallery.title}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#F3F4F6] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={20} className="text-[#1F2937]" />
            <span className="text-xs text-[#6B7280]">Total Views</span>
          </div>
          <p className="text-2xl font-serif text-[#1F2937]">{analytics.totalViews.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-[#F3F4F6] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-[#1F2937]" />
            <span className="text-xs text-[#6B7280]">Unique Guests</span>
          </div>
          <p className="text-2xl font-serif text-[#1F2937]">{analytics.uniqueSessions.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-[#F3F4F6] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-[#1F2937]" />
            <span className="text-xs text-[#6B7280]">Interactions</span>
          </div>
          <p className="text-2xl font-serif text-[#1F2937]">{analytics.totalInteractions.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-[#F3F4F6] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Download size={20} className="text-[#1F2937]" />
            <span className="text-xs text-[#6B7280]">Downloads</span>
          </div>
          <p className="text-2xl font-serif text-[#1F2937]">{analytics.totalDownloads.toLocaleString()}</p>
        </div>
      </div>

      {/* Traffic Graph */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="font-serif text-lg text-[#1F2937] mb-4">Gallery Traffic (Last 7 Days)</h3>
        <div className="flex items-end gap-2 h-48">
          {analytics.dailyViews.map((day, index) => {
            const maxViews = Math.max(...analytics.dailyViews.map(d => d.views), 1)
            const height = (day.views / maxViews) * 100
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-[#C9A84C] rounded-t transition-all hover:bg-[#B8973B]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-xs text-[#6B7280]">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Popular Photos */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="font-serif text-lg text-[#1F2937] mb-4">Most Popular Photos</h3>
        {analytics.topPhotos.length === 0 ? (
          <p className="text-[#6B7280]">No interaction data yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.topPhotos.map((photo, index) => (
              <div key={photo.photo_id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#6B7280] w-6">#{index + 1}</span>
                <div className="flex-1 h-8 bg-[#F3F4F6] rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-[#C9A84C] transition-all"
                    style={{ width: `${(photo.count / analytics.topPhotos[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#1F2937] w-20 text-right">{photo.count} interactions</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download Audit Log */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="font-serif text-lg text-[#1F2937] mb-4">Download Audit Log</h3>
        {analytics.downloadLogs.length === 0 ? (
          <p className="text-[#6B7280]">No downloads yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.downloadLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">{log.downloaded_by}</p>
                  <p className="text-xs text-[#6B7280]">
                    {new Date(log.downloaded_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#1F2937]">
                    {(log.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-[#6B7280]">Master file</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
