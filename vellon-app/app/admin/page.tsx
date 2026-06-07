import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { CheckCircle, Clock, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const supabase = await createClient();

  const { data: proofs } = await supabase
    .from("payment_proofs")
    .select("*, events(id, title, event_code, host_id, status, created_at)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <FadeIn className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1F2937]">Payment Queue</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {proofs?.length ?? 0} pending verification{proofs?.length !== 1 ? "s" : ""}
        </p>
      </FadeIn>

      {!proofs?.length ? (
        <FadeIn delay={0.1}>
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
            <CheckCircle size={40} className="text-emerald-400/60 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-[#1F2937] mb-2">Queue is empty</h3>
            <p className="text-[#9CA3AF] text-sm">All payments have been reviewed.</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="space-y-3">
          {proofs.map((proof) => {
            const event = proof.events as { id: string; title: string; event_code: string; status: string; created_at: string } | null;
            return (
              <StaggerItem key={proof.id}>
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between gap-4 hover:border-[#C9A84C]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[#1F2937] text-sm">{event?.title ?? "Unknown"}</span>
                    <span className="font-mono text-xs text-[#C9A84C]">{event?.event_code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(proof.created_at).toLocaleString()}
                    </span>
                    <span>Ref: <span className="font-mono">{proof.ref_number}</span></span>
                    <span className="text-[#C9A84C] font-semibold">₱{proof.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
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
                  <Link
                    href={`/admin/verify/${proof.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#1F2937] text-white font-semibold text-xs hover:bg-[#374151] transition-colors"
                  >
                    Review
                  </Link>
                </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
