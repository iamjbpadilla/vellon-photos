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
    const { userId, makeAdmin } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Update user admin status
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: makeAdmin })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update admin status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('Admin promotion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
