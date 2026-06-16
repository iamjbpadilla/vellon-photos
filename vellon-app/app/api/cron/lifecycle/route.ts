import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: Request) {
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data: results, error } = await supabase.rpc("run_lifecycle");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const warnings = results?.filter((r) => r.action.startsWith("warning_")) ?? [];
  const purged = results?.filter((r) => r.action === "purged") ?? [];

  for (const item of warnings) {
    const { data: event } = await supabase
      .from("events")
      .select("title, event_code, expires_at, profiles(email, name)")
      .eq("id", item.event_id)
      .single();

    if (!event || !resend) continue;

    const hostEmail = (event.profiles as { email: string; name: string | null } | null)?.email;
    const hostName = (event.profiles as { email: string; name: string | null } | null)?.name ?? "there";
    const daysLabel = item.action === "warning_3d" ? "3 days" : "1 day";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    if (hostEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@vellon.photos",
        to: hostEmail,
        subject: `Your gallery expires in ${daysLabel} — ${event.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#020617;color:#f1f5f9;border-radius:12px;">
            <h1 style="font-size:20px;color:#D4AF37;">Gallery Expiring in ${daysLabel}</h1>
            <p>Hi ${hostName}, your gallery <strong>${event.title}</strong> will expire on <strong>${new Date(event.expires_at!).toLocaleDateString()}</strong>.</p>
            <p style="color:#94a3b8;font-size:14px;">Make sure to download all photos before then.</p>
            <a href="${appUrl}/e/${event.event_code}" style="display:block;padding:12px;background:linear-gradient(135deg,#D4AF37,#e8c84a);color:#020617;font-weight:600;text-align:center;border-radius:8px;text-decoration:none;margin-top:16px;">View Gallery →</a>
          </div>
        `,
      });
    }
  }

  for (const item of purged) {
    const { data: photos } = await supabase
      .from("photos")
      .select("storage_path")
      .eq("event_id", item.event_id);

    if (photos?.length) {
      const paths = photos.map((p) => p.storage_path);
      await supabase.storage.from("event-photos").remove(paths);
    }

    await supabase.from("photos").delete().eq("event_id", item.event_id);
  }

  return NextResponse.json({
    ok: true,
    warnings: warnings.length,
    purged: purged.length,
  });
}
