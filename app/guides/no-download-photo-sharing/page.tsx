import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Check, Smartphone, X, Download, Zap } from "lucide-react";

export default function NoDownloadPhotoSharingGuide() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "No-Download Photo Sharing" }]} />
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Smartphone size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            The No-App Experience
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Designed specifically for effortless, browser-based sharing. Your guests can upload photos without downloading any app — just scan and share.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">Why No-App Matters</h2>
          <p className="text-[#6B7280] mb-4">
            Traditional photo sharing apps require guests to download, register, and learn a new interface. Vellon.photos eliminates all friction:
          </p>
          <ul className="space-y-4">
            {[
              "No app store downloads",
              "No account registration required for guests",
              "No storage permissions to approve",
              "Works on any device with a browser",
              "Instant access — scan and upload in seconds",
              "Privacy-focused — guests control what they share",
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
                title: "Scan the QR Code",
                desc: "Guests open their phone camera and scan your event QR code. No app needed — it opens directly in their browser.",
              },
              {
                step: "2",
                title: "Tap to Upload",
                desc: "A simple, beautiful interface appears. Guests tap the upload button and select photos from their camera roll.",
              },
              {
                step: "3",
                title: "Instant Sharing",
                desc: "Photos appear in your gallery in real-time. No waiting, no syncing, no delays.",
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
          <h2 className="font-serif text-2xl font-semibold text-[#1F2937] mb-4">What We Eliminated</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: X, label: "App store downloads", desc: "No 50MB+ app to install" },
              { icon: X, label: "Account creation", desc: "No email or password required" },
              { icon: X, label: "Storage permissions", desc: "No scary permission dialogs" },
              { icon: X, label: "Learning curve", desc: "Intuitive interface anyone can use" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <item.icon size={14} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2937] text-sm">{item.label}</h3>
                  <p className="text-[#6B7280] text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1F2937] rounded-2xl p-8 text-white">
          <h2 className="font-serif text-2xl font-semibold mb-4">Experience the Difference</h2>
          <p className="text-[#D1D5DB] mb-6">
            Try Vellon.photos's no-app experience. Your guests will thank you for making photo sharing effortless.
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
