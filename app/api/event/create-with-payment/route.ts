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
    const { eventName, eventDate, eventSlug, voucherCode, referenceNumber, receiptUrl, amount } = await request.json()

    if (!eventName || !eventDate || !eventSlug || !referenceNumber || !receiptUrl || !amount) {
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

    // Check if voucher is provided and valid
    let finalAmount = parseFloat(amount)
    if (voucherCode) {
      const { data: voucher, error: voucherError } = await supabaseAdmin
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (voucherError || !voucher) {
        return NextResponse.json(
          { error: 'Invalid voucher code' },
          { status: 400 }
        )
      }

      // Check if voucher is already used
      if (voucher.used_by) {
        return NextResponse.json(
          { error: 'Voucher already used' },
          { status: 400 }
        )
      }

      // Apply discount
      if (voucher.discount_type === 'percentage') {
        finalAmount = finalAmount * (1 - voucher.discount_value / 100)
      } else if (voucher.discount_type === 'fixed') {
        finalAmount = Math.max(0, finalAmount - voucher.discount_value)
      }

      // Mark voucher as used
      await supabaseAdmin
        .from('vouchers')
        .update({ 
          used_by: user.id,
          used_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', voucher.id)
    }

    // Check if payment with this reference number already exists
    const { data: existingPayment } = await supabaseAdmin
      .from('manual_payment_queue')
      .select('id')
      .eq('reference_number', referenceNumber)
      .single()

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment with this reference number already exists' },
        { status: 400 }
      )
    }

    // Generate secure code
    const secureCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create gallery (event) with inactive status
    const { data: gallery, error: galleryError } = await supabaseAdmin
      .from('galleries')
      .insert({
        user_id: user.id,
        title: eventName,
        slug: eventSlug,
        secure_code: secureCode,
        is_active: false,
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

    // Create payment queue entry
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('manual_payment_queue')
      .insert({
        user_id: user.id,
        gallery_id: gallery.id,
        reference_number: referenceNumber,
        receipt_url: receiptUrl,
        amount: finalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json(
        { error: 'Failed to create payment entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      gallery,
      payment,
      finalAmount 
    })
  } catch (error) {
    console.error('Event creation with payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
