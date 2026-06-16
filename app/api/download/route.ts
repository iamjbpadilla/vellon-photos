import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
// @ts-ignore
import archiver from 'archiver'

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const { email, secureCode, galleryId, filterFavorites } = await request.json()

    if (!email || !secureCode || !galleryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Check rate limiting
    const { data: attempt } = await supabaseAdmin
      .from('download_attempts')
      .select('*')
      .eq('ip_address', ip)
      .eq('gallery_id', galleryId)
      .single()

    if (attempt) {
      // Check if IP is locked
      if (attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please try again later.' },
          { status: 429 }
        )
      }

      // Check attempt count
      if (attempt.attempts >= 3) {
        // Lock IP for 2 hours
        const lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000)
        await supabaseAdmin
          .from('download_attempts')
          .update({ locked_until: lockedUntil.toISOString() })
          .eq('id', attempt.id)

        return NextResponse.json(
          { error: 'Too many failed attempts. Locked for 2 hours.' },
          { status: 429 }
        )
      }
    }

    // Verify gallery and secure code
    const { data: gallery, error: galleryError } = await supabaseAdmin
      .from('galleries')
      .select('*')
      .eq('id', galleryId)
      .eq('secure_code', secureCode)
      .single()

    if (galleryError || !gallery) {
      // Increment attempt count
      if (attempt) {
        await supabaseAdmin
          .from('download_attempts')
          .update({ attempts: attempt.attempts + 1 })
          .eq('id', attempt.id)
      } else {
        await supabaseAdmin
          .from('download_attempts')
          .insert({
            ip_address: ip,
            gallery_id: galleryId,
            attempts: 1,
          })
      }

      return NextResponse.json(
        { error: 'Invalid secure code' },
        { status: 401 }
      )
    }

    // Check if gallery is expired
    if (gallery.expired_archive) {
      return NextResponse.json(
        { error: 'This archive has expired. Contact support to restore.' },
        { status: 403 }
      )
    }

    // Check download seat limits (B2C: max 5 unique emails)
    if (gallery.user_type === 'b2c') {
      const { count } = await supabaseAdmin
        .from('download_links')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)
        .eq('email', email)

      if (count && count >= 5) {
        return NextResponse.json(
          { error: 'Download limit reached for this code.' },
          { status: 403 }
        )
      }
    }

    // Get photos for the gallery (filtered by favorites if requested)
    let photos
    if (filterFavorites) {
      // Get user ID from email to filter favorites
      const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Get favorited photos with proper join
      const { data: favoritePhotos } = await supabaseAdmin
        .from('client_favorites')
        .select('photos!inner(master_url)')
        .eq('user_id', user.id)
        .eq('gallery_id', galleryId)

      photos = favoritePhotos?.map((f: any) => f.photos) || []
    } else {
      // Get all photos for the gallery
      const { data: allPhotos } = await supabaseAdmin
        .from('photos')
        .select('master_url')
        .eq('gallery_id', galleryId)

      photos = allPhotos
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos found in gallery' },
        { status: 404 }
      )
    }

    // Generate ZIP file
    const zip = archiver('zip', { zlib: { level: 9 } })
    
    // Create a writable stream for the ZIP
    const chunks: Buffer[] = []
    zip.on('data', (chunk: Buffer) => chunks.push(chunk))
    
    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      zip.on('end', () => resolve(Buffer.concat(chunks)))
      zip.on('error', reject)
    })

    // Add each photo to the ZIP
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      try {
        const response = await fetch(photo.master_url)
        const buffer = Buffer.from(await response.arrayBuffer())
        zip.append(buffer, { name: `photo_${i + 1}.jpg` })
      } catch (error) {
        console.error(`Failed to fetch photo ${i}:`, error)
      }
    }

    zip.finalize()
    const zipBuffer = await zipPromise

    // Upload ZIP to storage
    const zipFileName = `${galleryId}/downloads/${Date.now()}.zip`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('masters')
      .upload(zipFileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Create signed URL (24-hour expiration)
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('masters')
      .createSignedUrl(zipFileName, 86400) // 24 hours

    if (!signedUrlData) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Store download link in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await supabaseAdmin
      .from('download_links')
      .insert({
        gallery_id: galleryId,
        email,
        secure_code: secureCode,
        zip_url: signedUrlData.signedUrl,
        expires_at: expiresAt.toISOString(),
      })

    // Reset attempt count on success
    if (attempt) {
      await supabaseAdmin
        .from('download_attempts')
        .update({ attempts: 0, locked_until: null })
        .eq('id', attempt.id)
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
