"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gold/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/#how-it-works"
              className="text-sm text-slate-400 hover:text-gold transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-slate-400 hover:text-gold transition-colors"
            >
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg gold-gradient text-navy-800 font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg gold-gradient text-navy-800 font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] transition-all"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          <button
            className="sm:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden glass border-t border-gold/10 px-4 py-4 flex flex-col gap-4">
          <Link
            href="/#how-it-works"
            className="text-sm text-slate-400"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-slate-400"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg gold-gradient text-navy-800 font-semibold"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-slate-300">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg gold-gradient text-navy-800 font-semibold"
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
