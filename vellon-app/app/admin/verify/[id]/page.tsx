import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerifyPanel } from "@/components/admin/VerifyPanel";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: proof } = await supabase
    .from("payment_proofs")
    .select("*")
    .eq("id", id)
    .single();

  if (!proof) notFound();

  const { data: event } = await supabase
    .from("events")
    .select("*, profiles(name, email)")
    .eq("id", proof.event_id)
    .single();

  if (!event) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin"
          className="p-2 rounded-xl border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#1F2937] hover:border-[#1F2937]/20 transition-colors bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F2937]">Verify Payment</h1>
          <p className="text-[#9CA3AF] text-sm mt-0.5">Review receipt and activate gallery</p>
        </div>
      </div>

      <VerifyPanel proof={proof} event={event as Parameters<typeof VerifyPanel>[0]["event"]} />
    </div>
  );
}
