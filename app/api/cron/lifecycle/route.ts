import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Find galleries older than 6 months
    const { data: oldGalleries, error: galleriesError } = await supabaseAdmin
      .from('galleries')
      .select('id, title, created_at')
      .lt('created_at', sixMonthsAgo.toISOString())
      .eq('is_active', true)

    if (galleriesError) {
      console.error('Error fetching old galleries:', galleriesError)
      return NextResponse.json(
        { error: 'Failed to fetch galleries' },
        { status: 500 }
      )
    }

    if (!oldGalleries || oldGalleries.length === 0) {
      return NextResponse.json({
        message: 'No galleries eligible for master vault purge',
        processed: 0,
        deletedFiles: 0
      })
    }

    let totalDeletedFiles = 0
    const results = []

    for (const gallery of oldGalleries) {
      try {
        // List all master files for this gallery
        const { data: files, error: listError } = await supabaseAdmin.storage
          .from('masters')
          .list(`${gallery.id}/`, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
          })

        if (listError) {
          console.error(`Error listing masters for gallery ${gallery.id}:`, listError)
          results.push({
            galleryId: gallery.id,
            galleryTitle: gallery.title,
            status: 'error',
            error: listError.message
          })
          continue
        }

        if (!files || files.length === 0) {
          results.push({
            galleryId: gallery.id,
            galleryTitle: gallery.title,
            status: 'skipped',
            reason: 'No master files found'
          })
          continue
        }

        // Delete all master files
        const filePaths = files.map(file => `${gallery.id}/${file.name}`)
        const { error: deleteError } = await supabaseAdmin.storage
          .from('masters')
          .remove(filePaths)

        if (deleteError) {
          console.error(`Error deleting masters for gallery ${gallery.id}:`, deleteError)
          results.push({
            galleryId: gallery.id,
            galleryTitle: gallery.title,
            status: 'error',
            error: deleteError.message
          })
          continue
        }

        totalDeletedFiles += filePaths.length
        results.push({
          galleryId: gallery.id,
          galleryTitle: gallery.title,
          status: 'success',
          deletedFiles: filePaths.length
        })

        console.log(`Purged ${filePaths.length} master files from gallery ${gallery.id} (${gallery.title})`)
      } catch (error) {
        console.error(`Error processing gallery ${gallery.id}:`, error)
        results.push({
          galleryId: gallery.id,
          galleryTitle: gallery.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Master vault purge completed',
      processed: oldGalleries.length,
      deletedFiles: totalDeletedFiles,
      results
    })
  } catch (error) {
    console.error('Lifecycle cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
