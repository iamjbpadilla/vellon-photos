import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    displayName = profile?.name ?? user.email?.split("@")[0] ?? null;
  }

  return <LandingPage user={user} displayName={displayName} />;
}
