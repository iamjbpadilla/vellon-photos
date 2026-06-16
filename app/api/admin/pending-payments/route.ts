import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    // Get pending payment queue
    const { data: pendingPaymentsData } = await supabaseAdmin
      .from('manual_payment_queue')
      .select('*, profiles(full_name, email), galleries(title, slug)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Get rejected payments
    const { data: rejectedPaymentsData } = await supabaseAdmin
      .from('manual_payment_queue')
      .select('*, profiles(full_name, email), galleries(title, slug)')
      .eq('status', 'rejected')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      pending: pendingPaymentsData || [],
      rejected: rejectedPaymentsData || []
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
