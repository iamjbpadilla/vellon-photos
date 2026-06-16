import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Users, Camera, PartyPopper, Heart } from "lucide-react";

export default function EventPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Event Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <PartyPopper size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Event Photo Sharing
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            From barkada trips to family reunions — collect every candid, group shot, and silly moment in one private gallery.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why Vellon.photos for Your Event?</h2>
          <ul className="space-y-4">
            {[
              "Perfect for any gathering — big or small",
              "No app required for guests to upload",
              "Collect photos from everyone in one place",
              "Real-time updates during your event",
              "Custom QR code for easy sharing",
              "Private gallery only you control access to",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Perfect for Any Gathering</h2>
          <p className="text-[#6B7280] mb-4">
            Vellon.photos works beautifully for all types of events:
          </p>
          <ul className="space-y-3">
            {[
              "Family reunions and get-togethers",
              "Barkada trips and adventures",
              "Holiday parties and celebrations",
              "Graduation parties",
              "Anniversary celebrations",
              "Weekend getaways and staycations",
              "Sports events and tournaments",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Users size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Capture Every Moment</h2>
          <p className="text-[#6B7280] mb-4">
            Your guests will capture angles you might miss:
          </p>
          <ul className="space-y-3">
            {[
              "Candid laughter and funny moments",
              "Group selfies and group shots",
              "Behind-the-scenes moments",
              "Food and setup details",
              "Spontaneous adventures",
              "Late-night celebrations",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Camera size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span className="text-[#374151]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Ready to Collect Memories?</h2>
          <p className="text-[#D1D5DB] mb-6">
            Create your event gallery today. One-time payment of ₱999 for unlimited uploads and a permanent collection of your favorite moments.
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
