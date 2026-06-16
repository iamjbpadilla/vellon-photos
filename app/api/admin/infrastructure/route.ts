import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active galleries
    const { data: activeGalleriesData } = await supabaseAdmin
      .from('galleries')
      .select('id')
      .eq('is_active', true)

    const activeGalleries = activeGalleriesData?.length || 0

    // Get total photos from active galleries only
    let totalPhotos = 0
    if (activeGalleriesData && activeGalleriesData.length > 0) {
      const activeGalleryIds = activeGalleriesData.map(g => g.id)
      const { count } = await supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .in('gallery_id', activeGalleryIds)
      totalPhotos = count || 0
    }

    // Get user type breakdown
    const { data: b2cUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'b2c')

    const { data: b2bUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'b2b')

    // Get revenue metrics
    const { data: ledger } = await supabaseAdmin
      .from('payment_ledger')
      .select('amount')

    const totalTransactions = ledger?.length || 0
    const mrr = ledger?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

    // Calculate storage (simplified - in production, use Supabase storage API)
    const storageUsed = '0 GB' // This would be calculated from actual storage usage

    const infrastructure = {
      totalUsers: totalUsers || 0,
      activeGalleries: activeGalleries || 0,
      totalPhotos: totalPhotos || 0,
      storageUsed,
      b2cUsers: b2cUsers || 0,
      b2bUsers: b2bUsers || 0,
      mrr,
      totalTransactions
    }

    return NextResponse.json({ infrastructure })
  } catch (error) {
    console.error('Infrastructure fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
