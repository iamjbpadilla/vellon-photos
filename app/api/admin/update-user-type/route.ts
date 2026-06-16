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
    const { userId, userType } = await request.json()

    if (!userId || !userType || !['b2c', 'b2b'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Update user type
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ user_type: userType })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user type' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error('Update user type error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
