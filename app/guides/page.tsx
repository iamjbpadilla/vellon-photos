import { Breadcrumbs } from "@/components/Breadcrumbs";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Cake, Building2, Smartphone, PartyPopper } from "lucide-react";

export default function GuidesIndex() {
  const guides = [
    { icon: Heart, title: "Wedding Photo Sharing", desc: "Curate every candid angle from the aisle to the after-party.", slug: "wedding-photo-sharing-philippines" },
    { icon: Sparkles, title: "Debut Photo Sharing", desc: "Perfect for 18th-birthday milestones and celebrations.", slug: "debut-photo-sharing" },
    { icon: Cake, title: "Birthday Photo Sharing", desc: "Capture the joy of every family milestone.", slug: "birthday-photo-sharing" },
    { icon: Building2, title: "Corporate Event Photo Sharing", desc: "Elevate launches, team building, and company events.", slug: "corporate-event-photo-sharing" },
    { icon: Smartphone, title: "The No-App Experience", desc: "Designed specifically for effortless, browser-based sharing.", slug: "no-download-photo-sharing" },
    { icon: PartyPopper, title: "Event Photo Sharing", desc: "From barkada trips to family reunions — collect every candid moment.", slug: "event-photo-sharing" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <Breadcrumbs items={[{ label: "Guides" }]} />
        
        <div className="mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
            Guides
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl">
            Learn how Vellon.photos can help you capture and share your most precious moments. Explore our guides for different event types and use cases.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] hover:border-[#C9A84C]/40 hover:shadow-md transition-all group cursor-pointer h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                  <guide.icon size={24} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2 group-hover:text-[#C9A84C] transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4 flex-grow">{guide.desc}</p>
                <span className="text-sm font-semibold text-[#C9A84C] hover:text-[#B8963E] transition-colors inline-flex items-center gap-1">
                  Read the Guide <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
