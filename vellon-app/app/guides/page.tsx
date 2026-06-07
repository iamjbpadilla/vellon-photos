import Link from "next/link";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { guides } from "@/lib/guides";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Photo Sharing Guides — Vellon.photos",
  description: "Expert guides on event photo sharing, QR photo sharing, wedding galleries, and more.",
};

export default function GuidesIndexPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Guides</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4 leading-tight">
          Everything you need to know about event photo sharing.
        </h1>
        <p className="text-[#6B7280] text-lg mb-12">
          Practical guides for hosts, planners, and anyone who wants to capture every moment of their celebration.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group block bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#C9A84C]/40 hover:shadow-md transition-all"
            >
              <h2 className="font-serif text-lg font-semibold text-[#1F2937] mb-2 group-hover:text-[#C9A84C] transition-colors leading-snug">
                {g.headline}
              </h2>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4 line-clamp-3">{g.intro}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C9A84C]">
                Read guide <ArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
