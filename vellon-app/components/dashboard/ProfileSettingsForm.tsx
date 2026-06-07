"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Props {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() || null })
      .eq("id", profile.id);

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
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
      <div>
        <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Email</label>
        <input
          disabled
          value={profile.email}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#9CA3AF] cursor-not-allowed"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/20 focus:border-[#1F2937] transition-all"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" variant="primary" size="md" loading={saving} className="w-full">
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
