import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Receipt, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_code, status")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const eventIds = events?.map((e) => e.id) ?? [];

  const { data: proofs } = eventIds.length
    ? await supabase
        .from("payment_proofs")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const eventMap = Object.fromEntries((events ?? []).map((e) => [e.id, e]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1F2937]">Billing</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Payment history and receipt status</p>
      </div>

      {!proofs?.length ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
          <Receipt size={40} className="text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="font-serif text-xl text-[#1F2937] mb-2">No payments yet</h3>
          <p className="text-[#9CA3AF] text-sm mb-6">
            Activate an event to see payment records here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {proofs?.map((proof) => {
            const event = eventMap[proof.event_id];
            return (
              <div key={proof.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[#1F2937] truncate">
                      {event?.title ?? "Unknown Event"}
                    </span>
                    <Badge
                      variant={
                        proof.status === "verified"
                          ? "active"
                          : proof.status === "rejected"
                          ? "archived"
                          : "pending"
                      }
                      label={proof.status === "verified" ? "Verified" : proof.status === "rejected" ? "Rejected" : "Pending"}
                      theme="light"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span className="font-mono">Ref: {proof.ref_number}</span>
                    <span>₱{proof.amount}</span>
                    <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                  </div>
                  {proof.admin_notes && proof.status === "rejected" && (
                    <p className="text-xs text-red-500 mt-1">{proof.admin_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {proof.status === "rejected" && event && (
                    <Link
                      href={`/dashboard/events/${proof.event_id}/payment`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
                    >
                      Resubmit
                    </Link>
                  )}
                  {proof.screenshot_url && (
                    <a
                      href={proof.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#9CA3AF] hover:text-[#C9A84C] transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
