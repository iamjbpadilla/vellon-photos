'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Subscription {
  id: string
  plan_type: 'studio_suite' | 'studio_pro' | 'enterprise'
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface Props {
  userId: string
}

const PLANS = {
  studio_suite: { name: 'Studio Suite', price: 1999 },
  studio_pro: { name: 'Studio Pro', price: 3999 },
  enterprise: { name: 'Enterprise', price: 9999 },
}

export default function B2BSubscriptionManager({ userId }: Props) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubscription()
  }, [userId])

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/b2b/subscription?user_id=${userId}`)
      const data = await response.json()
      setSubscription(data.subscription || null)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planType: keyof typeof PLANS) => {
    setSelectedPlan(planType)
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/b2b/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/b2b/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      await fetchSubscription()
    } catch (err) {
      console.error('Cancel error:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#F3F4F6] rounded w-1/3" />
          <div className="h-8 bg-[#F3F4F6] rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#1F2937]">Studio Suite</h3>
            <p className="text-sm text-[#6B7280]">Choose your plan to unlock unlimited galleries</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1F2937]">₱1,999<span className="text-sm font-normal text-[#6B7280]">/mo</span></p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-[#374151]">
            <CheckCircle size={16} className="text-[#C9A84C]" />
            <span>Unlimited galleries and events</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#374151]">
            <CheckCircle size={16} className="text-[#C9A84C]" />
            <span>Interactive Curation Hub</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#374151]">
            <CheckCircle size={16} className="text-[#C9A84C]" />
            <span>Priority support</span>
          </div>
        </div>

        <button
          onClick={() => handleSubscribe('studio_suite')}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard size={16} />
          Subscribe with Stripe
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            View all plans →
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    )
  }

  const plan = PLANS[subscription.plan_type]
  const isActive = subscription.status === 'active'
  const isCanceled = subscription.cancel_at_period_end

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-xl font-semibold text-[#1F2937]">{plan.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isActive ? 'Active' : subscription.status}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            ₱{plan.price}/month
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#6B7280]">Next billing</p>
          <p className="text-sm font-medium text-[#1F2937]">
            {new Date(subscription.current_period_end).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {isCanceled && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Your subscription will be canceled on {new Date(subscription.current_period_end).toLocaleDateString('en-PH')}.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {!isCanceled && isActive && (
          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#D1D5DB] font-semibold text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Subscription
          </button>
        )}
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="flex-1 py-2.5 rounded-xl bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-all"
        >
          Change Plan
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
