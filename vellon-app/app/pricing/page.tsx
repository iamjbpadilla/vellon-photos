import { MarketingLayout } from "@/components/layout/MarketingLayout";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing — Vellon.photos",
  description: "One event. ₱699. No subscriptions, no hidden fees. Free 48-hour trial included.",
};

const features = [
  "Unlimited photos",
  "QR code included",
  "Uploads open for 5 days",
  "15 days cloud storage",
  "Guest name tagging",
  "Download everything",
];

const guideLinks = [
  ["Affordable Event Photo Sharing",    "/guides/affordable-event-photo-sharing"],
  ["QR Photo Sharing App",              "/guides/qr-photo-sharing-app"],
  ["No-Download Photo Sharing",         "/guides/no-download-photo-sharing-app"],
  ["Wedding Photo Sharing PH",          "/guides/wedding-photo-sharing-philippines"],
  ["Debut Photo Sharing",               "/guides/debut-photo-sharing"],
  ["Birthday Photo Sharing",            "/guides/birthday-photo-sharing"],
  ["Corporate Event Photo Sharing PH",  "/guides/corporate-event-photo-sharing"],
];

const faqs = [
  {
    q: "How long do guests have to upload?",
    a: "Guests can upload on the event day and for up to 5 days after the event date.",
  },
  {
    q: "Is there a guest upload limit?",
    a: "No — unlimited uploads for all guests.",
  },
  {
    q: "Do guests need to create an account?",
    a: "No. They just scan the QR code, enter their name, and upload.",
  },
  {
    q: "What happens after 15 days?",
    a: "The event and photos will be archived for privacy and security purposes.",
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-3 leading-tight">
            Simple, one-time pricing
          </h1>
          <p className="text-[#6B7280] text-base">
            No subscriptions. No hidden fees. Pay once per event.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl border-2 border-[#1F2937] shadow-lg relative overflow-hidden mb-14">
          {/* Most Popular badge */}
          <div className="bg-[#1F2937] text-white text-sm font-semibold tracking-widest uppercase text-center py-2">
            Most Popular
          </div>

          <div className="p-8">
            <p className="text-sm font-semibold text-[#1F2937] mb-1">Photo Sharing</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-serif text-6xl font-bold text-[#1F2937]">₱699</span>
              <span className="text-[#9CA3AF] text-sm mb-2">/ event</span>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-8">One-time. No subscription.</p>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#374151]">
                  <div className="w-5 h-5 rounded-full bg-[#F0EBE0] flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-[#C9A84C]" strokeWidth={2.5} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
            >
              Get Started <ArrowRight size={14} />
            </Link>
            <p className="mt-3 text-sm text-center text-[#9CA3AF]">Free 48-hour trial · No credit card required</p>
          </div>
        </div>

        {/* Compare by use case */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-2">Compare by use case</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            If you found Vellon through search or AI tools, these guides explain the best fit by event type and intent.
          </p>
          <ul className="space-y-2">
            {guideLinks.map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center justify-between group px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#C9A84C]/50 hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-[#374151] group-hover:text-[#1F2937] transition-colors">{label}</span>
                  <ArrowRight size={13} className="text-[#9CA3AF] group-hover:text-[#C9A84C] transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-6">Frequently asked questions</h2>
          <div className="space-y-0 divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white">
            {faqs.map(({ q, a }) => (
              <div key={q} className="px-6 py-5">
                <p className="font-semibold text-sm text-[#1F2937] mb-1.5">{q}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </MarketingLayout>
  );
}
