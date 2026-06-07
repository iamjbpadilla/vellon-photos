"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MarketingHeader() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-xl sm:text-2xl tracking-tight">
          <span className="text-[#C9A84C]">Vellon</span>
          <span className="text-[#6B7280] font-light">.photos</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop links */}
          <a href="/#how-it-works" className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
            How it Works
          </a>
          <Link href="/pricing" className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors px-3 py-2">
            Pricing
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex text-sm font-semibold px-5 py-2.5 rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
          >
            Get Started
          </Link>

          {/* Mobile: CTA pill + hamburger */}
          <Link
            href="/"
            className="sm:hidden text-sm font-semibold px-4 py-2 rounded-full bg-[#1F2937] text-white"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Menu"
            className="sm:hidden p-2 -mr-1 text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenu && (
        <div className="sm:hidden bg-white border-t border-[#E5E7EB] px-5 py-4 flex flex-col gap-1">
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenu(false)}
            className="flex items-center py-3 text-sm font-medium text-[#374151] border-b border-[#F3F4F6]"
          >
            How it Works
          </a>
          <Link
            href="/pricing"
            onClick={() => setMobileMenu(false)}
            className="flex items-center py-3 text-sm font-medium text-[#374151] border-b border-[#F3F4F6]"
          >
            Pricing
          </Link>
          <Link
            href="/templates"
            onClick={() => setMobileMenu(false)}
            className="flex items-center py-3 text-sm font-medium text-[#374151] border-b border-[#F3F4F6]"
          >
            Templates
          </Link>
          <Link
            href="/"
            onClick={() => setMobileMenu(false)}
            className="flex items-center py-3 text-sm font-medium text-[#9CA3AF]"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
