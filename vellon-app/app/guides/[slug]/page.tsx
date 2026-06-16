import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { guides, getGuide } from "@/lib/guides";
import { ArrowRight } from "lucide-react";

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const otherGuides = guides.filter((g) => g.slug !== slug).slice(0, 4);

  return (
    <MarketingLayout backHref="/guides" backLabel="All guides">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-3">Guide</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-6 leading-tight">
          {guide.headline}
        </h1>
        <div className="w-12 h-px bg-[#C9A84C] mb-8 opacity-60" />

        <p className="text-lg text-[#6B7280] leading-relaxed mb-10">{guide.intro}</p>

        <div className="space-y-8">
          {guide.sections.map(({ heading, body }) => (
            <section key={heading}>
              <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-3">{heading}</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">{body}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-[#FDFBF7] rounded-2xl border border-[#E5E7EB] p-8 text-center">
          <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">Ready to try it?</h3>
          <p className="text-sm text-[#6B7280] mb-6">Free 48-hour trial. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
          >
            Start Your Event <ArrowRight size={14} />
          </Link>
        </div>

        {/* Related guides */}
        {otherGuides.length > 0 && (
          <div className="mt-14">
            <h2 className="font-serif text-xl font-semibold text-[#1F2937] mb-6">More Guides</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="block bg-white rounded-xl border border-[#E5E7EB] p-5 hover:border-[#C9A84C]/40 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-semibold text-[#1F2937] mb-1 group-hover:text-[#C9A84C] transition-colors">
                    {g.headline}
                  </p>
                  <p className="text-sm text-[#9CA3AF] line-clamp-2">{g.intro}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MarketingLayout>
  );
}
