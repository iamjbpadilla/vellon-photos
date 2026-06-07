import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-serif font-bold text-lg tracking-tight">
              <span className="text-[#C9A84C]">Vellon</span>
              <span className="text-[#6B7280] font-light">.photos</span>
            </Link>
            <span className="text-xs text-[#C9A84C]/80 font-medium flex items-center gap-1">
              <Shield size={10} />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xs text-[#6B7280] hover:text-[#1F2937] transition-colors">
              Queue
            </Link>
            <Link href="/dashboard" className="text-xs text-[#6B7280] hover:text-[#1F2937] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
