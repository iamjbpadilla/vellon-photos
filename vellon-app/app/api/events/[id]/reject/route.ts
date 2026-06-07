import { createServiceClient, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { proofId, notes } = await request.json();

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

  await serviceClient
    .from("payment_proofs")
    .update({ status: "rejected", admin_notes: notes ?? null })
    .eq("id", proofId);

  await serviceClient
    .from("events")
    .update({ status: "trial" })
    .eq("id", id);

  const { data: event } = await serviceClient
    .from("events")
    .select("title, profiles(email, name)")
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
        subject: `Payment review update — ${event.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#020617;color:#f1f5f9;border-radius:12px;">
            <h1 style="font-size:20px;color:#f1f5f9;margin-bottom:8px;">Payment Submission Update</h1>
            <p>Hi ${hostName}, unfortunately we couldn't verify your payment for <strong>${event.title}</strong>.</p>
            ${notes ? `<p style="background:#0f172a;padding:12px;border-radius:8px;color:#94a3b8;font-size:14px;">${notes}</p>` : ""}
            <p style="color:#94a3b8;font-size:14px;">Please resubmit your GCash receipt with the correct reference number.</p>
            <a href="${appUrl}/dashboard" style="display:block;padding:12px;background:linear-gradient(135deg,#D4AF37,#e8c84a);color:#020617;font-weight:600;text-align:center;border-radius:8px;text-decoration:none;margin-top:16px;">Go to Dashboard →</a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ success: true });
}
