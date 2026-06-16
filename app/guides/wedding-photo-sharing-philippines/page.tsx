import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Heart, Sparkles, Camera, Users, Gift } from "lucide-react";

export default function WeddingPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Wedding Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Heart size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Wedding Photo Sharing in the Philippines
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Curate every candid angle from the aisle to the after-party. Create a beautiful digital heirloom that your guests can contribute to instantly.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why Vellon.photos for Your Wedding?</h2>
          <ul className="space-y-4">
            {[
              "No app required for guests — they can upload directly from their phone camera",
              "Unlimited guest uploads from everyone at your wedding",
              "Beautiful editorial typography presets to match your wedding theme",
              "Instant access — photos appear in real-time as guests upload",
              "Custom QR code included for your reception tables",
              "Full-resolution downloads for you and your guests",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">How It Works</h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Create Your Wedding Gallery",
                desc: "Set up your event in minutes. Choose your gallery name, customize with your wedding colors, and get your unique QR code instantly.",
              },
              {
                step: "2",
                title: "Share with Guests",
                desc: "Place your QR code on reception tables or share the link with your wedding party. Guests can scan and upload without downloading anything.",
              },
              {
                step: "3",
                title: "Collect Every Moment",
                desc: "Watch your gallery come to life in real-time. From candid moments to group shots, your guests capture angles your photographer might miss.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-white flex items-center justify-center font-serif font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937] mb-1">{item.title}</h3>
                  <p className="text-[#6B7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Perfect for Filipino Weddings</h2>
          <p className="text-[#6B7280] mb-4">
            Filipino weddings are known for their warmth, hospitality, and countless memorable moments. Vellon.photos helps you capture:
          </p>
          <ul className="space-y-3">
            {[
              "The emotional walk down the aisle",
              "Candid moments during the ceremony",
              "Lively reception dancing and celebrations",
              "Heartfelt speeches and toasts",
              "Group photos with family and friends",
              "The bouquet toss and garter toss",
              "Sparkler send-offs and grand exits",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Heart size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Ready to Capture Your Wedding?</h2>
          <p className="text-[#D1D5DB] mb-6">
            Start your wedding gallery today. One-time payment of ₱999 for unlimited uploads and a permanent digital heirloom.
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
