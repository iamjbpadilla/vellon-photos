import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { processImage, validateImageFile } from '@/lib/sharp'

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Session tracking for soft-cap triggers (in production, use Redis)
const sessionStore = new Map<string, { uploads: number; startTime: number; flagged: boolean }>()

function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

function checkSoftCap(sessionId: string, maxUploads: number = 500, windowMs: number = 3600000): { allowed: boolean; flagged: boolean } {
  const now = Date.now()
  const session = sessionStore.get(sessionId)

  if (!session || now > session.startTime + windowMs) {
    // New session
    sessionStore.set(sessionId, { uploads: 1, startTime: now, flagged: false })
    return { allowed: true, flagged: false }
  }

  session.uploads++

  // Check if session should be flagged
  if (!session.flagged && session.uploads >= maxUploads) {
    session.flagged = true
    return { allowed: true, flagged: true }
  }

  // If already flagged, still allow but return flagged status
  return { allowed: true, flagged: session.flagged }
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Check rate limit (30 uploads per minute per IP)
    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please wait a moment.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const galleryId = formData.get('gallery_id') as string
    const uploadedBy = formData.get('uploaded_by') as string || 'Guest'
    const sessionId = formData.get('session_id') as string || `${ip}-${galleryId}`

    if (!file || !galleryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check soft-cap triggers (500 uploads per hour per session)
    const softCapCheck = checkSoftCap(sessionId, 500, 3600000)
    if (softCapCheck.flagged) {
      // Flag the upload for admin review
      console.warn(`Soft-cap triggered for session ${sessionId}: excessive upload volume`)
    }

    // Validate gallery exists and is active
    const { data: gallery, error: galleryError } = await supabaseAdmin
      .from('galleries')
      .select('*, profiles!inner(user_type)')
      .eq('id', galleryId)
      .eq('is_active', true)
      .single()

    if (galleryError || !gallery) {
      return NextResponse.json(
        { error: 'Gallery not found or not active' },
        { status: 404 }
      )
    }

    // Check B2C soft cap (2,000 photos per gallery)
    if (gallery.profiles.user_type === 'b2c') {
      const { count } = await supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)

      if (count && count >= 2000) {
        return NextResponse.json(
          { 
            error: 'This event has reached its photo limit. For extended storage, please contact support.',
            code: 'SOFT_CAP_REACHED',
            currentCount: count,
            maxCount: 2000
          },
          { status: 429 }
        )
      }
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // File size check
    const fileSizeMB = buffer.length / (1024 * 1024)
    
    // Reject files that are too large
    if (fileSizeMB > 50) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB for guest uploads.' },
        { status: 400 }
      )
    }

    // Check for suspicious file patterns (e.g., non-image files with image extensions)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    
    if (!allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and HEIC are allowed.' },
        { status: 400 }
      )
    }

    // Process image with Sharp (Optimized for speed - single output)
    const processed = await processImage(buffer, {
      previewMaxDimension: 800,
      previewTargetSizeKB: 150,
      masterMaxDimension: 800, // Same as preview for guest uploads (no master needed)
      masterQuality: 75,
      useAVIF: false,
    })

    // Upload preview to public bucket (JPEG for faster processing)
    const previewExtension = 'jpg'
    const previewFileName = `${galleryId}/guest/${Date.now()}_preview.${previewExtension}`
    const { error: previewError } = await supabaseAdmin.storage
      .from('previews')
      .upload(previewFileName, processed.previewBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (previewError) {
      return NextResponse.json(
        { error: 'Failed to upload preview' },
        { status: 500 }
      )
    }

    // Get public URL for preview
    const { data: previewUrlData } = supabaseAdmin.storage
      .from('previews')
      .getPublicUrl(previewFileName)

    // Get current position for this gallery
    const { data: positionData } = await supabaseAdmin
      .from('photos')
      .select('position')
      .eq('gallery_id', galleryId)
      .order('position', { ascending: false })
      .limit(1)
    
    const nextPosition = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0

    // Store photo directly in photos table (guest uploads appear immediately)
    const { data: photo, error: dbError } = await supabaseAdmin
      .from('photos')
      .insert({
        gallery_id: galleryId,
        preview_url: previewUrlData.publicUrl,
        master_url: previewUrlData.publicUrl, // Use preview as master for guest uploads
        blurhash: processed.blurhash,
        position: nextPosition,
        guest_tags: { uploaded_by: uploadedBy },
      })
      .select()
      .single()

    if (dbError) {
      // Rollback storage upload
      await supabaseAdmin.storage.from('previews').remove([previewFileName])
      return NextResponse.json(
        { error: 'Failed to save photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      photo,
      message: 'Photo uploaded successfully.' 
    }, { status: 201 })
  } catch (error) {
    console.error('Guest upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
