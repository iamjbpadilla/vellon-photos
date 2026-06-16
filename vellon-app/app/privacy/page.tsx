import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { FacebookLink } from "@/components/ui/FacebookLink";

export const metadata = {
  title: "Privacy Policy — Vellon.photos",
};

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Legal</p>
        <h1 className="font-serif text-4xl font-bold text-[#1F2937] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-8">Last updated: June 2026</p>
        <div className="w-12 h-px bg-[#C9A84C] mb-8 opacity-60" />

        <div className="space-y-8 text-sm text-[#6B7280] leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you register an account (name, email address, password), create an event, or contact us. Guests who upload photos to an event do so anonymously and are not required to create an account.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">2. Photos and Content</h2>
            <p>Photos uploaded to a gallery are stored securely in cloud storage (Supabase) and are accessible only via the unique event code. Event galleries expire after 15 days of activation, after which all associated photos are permanently deleted from our servers.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">3. Payment Information</h2>
            <p>Vellon does not store payment card information. Payments are processed via GCash manual verification. Payment proof screenshots are stored only for verification purposes and deleted after review.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the Vellon service</li>
              <li>To send transactional emails (event activation, payment status)</li>
              <li>To prevent fraud and enforce our Terms of Service</li>
              <li>To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We use Supabase for database and storage infrastructure, and Resend for transactional email delivery.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">6. Data Retention</h2>
            <p>Host accounts and their data are retained until you request deletion. Gallery photos are automatically deleted 15 days after activation. Trial events that are never activated are deleted after 48 hours.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">7. Contact</h2>
            <p className="text-[#6B7280] mb-3">For privacy-related requests, reach out anytime.</p>
            <FacebookLink text="Privacy request on Facebook" />
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
