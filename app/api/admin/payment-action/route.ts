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
    const { paymentId, action, comment } = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: 'Missing payment ID or action' },
        { status: 400 }
      )
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('manual_payment_queue')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Get user email from auth.users
    let userEmail = null
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(payment.user_id)
      userEmail = authUser?.user?.email
    } catch (error) {
      console.error('Failed to fetch user email:', error)
      // Continue without email - payment action should still work
    }

    // Get gallery details
    let gallery = null
    let galleryUrl = ''
    try {
      const { data: galleryData } = await supabaseAdmin
        .from('galleries')
        .select('title, slug')
        .eq('id', payment.gallery_id)
        .single()
      gallery = galleryData
      galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/g/${gallery?.slug || ''}`
    } catch (error) {
      console.error('Failed to fetch gallery details:', error)
      // Continue without gallery - payment action should still work
    }

    if (action === 'approve') {
      // Generate 6-digit download code
      const downloadCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Activate gallery and set download code
      const { error: galleryError } = await supabaseAdmin
        .from('galleries')
        .update({ 
          is_active: true,
          download_code: downloadCode
        })
        .eq('id', payment.gallery_id)

      if (galleryError) {
        console.error('Gallery activation error:', galleryError)
        return NextResponse.json(
          { error: 'Failed to activate gallery', details: galleryError.message },
          { status: 500 }
        )
      }

      // Move to payment ledger
      const { error: ledgerError } = await supabaseAdmin
        .from('payment_ledger')
        .insert({
          user_id: payment.user_id,
          gallery_id: payment.gallery_id,
          reference_number: payment.reference_number,
          amount: payment.amount,
          payment_type: 'b2c_event',
          status: 'completed'
        })

      if (ledgerError) {
        return NextResponse.json(
          { error: 'Failed to record payment in ledger' },
          { status: 500 }
        )
      }

      // Delete from queue
      await supabaseAdmin
        .from('manual_payment_queue')
        .delete()
        .eq('id', paymentId)

      // Send approval email (non-blocking)
      if (userEmail && gallery) {
        try {
          await sendNotification(
            userEmail,
            'payment_approved',
            gallery.title,
            galleryUrl,
            downloadCode
          )
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError)
          // Don't fail the payment action if email fails
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment approved and gallery activated',
        downloadCode 
      })

    } else if (action === 'reject') {
      // Update status to rejected
      const { error: updateError } = await supabaseAdmin
        .from('manual_payment_queue')
        .update({ 
          status: 'rejected'
        })
        .eq('id', paymentId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to reject payment' },
          { status: 500 }
        )
      }

      // Send rejection email (non-blocking)
      if (userEmail && gallery) {
        try {
          await sendNotification(
            userEmail,
            'payment_rejected',
            gallery.title,
            galleryUrl
          )
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError)
          // Don't fail the payment action if email fails
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment rejected' 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment action error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
