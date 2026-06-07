import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { QRCodePanel } from "@/components/dashboard/QRCodePanel";
import { EventSettingsForm } from "@/components/dashboard/EventSettingsForm";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!event) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const galleryUrl = `${appUrl}/e/${event.event_code}`;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-bold text-[#1F2937] truncate">{event.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-[#C9A84C] tracking-wider">{event.event_code}</span>
            <Badge variant={event.status} theme="light" />
          </div>
        </div>
        <a
          href={galleryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors bg-white"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="space-y-6">
        {/* QR Code */}
        <QRCodePanel event={event} galleryUrl={galleryUrl} />

        {/* Settings */}
        <EventSettingsForm event={event} />

        {/* Payment */}
        {(event.status === "trial" || event.status === "pending") && (
          <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#E5E7EB]">
            <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-1">
              Activate Your Gallery
            </h3>
            <p className="text-[#6B7280] text-sm mb-4">
              Pay ₱699 and submit your receipt to go live for 15 days.
            </p>
            <Link
              href={`/dashboard/events/${event.id}/payment`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
            >
              Submit Payment Receipt
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
