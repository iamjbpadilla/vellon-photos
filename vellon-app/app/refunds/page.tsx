import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { FacebookLink } from "@/components/ui/FacebookLink";
import Link from "next/link";

export const metadata = {
  title: "Refund Policy — Vellon.photos",
};

export default function RefundsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Legal</p>
        <h1 className="font-serif text-4xl font-bold text-[#1F2937] mb-2">Refund Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-8">Last updated: June 2026</p>
        <div className="w-12 h-px bg-[#C9A84C] mb-8 opacity-60" />

        <div className="space-y-8 text-sm text-[#6B7280] leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">Our Commitment</h2>
            <p>We want you to be fully satisfied with Vellon.photos. Every account includes a free 48-hour trial so you can explore the full platform before paying.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">Eligibility for a Refund</h2>
            <p>You may request a full refund of your ₱699 event payment within <strong className="text-[#1F2937]">7 days of activation</strong>, provided:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>The gallery has fewer than 10 uploaded photos</li>
              <li>The request is made within 7 calendar days of payment confirmation</li>
              <li>The event has not yet taken place</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">Non-Refundable Situations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refunds are not available after the event date has passed</li>
              <li>Refunds are not available if the gallery has 10 or more uploaded photos</li>
              <li>Duplicate payments are refunded in full — contact us immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">How to Request a Refund</h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[#6B7280]">Message us on</span>
              <FacebookLink text="Facebook" />
              <span className="text-[#6B7280]">with:</span>
            </div>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Your registered email address</li>
              <li>Your event name and event code</li>
              <li>Your GCash reference number</li>
              <li>Reason for the refund request</li>
            </ul>
            <p className="mt-4">We process all refund requests within <strong className="text-[#1F2937]">3–5 business days</strong>. Refunds are returned to the original GCash number.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">Questions?</h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[#6B7280]">Message us on</span>
              <FacebookLink text="Facebook" />
              <span className="text-[#6B7280]">or read our</span>
              <Link href="/terms" className="text-[#C9A84C] hover:underline">Terms of Service</Link>.
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
