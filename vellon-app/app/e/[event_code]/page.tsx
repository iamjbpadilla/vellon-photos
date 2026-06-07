import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GuestGalleryClient } from "./GuestGalleryClient";

interface Props {
  params: Promise<{ event_code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { event_code } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("event_code", event_code.toUpperCase())
    .single();

  if (!event) return {};

  return {
    title: `${event.title} · Vellon.photos`,
    description: event.description ?? "View and upload photos to this event gallery.",
  };
}

export default async function GuestGalleryPage({ params }: Props) {
  const { event_code } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("event_code", event_code.toUpperCase())
    .single();

  if (!event) notFound();

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  return (
    <GuestGalleryClient
      event={event}
      initialPhotos={photos ?? []}
    />
  );
}
