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
    const { discountAmount, maxUses } = await request.json()

    if (!discountAmount || !maxUses) {
      return NextResponse.json(
        { error: 'Missing discount amount or max uses' },
        { status: 400 }
      )
    }

    // Generate random voucher code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create voucher
    const { data: voucher, error } = await supabaseAdmin
      .from('voucher_pool')
      .insert({
        code,
        discount_amount: discountAmount,
        max_uses: maxUses,
        current_uses: 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create voucher' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, voucher })
  } catch (error) {
    console.error('Voucher creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
