import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, base_amount } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Voucher code required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("validate_voucher", {
    p_code: code,
    p_base_amount: base_amount ?? 699,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] ?? { valid: false, message: "Invalid code" });
}
