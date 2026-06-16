"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

interface Props {
  event: Event;
}

export function EventSettingsForm({ event }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("events")
      .update({ title, description: description || null })
      .eq("id", event.id);

    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h3 className="font-serif text-lg font-semibold text-[#1F2937] mb-4">Event Settings</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Event Name</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            placeholder="Add a short description for your guests…"
            className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={saving}
          className="w-full"
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
