'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  showScrollLinks?: boolean
}

export default function Navigation({ showScrollLinks = false }: NavigationProps) {
  const router = useRouter()
  
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
        // Fetch full_name from profiles table
        fetchProfileName(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
        fetchProfileName(session.user.id)
      } else {
        setUser(null)
        setDisplayName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfileName = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    
    if (profile?.full_name) {
      setDisplayName(profile.full_name)
    } else {
      setDisplayName(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-xl sm:text-2xl tracking-tight">
          <span className="text-[#C9A84C]">Vellon</span>
          <span className="text-[#6B7280] font-light">.photos</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-[#6B7280]">
                Hi, <span className="font-medium text-[#1F2937]">{displayName}</span>
              </span>
              <Link href="/dashboard" className="text-sm font-semibold px-4 py-2.5 rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden sm:block text-sm font-medium text-[#9CA3AF] hover:text-[#6B7280] transition-colors px-3 py-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {showScrollLinks && (
                <>
                  <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
                    How it Works
                  </button>
                  <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
                    Pricing
                  </button>
                </>
              )}
              {user ? (
                <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-semibold px-5 py-2.5 rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link href="/?modal=signup" className="hidden sm:inline-flex text-sm font-semibold px-5 py-2.5 rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors">
                  Get Started
                </Link>
              )}
              <button
                onClick={() => setMobileMenu((v) => !v)}
                aria-label="Menu"
                className="sm:hidden p-2 -mr-1 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {mobileMenu && !user && (
        <div className="sm:hidden bg-white border-t border-[#E5E7EB] px-5 py-4 flex flex-col gap-1">
          {showScrollLinks && (
            <>
              <button onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false); }} className="text-left text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
                How it Works
              </button>
              <button onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false); }} className="text-left text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
                Pricing
              </button>
            </>
          )}
          {user ? (
            <Link href="/dashboard" onClick={() => setMobileMenu(false)} className="text-left text-sm font-semibold text-[#1F2937] px-3 py-2">
              Dashboard
            </Link>
          ) : (
            <Link href="/?modal=signup" onClick={() => setMobileMenu(false)} className="text-left text-sm font-semibold text-[#1F2937] px-3 py-2">
              Get Started
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
