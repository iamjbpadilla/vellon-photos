import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateQRKitPDF } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const { galleryId } = await request.json()

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      )
    }

    // Get gallery details
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('*')
      .eq('id', galleryId)
      .single()

    if (galleryError || !gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Get hero image (first photo)
    const { data: photos } = await supabase
      .from('photos')
      .select('preview_url')
      .eq('gallery_id', galleryId)
      .order('position', { ascending: true })
      .limit(1)

    const heroImageUrl = photos && photos.length > 0 ? photos[0].preview_url : undefined

    // Generate QR kit PDF
    const pdfBlob = await generateQRKitPDF({
      galleryTitle: gallery.title,
      gallerySlug: gallery.slug,
      themePreset: gallery.theme_preset,
      canvasTone: gallery.canvas_tone,
      heroImageUrl,
    })

    // Return PDF as response
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Vellon-qr-kit-${gallery.slug}.pdf"`,
      },
    })
  } catch (error) {
    console.error('QR kit generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR kit' },
      { status: 500 }
    )
  }
}
