"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function generateEventCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    const code = generateEventCode();

    const { data: event, error: dbErr } = await supabase
      .from("events")
      .insert({
        event_code: code,
        title: title.trim(),
        description: description.trim() || null,
        host_id: user.id,
        status: "trial",
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (dbErr || !event) {
      setError(dbErr?.message ?? "Failed to create event.");
      setCreating(false);
      return;
    }

    router.push(`/dashboard/events/${event.id}`);
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F2937]">Create New Event</h1>
          <p className="text-[#9CA3AF] text-sm mt-0.5">Free 48-hour trial included</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Event Name</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sarah & Marco's Wedding"
              className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">
              Description <span className="text-[#9CA3AF]">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short message for your guests…"
              className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={creating} className="w-full">
            Create Event Gallery
          </Button>
        </form>
      </div>
    </div>
  );
}
