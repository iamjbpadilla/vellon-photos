import { MarketingLayout } from "@/components/layout/MarketingLayout";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Event Templates — Vellon.photos",
  description: "Free printable and digital event signs for weddings, birthdays, corporate parties, and more. Add your Vellon QR code and print.",
};

const CANVA_LINK = "https://www.canva.com/templates"; // swap for actual Vellon Canva collection URL

const steps = [
  {
    num: "1",
    title: "Browse & pick a template",
    desc: "Open the Canva collection and choose the design that fits your event.",
  },
  {
    num: "2",
    title: "Add your QR code",
    desc: "Grab your event's QR code from your Vellon Dashboard and paste it in.",
  },
  {
    num: "3",
    title: "Print or share digitally",
    desc: "Download as PDF or image — print at home or send to a print shop.",
  },
];

export default function TemplatesPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">

        {/* Header */}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Templates</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4 leading-tight">
          Event Templates
        </h1>
        <p className="text-[#6B7280] text-lg leading-relaxed mb-10">
          Printable and digital signs for your event — weddings, birthdays, corporate parties, and more. All fully customizable in Canva. Just add your Vellon QR code and print.
        </p>
        <div className="w-12 h-px bg-[#C9A84C] mb-12 opacity-60" />

        {/* All designs block */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-px bg-[#C9A84C] opacity-40" />

          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-2">
            All designs in one place
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Click below to open our Canva template collection. Pick any design, duplicate it, swap in your QR code, and download — no Canva account required to view.
          </p>

          {/* Steps */}
          <div className="space-y-6 mb-10">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937] mb-0.5">{title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={CANVA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
          >
            Browse Templates in Canva
            <ExternalLink size={13} />
          </a>
          <p className="mt-3 text-xs text-[#9CA3AF]">
            Opens in a new tab — free to view and duplicate
          </p>
        </div>

        {/* No QR code yet */}
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FDFBF7] px-6 py-5 flex items-start gap-4 mb-16">
          <span className="text-xl mt-0.5">💡</span>
          <div>
            <p className="text-sm font-semibold text-[#1F2937] mb-1">Don&apos;t have your QR code yet?</p>
            <p className="text-sm text-[#6B7280]">
              Create your event gallery to get one.{" "}
              <Link href="/" className="text-[#C9A84C] hover:underline font-medium">
                Create your event album →
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-[#E5E7EB] pt-12 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">
            Ready to share memories?
          </h2>
          <p className="text-sm text-[#6B7280] mb-7 max-w-md mx-auto leading-relaxed">
            Create your event, generate your QR code, stick it on a template, and let guests upload photos instantly — no app needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
            >
              Create Your Event <ArrowRight size={14} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#D1D5DB] text-[#6B7280] text-sm font-medium hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

      </div>
    </MarketingLayout>
  );
}
