'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const easing = [0.16, 1, 0.3, 1] as const

interface Voucher {
  id: string
  code: string
  discount_type: string
  discount_value: number
  max_uses: number
  used_count: number
  valid_from: string
  valid_until: string | null
  status: string
}

export default function AdminVouchersPage() {
  const router = useRouter()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: 100,
    max_uses: 1,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  })

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })
    setVouchers(data || [])
    setLoading(false)
  }

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { error } = await supabase.from('vouchers').insert({
      code: newVoucher.code.toUpperCase(),
      discount_type: newVoucher.discount_type,
      discount_value: newVoucher.discount_value,
      max_uses: newVoucher.max_uses,
      valid_from: new Date(newVoucher.valid_from).toISOString(),
      valid_until: newVoucher.valid_until ? new Date(newVoucher.valid_until).toISOString() : null,
    })

    if (error) {
      alert('Failed to create voucher')
    } else {
      setShowCreateModal(false)
      setNewVoucher({
        code: '',
        discount_type: 'fixed',
        discount_value: 100,
        max_uses: 1,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
      })
      loadVouchers()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const supabase = createClient()
    await supabase
      .from('vouchers')
      .update({ status: currentStatus === 'active' ? 'inactive' : 'active' })
      .eq('id', id)
    loadVouchers()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
          >
            ← Back
          </Link>
          <h1 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
            Vouchers
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing }}
          className="flex justify-between items-center mb-8"
        >
          <p className="text-[#F8FAFC]/60 font-sans">{vouchers.length} vouchers</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 min-h-10 px-4 py-2 text-sm font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
          >
            <Plus className="h-4 w-4" />
            Create Voucher
          </button>
        </motion.div>

        {loading ? (
          <div className="text-center text-[#F8FAFC]/60 font-sans py-20">Loading...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: easing }}
            className="bg-[#020617]/50 border border-[#D4AF37]/20 rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4AF37]/20">
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Code</th>
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Type</th>
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Value</th>
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Uses</th>
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Valid Until</th>
                  <th className="text-left p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Status</th>
                  <th className="text-right p-4 text-[#F8FAFC]/60 text-sm font-medium font-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b border-[#D4AF37]/10">
                    <td className="p-4">
                      <code className="text-[#D4AF37] font-mono text-sm">{voucher.code}</code>
                    </td>
                    <td className="p-4 text-[#F8FAFC] font-sans capitalize">{voucher.discount_type}</td>
                    <td className="p-4 text-[#F8FAFC] font-sans">
                      {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `₱${voucher.discount_value}`}
                    </td>
                    <td className="p-4 text-[#F8FAFC] font-sans">
                      {voucher.used_count} / {voucher.max_uses}
                    </td>
                    <td className="p-4 text-[#F8FAFC] font-sans">
                      {voucher.valid_until ? formatDate(voucher.valid_until) : 'No limit'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        voucher.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      } font-sans`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(voucher.id, voucher.status)}
                        className="text-[#D4AF37] hover:underline text-sm font-sans mr-4"
                      >
                        {voucher.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#020617] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-[#F8FAFC]" style={{ letterSpacing: '-0.02em' }}>
                Create Voucher
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[#F8FAFC]/60 hover:text-[#D4AF37] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Code
                </label>
                <input
                  type="text"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans uppercase"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Discount Type
                </label>
                <select
                  value={newVoucher.discount_type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                >
                  <option value="fixed">Fixed Amount (₱)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={newVoucher.discount_value}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={newVoucher.max_uses}
                  onChange={(e) => setNewVoucher({ ...newVoucher, max_uses: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] placeholder-[#F8FAFC]/30 focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Valid From
                </label>
                <input
                  type="date"
                  value={newVoucher.valid_from}
                  onChange={(e) => setNewVoucher({ ...newVoucher, valid_from: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-[#F8FAFC] text-sm font-medium mb-2 font-sans">
                  Valid Until (optional)
                </label>
                <input
                  type="date"
                  value={newVoucher.valid_until}
                  onChange={(e) => setNewVoucher({ ...newVoucher, valid_until: e.target.value })}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-[#D4AF37]/30 rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors font-sans"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 min-h-10 px-4 py-2 text-sm font-medium text-[#F8FAFC] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-10 px-4 py-2 text-sm font-medium text-[#020617] bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg transition-all hover:scale-105 active:scale-95 font-sans"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
