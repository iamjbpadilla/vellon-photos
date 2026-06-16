export interface Profile {
  id: string
  email: string
  full_name?: string
  user_type: 'b2c' | 'b2b'
  is_verified: boolean
  trial_ends_at?: Date
  custom_domain?: string
  stripe_customer_id?: string
  created_at: Date
  updated_at: Date
}

export interface Gallery {
  id: string
  user_id: string
  slug: string
  title: string
  description?: string
  theme_preset: 'heritage' | 'contemporary'
  canvas_tone: 'linen' | 'sepia' | 'obsidian'
  audio_track_url?: string
  secure_code: string
  download_code?: string
  is_active: boolean
  expired_archive: boolean
  custom_domain?: string
  fair_use_cap_photos: number
  fair_use_cap_storage_gb: number
  event_date?: Date
  created_at: Date
  updated_at: Date
}

export interface Photo {
  id: string
  gallery_id: string
  preview_url: string
  master_url: string
  blurhash: string
  position: number
  chapter?: string
  guest_tags?: Record<string, any>
  created_at: Date
}

export interface ManualPaymentQueue {
  id: string
  user_id: string
  gallery_id: string
  reference_number: string
  receipt_url: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
}

export interface PaymentLedger {
  id: string
  user_id: string
  gallery_id?: string
  reference_number: string
  amount: number
  payment_type: 'b2c_event' | 'b2b_subscription'
  status: 'completed' | 'failed'
  created_at: Date
}

export interface VoucherPool {
  id: string
  code: string
  discount_amount: number
  max_uses: number
  current_uses: number
  expires_at: Date
  created_at: Date
}

export interface DownloadAttempt {
  id: string
  ip_address: string
  gallery_id: string
  attempts: number
  locked_until?: Date
  created_at: Date
}

export interface Favorite {
  id: string
  user_id: string
  photo_id: string
  gallery_id: string
  created_at: Date
}

export interface DownloadLink {
  id: string
  gallery_id: string
  email: string
  secure_code: string
  zip_url: string
  expires_at: Date
  created_at: Date
}

export interface GuestUpload {
  id: string
  gallery_id: string
  photo_url: string
  uploaded_by?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
}
