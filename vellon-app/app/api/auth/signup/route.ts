import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function generateEventCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name ?? "" },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered") || error.status === 422) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 422 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const displayName = (name as string | undefined)?.trim();
  const eventTitle = displayName ? `${displayName}'s Free Event` : "My Free Event";

  // Create profile row so name persists across sessions
  await supabase.from("profiles").insert({
    id: data.user.id,
    email: data.user.email!,
    name: displayName || null,
    role: "user",
    onboarding_completed: true,
  });

  await supabase.from("events").insert({
    event_code: generateEventCode(),
    title: eventTitle,
    host_id: data.user.id,
    status: "trial",
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });

  return NextResponse.json({ userId: data.user.id });
}
