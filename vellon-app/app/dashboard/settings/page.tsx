import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1F2937]">Settings</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Manage your account details</p>
      </div>
      {profile && <ProfileSettingsForm profile={profile} />}
    </div>
  );
}
