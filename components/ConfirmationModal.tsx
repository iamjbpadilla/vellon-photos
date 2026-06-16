'use client'

import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      confirmBg: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-50'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-50'
    },
    info: {
      icon: <AlertTriangle className="text-blue-500" size={24} />,
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-50'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <h3 className="text-xl font-serif text-[#1F2937] mt-4">{title}</h3>
          <p className="text-[#6B7280] mt-2">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-lg font-medium text-[#1F2937] hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              await onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
