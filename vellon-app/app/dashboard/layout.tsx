import { DashboardNav, DashboardMobileNav } from "@/components/layout/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <DashboardNav />
      <main className="lg:pl-64 pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
      <DashboardMobileNav />
    </div>
  );
}
