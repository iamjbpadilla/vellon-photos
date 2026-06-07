import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PaymentUploader } from "@/components/dashboard/PaymentUploader";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (!event) notFound();

  const { data: existingProof } = await supabase
    .from("payment_proofs")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/events/${id}`}
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F2937]">Submit Payment</h1>
          <p className="text-[#9CA3AF] text-sm mt-0.5">{event.title}</p>
        </div>
      </div>

      {existingProof && existingProof.status === "pending" ? (
        <div className="bg-white rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-medium text-[#1F2937]">Payment Under Review</h3>
          </div>
          <p className="text-[#6B7280] text-sm mb-2">
            Your receipt has been submitted. Our team will verify and activate your gallery
            within 1 business day.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            Ref: <span className="font-mono text-[#6B7280]">{existingProof.ref_number}</span>
          </p>
        </div>
      ) : existingProof?.status === "verified" ? (
        <div className="bg-white rounded-2xl p-6 border border-emerald-200">
          <p className="text-emerald-600 font-medium">Payment verified ✓</p>
          <p className="text-[#6B7280] text-sm mt-1">Your gallery is now live.</p>
        </div>
      ) : (
        <PaymentUploader event={event} rejectedProof={existingProof ?? null} />
      )}
    </div>
  );
}
