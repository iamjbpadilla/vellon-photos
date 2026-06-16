import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { FacebookLink } from "@/components/ui/FacebookLink";

export const metadata = {
  title: "Terms of Service — Vellon.photos",
};

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Legal</p>
        <h1 className="font-serif text-4xl font-bold text-[#1F2937] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#9CA3AF] mb-8">Last updated: June 2026</p>
        <div className="w-12 h-px bg-[#C9A84C] mb-8 opacity-60" />

        <div className="space-y-8 text-sm text-[#6B7280] leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Vellon.photos, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">2. The Service</h2>
            <p>Vellon.photos provides a browser-based event photo sharing platform. Hosts create private galleries that guests access via a unique QR code. No app download is required for guests.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">3. Accounts and Registration</h2>
            <p>You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to register as a host.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">4. Acceptable Use</h2>
            <p>You agree not to upload content that is illegal, harmful, harassing, defamatory, or infringes on the intellectual property rights of others. Vellon reserves the right to remove content and terminate accounts that violate this policy.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">5. Payments</h2>
            <p>The current price for event activation is ₱699 (one-time, per event). A free 48-hour trial is included with every new account. Payments are made via GCash and verified manually by our team.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">6. Intellectual Property</h2>
            <p>You retain ownership of all photos you and your guests upload. By uploading, you grant Vellon a limited license to store and display photos within your private gallery. We do not use your photos for marketing without explicit consent.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">7. Limitation of Liability</h2>
            <p>Vellon.photos is provided "as is." We are not liable for loss of data beyond our reasonable control, including data lost after the 15-day gallery expiry period. We recommend downloading all photos before expiry.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">8. Contact</h2>
            <p className="text-[#6B7280] mb-3">Questions about these terms? We're happy to help.</p>
            <FacebookLink text="Terms question on Facebook" />
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
