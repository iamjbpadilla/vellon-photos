import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { FadeIn } from "@/components/ui/FadeIn";

interface Props {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function MarketingLayout({ children, backHref = "/", backLabel = "Back to home" }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <MarketingHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <FadeIn>
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors mb-8">
            <ArrowLeft size={13} /> {backLabel}
          </Link>
          {children}
        </FadeIn>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1F2E] text-[#9CA3AF] py-10 px-5 sm:px-8 mt-12 sm:mt-16 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif font-bold text-base">
            <span className="text-[#C9A84C]">Vellon</span>
            <span className="text-[#6B7280] font-light">.photos</span>
          </span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            {[["Pricing","/pricing"],["About","/about"],["Privacy","/privacy"],["Terms","/terms"],["Refunds","/refunds"]].map(([l,h])=>(
              <Link key={l} href={h} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-sm text-[#4B5563]">© {new Date().getFullYear()} Vellon.photos</p>
        </div>
      </footer>
    </div>
  );
}
