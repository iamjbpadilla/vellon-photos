import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { FacebookLink } from "@/components/ui/FacebookLink";

export const metadata = {
  title: "About — Vellon.photos",
  description: "Vellon.photos is a premium, app-free event photo sharing platform built in the Philippines.",
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">About Us</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-6 leading-tight">
          Elevating the art of digital memories.
        </h1>
        <div className="w-12 h-px bg-[#C9A84C] mb-8 opacity-60" />

        <div className="prose prose-slate max-w-none space-y-6 text-[#374151]">
          <p className="text-lg leading-relaxed text-[#6B7280]">
            Vellon.photos was born from a simple frustration: at every beautiful event in the Philippines — weddings, debuts, birthdays — hundreds of guests capture incredible moments on their phones, and most of those photos are never seen again.
          </p>

          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mt-10 mb-4">Our Mission</h2>
          <p className="leading-relaxed text-[#6B7280]">
            We build tools that make shared memory effortless. No app downloads. No account creation for guests. Just a QR code on a table, a tap, and a photo in the gallery — instantly.
          </p>

          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mt-10 mb-4">Built for Filipino Events</h2>
          <p className="leading-relaxed text-[#6B7280]">
            From intimate debut celebrations in Quezon City to grand weddings in Cebu, Vellon is designed around the way Filipinos celebrate — loudly, warmly, and with everyone involved. Our pricing is transparent, our platform is mobile-first, and our support is local.
          </p>

          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mt-10 mb-4">The Team</h2>
          <p className="leading-relaxed text-[#6B7280]">
            Vellon.photos is an independent product developed by a small team of designers and engineers who love events and hate bad software. We are based in the Philippines.
          </p>

          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mt-10 mb-4">Contact</h2>
          <p className="leading-relaxed text-[#6B7280] mb-4">
            Questions, feedback, or partnership inquiries? We're just one message away.
          </p>
          <FacebookLink />
        </div>
      </div>
    </MarketingLayout>
  );
}
