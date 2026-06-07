import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Initialize Resend lazily to avoid build-time errors
  const resend = new Resend(process.env.RESEND_API_KEY || '')

  const supabase = await createClient()

  try {
    // Get events expiring in 3 days
    const { data: warning3dEvents } = await supabase
      .from('events')
      .select('*, profiles(email)')
      .in('status', ['active', 'trial'])
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
      .gt('expires_at', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString())

    // Get events expiring in 1 day
    const { data: warning1dEvents } = await supabase
      .from('events')
      .select('*, profiles(email)')
      .in('status', ['active', 'trial'])
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())

    // Get expired events
    const { data: expiredEvents } = await supabase
      .from('events')
      .select('*')
      .in('status', ['trial', 'active'])
      .lt('expires_at', new Date().toISOString())

    // Send 3-day warnings
    for (const event of warning3dEvents || []) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@vellon.photos',
          to: event.profiles?.email,
          subject: `Your gallery "${event.title}" expires in 3 days`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #020617;">Gallery Expiring Soon</h1>
              <p>Your gallery <strong>${event.title}</strong> will expire in 3 days.</p>
              <p>Download your photos before they're permanently deleted.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/event/${event.event_code}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to bottom right, #eab308, #ca8a04); color: #020617; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Gallery</a>
            </div>
          `,
        })
      } catch (error) {
        console.error('Failed to send 3-day warning:', error)
      }
    }

    // Send 1-day warnings
    for (const event of warning1dEvents || []) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@vellon.photos',
          to: event.profiles?.email,
          subject: `Your gallery "${event.title}" expires tomorrow`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #020617;">Final Warning</h1>
              <p>Your gallery <strong>${event.title}</strong> expires tomorrow.</p>
              <p>This is your last chance to download your photos.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/event/${event.event_code}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to bottom right, #eab308, #ca8a04); color: #020617; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Gallery</a>
            </div>
          `,
        })
      } catch (error) {
        console.error('Failed to send 1-day warning:', error)
      }
    }

    // Purge expired events
    for (const event of expiredEvents || []) {
      // Delete photos from storage
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('event_id', event.id)

      for (const photo of photos || []) {
        try {
          const { error: deleteError } = await supabase
            .storage
            .from('event-photos')
            .remove([photo.storage_path])
          if (deleteError) console.error('Failed to delete photo from storage:', deleteError)
        } catch (error) {
          console.error('Failed to delete photo from storage:', error)
        }
      }

      // Delete photo records
      await supabase.from('photos').delete().eq('event_id', event.id)

      // Archive event
      await supabase
        .from('events')
        .update({ status: 'archived' })
        .eq('id', event.id)

      // Send expiration email
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', event.host_id)
          .single()

        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@vellon.photos',
          to: profile?.email,
          subject: `Your gallery "${event.title}" has expired`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #020617;">Gallery Expired</h1>
              <p>Your gallery <strong>${event.title}</strong> has expired and all photos have been deleted.</p>
              <p>Create a new gallery to capture more memories.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to bottom right, #eab308, #ca8a04); color: #020617; text-decoration: none; border-radius: 8px; margin-top: 16px;">Create New Gallery</a>
            </div>
          `,
        })
      } catch (error) {
        console.error('Failed to send expiration email:', error)
      }
    }

    // Sync view counts
    await supabase.rpc('sync_event_view_counts')

    return NextResponse.json({
      success: true,
      warning3d: warning3dEvents?.length || 0,
      warning1d: warning1dEvents?.length || 0,
      purged: expiredEvents?.length || 0,
    })
  } catch (error) {
    console.error('Lifecycle cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
