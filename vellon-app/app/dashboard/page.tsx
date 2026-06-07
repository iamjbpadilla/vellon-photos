import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Event } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import {
  Plus, Camera, Clock, ExternalLink, QrCode, AlertTriangle, Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "No expiry set";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} days left`;
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${hours}h left`;
}

function StatusAlert({ event }: { event: Event }) {
  if (event.status === "pending") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
        <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800 font-medium leading-relaxed">
          Payment required to enable photo uploads.
        </p>
      </div>
    );
  }
  if (event.status === "trial") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-4">
        <Sparkles size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-emerald-800 font-medium leading-relaxed">
          Free trial — uploads enabled for 48 hours.
        </p>
      </div>
    );
  }
  return null;
}

function EventCard({ event }: { event: Event }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const galleryUrl = `${appUrl}/e/${event.event_code}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-[#C9A84C]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Alert banner */}
      <StatusAlert event={event} />

      <div className="px-5 pb-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-[#1F2937] truncate">
              {event.title}
            </h3>
            <p className="text-sm text-[#9CA3AF] font-mono mt-0.5 tracking-wider uppercase">
              {event.event_code}
            </p>
          </div>
          <Badge variant={event.status} theme="light" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-[#9CA3AF] mb-5">
          <span className="flex items-center gap-1">
            <Camera size={12} />
            {event.photo_count} photos
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatExpiry(event.expires_at)}
          </span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1F2937] text-white text-sm font-semibold hover:bg-[#374151] transition-colors"
          >
            View Event
          </Link>
          <a
            href={galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors"
            title="Open gallery"
          >
            <QrCode size={16} />
          </a>
          <a
            href={galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors"
            title="Open gallery"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const activeEvents = events?.filter((e) => e.status === "active") ?? [];
  const trialEvents = events?.filter((e) => e.status === "trial") ?? [];
  const pendingEvents = events?.filter((e) => e.status === "pending") ?? [];
  const archivedEvents = events?.filter((e) => e.status === "archived") ?? [];

  return (
    <div>
      {/* Top bar */}
      <FadeIn className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937]">My Events</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {events?.length ?? 0} total · {activeEvents.length} live
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
        >
          <Plus size={16} />
          Create Event
        </Link>
      </FadeIn>

      {/* Empty state */}
      {!events?.length && (
        <FadeIn delay={0.1}>
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
            <Camera size={40} className="text-[#E5E7EB] mx-auto mb-4" />
            <h3 className="font-serif text-xl text-[#1F2937] mb-2">No events yet</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">Create your first event gallery.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1F2937] text-white font-semibold text-sm hover:bg-[#374151] transition-colors"
            >
              <Plus size={16} />
              Create Event
            </Link>
          </div>
        </FadeIn>
      )}

      {/* Event sections */}
      {activeEvents.length > 0 && (
        <section className="mb-10">
          <FadeIn>
            <h2 className="text-sm font-semibold text-[#C9A84C] tracking-[0.2em] uppercase mb-4">Live</h2>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map((e) => <StaggerItem key={e.id}><EventCard event={e} /></StaggerItem>)}
          </StaggerContainer>
        </section>
      )}

      {trialEvents.length > 0 && (
        <section className="mb-10">
          <FadeIn>
            <h2 className="text-sm font-semibold text-blue-500 tracking-[0.2em] uppercase mb-4">Trial</h2>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trialEvents.map((e) => <StaggerItem key={e.id}><EventCard event={e} /></StaggerItem>)}
          </StaggerContainer>
        </section>
      )}

      {pendingEvents.length > 0 && (
        <section className="mb-10">
          <FadeIn>
            <h2 className="text-sm font-semibold text-amber-600 tracking-[0.2em] uppercase mb-4">Pending Review</h2>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEvents.map((e) => <StaggerItem key={e.id}><EventCard event={e} /></StaggerItem>)}
          </StaggerContainer>
        </section>
      )}

      {archivedEvents.length > 0 && (
        <section className="mb-10">
          <FadeIn>
            <h2 className="text-sm font-semibold text-[#9CA3AF] tracking-[0.2em] uppercase mb-4">Archived</h2>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {archivedEvents.map((e) => <StaggerItem key={e.id}><EventCard event={e} /></StaggerItem>)}
          </StaggerContainer>
        </section>
      )}
    </div>
  );
}
