import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Cake, Gift, Camera, Users, Sparkles } from "lucide-react";

export default function BirthdayPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Birthday Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Cake size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Birthday Photo Sharing
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Capture the joy of every family milestone. From first birthdays to golden celebrations, collect every happy moment in one beautiful gallery.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why Vellon.photos for Birthdays?</h2>
          <ul className="space-y-4">
            {[
              "No app required — guests upload from their phone browser",
              "Collect photos from all your guests in one place",
              "Perfect for kids' parties, adult celebrations, and milestones",
              "Real-time updates during the party",
              "Custom QR code for your party setup",
              "Easy sharing with family who couldn't attend",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Perfect for Any Birthday</h2>
          <p className="text-[#6B7280] mb-4">
            Whether it's a first birthday, sweet 16, or a golden celebration, Vellon.photos captures:
          </p>
          <ul className="space-y-3">
            {[
              "Cake cutting and candle blowing",
              "Gift opening moments",
              "Party games and activities",
              "Family and group photos",
              "Candid laughter and celebrations",
              "Decor and setup details",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Cake size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Ready to Celebrate?</h2>
          <p className="text-[#D1D5DB] mb-6">
            Create your birthday gallery today. One-time payment of ₱999 for unlimited uploads and lasting memories.
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
