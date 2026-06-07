import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { proofId } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = await createServiceClient();

  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

  const { error: eventErr } = await serviceClient
    .from("events")
    .update({ status: "active", expires_at: expiresAt })
    .eq("id", id);

  if (eventErr) return NextResponse.json({ error: eventErr.message }, { status: 500 });

  await serviceClient
    .from("payment_proofs")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", proofId);

  const { data: event } = await serviceClient
    .from("events")
    .select("title, event_code, profiles(email, name)")
    .eq("id", id)
    .single();

  if (event && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const hostEmail = (event.profiles as { email: string; name: string | null } | null)?.email;
    const hostName = (event.profiles as { email: string; name: string | null } | null)?.name ?? "there";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    if (hostEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@vellon.photos",
        to: hostEmail,
        subject: `🎉 Your gallery is now live — ${event.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#020617;color:#f1f5f9;border-radius:12px;">
            <h1 style="font-size:24px;color:#D4AF37;margin-bottom:8px;">Your gallery is live!</h1>
            <p>Hi ${hostName}, payment verified. <strong>${event.title}</strong> is now active.</p>
            <p style="color:#94a3b8;font-size:14px;">Your gallery will be live for <strong style="color:#f1f5f9;">15 days</strong> from today.</p>
            <div style="margin:24px 0;padding:16px;background:#0f172a;border-radius:8px;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;">Gallery Code</p>
              <p style="font-size:28px;font-weight:bold;color:#D4AF37;letter-spacing:0.3em;margin:0;">${event.event_code}</p>
            </div>
            <a href="${appUrl}/e/${event.event_code}" style="display:block;padding:12px;background:linear-gradient(135deg,#D4AF37,#e8c84a);color:#020617;font-weight:600;text-align:center;border-radius:8px;text-decoration:none;">View Gallery →</a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ success: true });
}
