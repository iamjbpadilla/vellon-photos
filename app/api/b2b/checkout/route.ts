import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// B2B Plan configurations
const PLANS = {
  studio_suite: {
    name: 'Studio Suite',
    price: 1999, // ₱1,999/month
    stripePriceId: process.env.STRIPE_PRICE_STUDIO_SUITE,
  },
  studio_pro: {
    name: 'Studio Pro',
    price: 3999, // ₱3,999/month
    stripePriceId: process.env.STRIPE_PRICE_STUDIO_PRO,
  },
  enterprise: {
    name: 'Enterprise',
    price: 9999, // ₱9,999/month
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
  },
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }

  try {
    const { planType } = await request.json()

    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
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

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_type, full_name, email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'b2b') {
      return NextResponse.json(
        { error: 'B2B subscription only available for business accounts' },
        { status: 403 }
      )
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('b2b_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          user_id: user.id,
          user_type: 'b2b',
        },
      })
      customerId = customer.id

      // Update profile with customer ID
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Stripe checkout session
    const plan = PLANS[planType as keyof typeof PLANS]
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=canceled`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
