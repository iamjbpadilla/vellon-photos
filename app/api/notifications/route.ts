import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Get notification details
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notification_queue')
      .select('*, profiles(email), galleries(title, slug)')
      .eq('id', notificationId)
      .eq('status', 'pending')
      .single()

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: 'Notification not found or already sent' },
        { status: 404 }
      )
    }

    // Send notification
    const galleryUrl = `https://vellon.photos/gallery/${notification.galleries.slug}`
    const result = await sendNotification(
      notification.profiles.email,
      notification.notification_type as any,
      notification.galleries.title,
      galleryUrl
    )

    if (!result.success) {
      // Update notification status to failed
      await supabaseAdmin
        .from('notification_queue')
        .update({ 
          status: 'failed',
          sent_at: new Date().toISOString(),
          error_message: result.error?.toString()
        })
        .eq('id', notificationId)

      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    // Update notification status to sent
    await supabaseAdmin
      .from('notification_queue')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId)

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Endpoint to schedule notifications for a gallery
export async function PUT(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const { galleryId, userId } = await request.json()

    if (!galleryId || !userId) {
      return NextResponse.json(
        { error: 'Gallery ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get gallery creation date
    const { data: gallery } = await supabaseAdmin
      .from('galleries')
      .select('created_at')
      .eq('id', galleryId)
      .single()

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Schedule notifications for Day 4, 8, 12, 15
    const notificationTypes = ['day_4', 'day_8', 'day_12', 'day_15'] as const
    const scheduledNotifications = []

    for (const type of notificationTypes) {
      const dayNumber = parseInt(type.split('_')[1])
      const scheduledAt = new Date(gallery.created_at)
      scheduledAt.setDate(scheduledAt.getDate() + dayNumber)

      const { data, error } = await supabaseAdmin
        .from('notification_queue')
        .insert({
          user_id: userId,
          gallery_id: galleryId,
          notification_type: type,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error(`Failed to schedule ${type} notification:`, error)
      } else {
        scheduledNotifications.push(data)
      }
    }

    return NextResponse.json({ 
      success: true, 
      scheduledNotifications 
    })
  } catch (error) {
    console.error('Notification scheduling error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
