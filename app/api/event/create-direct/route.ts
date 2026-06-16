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
    const { eventName, eventDate, eventSlug } = await request.json()

    if (!eventName || !eventDate || !eventSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if slug already exists
    const { data: existingGallery } = await supabaseAdmin
      .from('galleries')
      .select('id')
      .eq('slug', eventSlug)
      .single()

    if (existingGallery) {
      return NextResponse.json(
        { error: 'This URL slug is already taken' },
        { status: 400 }
      )
    }

    // Generate secure code
    const secureCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create gallery (event) with active status for B2B users
    const { data: gallery, error: galleryError } = await supabaseAdmin
      .from('galleries')
      .insert({
        user_id: user.id,
        title: eventName,
        slug: eventSlug,
        secure_code: secureCode,
        is_active: true,
        theme_preset: 'heritage',
        canvas_tone: 'linen',
        event_date: eventDate,
      })
      .select()
      .single()

    if (galleryError || !gallery) {
      console.error('Gallery creation error:', galleryError)
      return NextResponse.json(
        { error: galleryError?.message || 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      gallery
    })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
