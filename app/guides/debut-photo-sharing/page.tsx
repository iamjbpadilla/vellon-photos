import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Star, Camera, Users, Gift } from "lucide-react";

export default function DebutPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Debut Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Sparkles size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Debut Photo Sharing
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Perfect for 18th-birthday milestones and celebrations. Capture every moment of your debut — from the grand entrance to the 18 roses.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why Vellon.photos for Your Debut?</h2>
          <ul className="space-y-4">
            {[
              "No app downloads — guests upload directly from their browser",
              "Collect photos from your court, 18 roses, and 18 candles",
              "Beautiful typography to match your debut theme",
              "Real-time photo updates during your celebration",
              "Custom QR code for your venue tables",
              "Full-resolution downloads for printing and sharing",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Capture Every Debut Moment</h2>
          <p className="text-[#6B7280] mb-4">
            A debut is a once-in-a-lifetime celebration. Vellon.photos helps you preserve:
          </p>
          <ul className="space-y-3">
            {[
              "The grand entrance and cotillion dance",
              "18 roses presentation",
              "18 candles ceremony",
              "Candid moments with family and friends",
              "The toast and speeches",
              "Dance floor celebrations",
              "Cake cutting ceremony",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Star size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Ready for Your Debut?</h2>
          <p className="text-[#D1D5DB] mb-6">
            Create your debut gallery today. One-time payment of ₱999 for unlimited uploads and a permanent digital memory.
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
