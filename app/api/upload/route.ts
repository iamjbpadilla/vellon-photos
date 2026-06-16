import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { processImage, validateImageFile } from '@/lib/sharp'

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const galleryId = formData.get('gallery_id') as string
    const userId = formData.get('user_id') as string
    const position = parseInt(formData.get('position') as string) || 0
    const chapter = formData.get('chapter') as string || null

    if (!file || !galleryId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user verification status for sandbox cap
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_verified, trial_ends_at, user_type')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check B2C soft cap (2,000 photos per gallery)
    if (profile.user_type === 'b2c') {
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

    // Sandbox policy: 5-photo/5MB cap for unverified trials
    if (!profile.is_verified) {
      // Check photo count
      const { count: photoCount } = await supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)

      if (photoCount && photoCount >= 5) {
        return NextResponse.json(
          { error: 'Trial limit reached: 5 photos maximum. Verify email to upload more.' },
          { status: 403 }
        )
      }

      // Check file size (5MB cap)
      const maxSizeMB = 5
      const buffer = Buffer.from(await file.arrayBuffer())
      const isValidSize = buffer.length <= maxSizeMB * 1024 * 1024

      if (!isValidSize) {
        return NextResponse.json(
          { error: `Trial limit: File size must be under ${maxSizeMB}MB. Verify email to upload larger files.` },
          { status: 403 }
        )
      }
    }

    // Validate image
    const buffer = Buffer.from(await file.arrayBuffer())
    const isValidImage = await validateImageFile(buffer, 50) // 50MB max for verified users

    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Invalid or corrupted image file' },
        { status: 400 }
      )
    }

    // Process image with Sharp (Automated Asset Slicing)
    const processed = await processImage(buffer, {
      previewMaxDimension: 1200,
      previewTargetSizeKB: 250,
      masterMaxDimension: 3840, // 4K on longest edge
      masterQuality: 95,
      useAVIF: true,
    })

    // Upload preview to public bucket (AVIF for better compression)
    const previewExtension = 'avif'
    const previewFileName = `${galleryId}/${Date.now()}_preview.${previewExtension}`
    const { error: previewError } = await supabaseAdmin.storage
      .from('previews')
      .upload(previewFileName, processed.previewBuffer, {
        contentType: 'image/avif',
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

    // Upload master to private bucket
    const masterFileName = `${galleryId}/${Date.now()}_master.jpg`
    const { error: masterError } = await supabaseAdmin.storage
      .from('masters')
      .upload(masterFileName, processed.masterBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (masterError) {
      // Rollback preview upload
      await supabaseAdmin.storage.from('previews').remove([previewFileName])
      return NextResponse.json(
        { error: 'Failed to upload master' },
        { status: 500 }
      )
    }

    // Get signed URL for master (admin access only)
    const { data: masterUrlData } = await supabaseAdmin.storage
      .from('masters')
      .createSignedUrl(masterFileName, 31536000) // 1 year

    if (!masterUrlData) {
      // Rollback storage uploads
      await supabaseAdmin.storage.from('previews').remove([previewFileName])
      await supabaseAdmin.storage.from('masters').remove([masterFileName])
      return NextResponse.json(
        { error: 'Failed to generate master URL' },
        { status: 500 }
      )
    }

    // Store photo metadata in database
    const { data: photo, error: dbError } = await supabaseAdmin
      .from('photos')
      .insert({
        gallery_id: galleryId,
        preview_url: previewUrlData.publicUrl,
        master_url: masterUrlData.signedUrl,
        blurhash: processed.blurhash,
        position,
        chapter,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback storage uploads
      await supabaseAdmin.storage.from('previews').remove([previewFileName])
      await supabaseAdmin.storage.from('masters').remove([masterFileName])
      return NextResponse.json(
        { error: 'Failed to save photo metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, photo }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
