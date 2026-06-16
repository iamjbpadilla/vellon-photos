import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Building2, Users, Camera, Sparkles } from "lucide-react";

export default function CorporateEventPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Corporate Event Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Building2 size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Corporate Event Photo Sharing
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Elevate launches, team building, and company events. Collect professional-quality photos from your team and create shareable event galleries.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why Vellon.photos for Corporate Events?</h2>
          <ul className="space-y-4">
            {[
              "Professional-grade photo collection for your brand",
              "No app installation required for employees",
              "Perfect for product launches, conferences, and team events",
              "Custom branding with your company colors",
              "Easy sharing on internal communications and social media",
              "Full-resolution downloads for marketing materials",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Perfect for Corporate Events</h2>
          <p className="text-[#6B7280] mb-4">
            From intimate team gatherings to large-scale conferences, Vellon.photos captures:
          </p>
          <ul className="space-y-3">
            {[
              "Product launches and unveilings",
              "Team building activities",
              "Conference and seminar moments",
              "Award ceremonies and recognition",
              "Networking events",
              "Company milestones and celebrations",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Building2 size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Studio Suite for Professional Use</h2>
          <p className="text-[#6B7280] mb-4">
            For regular corporate events, consider our Studio Suite:
          </p>
          <ul className="space-y-3">
            {[
              "Custom domain (gallery.yourcompany.com)",
              "Complete white-label branding",
              "Interactive Curation Hub for client proofing",
              "Studio Performance Analytics",
              "Priority support",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Users size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Ready for Your Next Event?</h2>
          <p className="text-[#D1D5DB] mb-6">
            Start your corporate event gallery today. One-time payment of ₱999 or upgrade to Studio Suite for professional features.
          </p>
          <Link
            href="/?modal=signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-white rounded-full font-semibold hover:bg-[#B8963E] transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
