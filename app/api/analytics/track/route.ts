import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { type, gallery_id, photo_id, session_id, data } = body

    if (!type || !gallery_id || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'page_view':
        await supabaseAdmin.from('gallery_page_views').insert({
          gallery_id,
          session_id,
          referrer: data?.referrer,
          user_agent: data?.user_agent
        })
        break

      case 'photo_interaction':
        if (!photo_id || !data?.interaction_type) {
          return NextResponse.json(
            { error: 'Missing photo_id or interaction_type' },
            { status: 400 }
          )
        }
        await supabaseAdmin.from('photo_interactions').insert({
          gallery_id,
          photo_id,
          session_id,
          interaction_type: data.interaction_type
        })
        break

      case 'download':
        if (!photo_id || !data?.downloaded_by) {
          return NextResponse.json(
            { error: 'Missing photo_id or downloaded_by' },
            { status: 400 }
          )
        }
        await supabaseAdmin.from('download_audit_logs').insert({
          gallery_id,
          photo_id,
          downloaded_by: data.downloaded_by,
          download_code: data?.download_code,
          file_size_bytes: data?.file_size_bytes
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid tracking type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
