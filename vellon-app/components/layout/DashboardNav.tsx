"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "My Events", icon: LayoutDashboard },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function useProfile() {
  const [profile, setProfile] = useState<{ name: string | null; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const metaName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | null;
      setProfile({ name: metaName, email: user.email ?? "" });
    });
  }, []);

  return profile;
}

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const profile = useProfile();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = profile?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    ?? profile?.email?.[0]?.toUpperCase()
    ?? "U";

  return (
    <aside
      className={[
        "fixed top-0 left-0 h-full bg-[#1F2937] flex flex-col z-40 hidden lg:flex transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif font-bold text-xl tracking-tight">
          <span className="text-[#C9A84C]">Vellon</span>
          <span className="text-white/60 font-light">.photos</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5",
                collapsed ? "justify-center" : "",
              ].join(" ")}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + logout + collapse */}
      <div className="px-3 pb-4 space-y-2">
        {/* User */}
        <div className={[
          "flex items-center gap-3 px-3 py-2 rounded-xl",
          collapsed ? "justify-center" : "",
        ].join(" ")}>
          <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/25 flex items-center justify-center flex-shrink-0">
            {profile?.name ? (
              <span className="text-xs font-bold text-[#C9A84C]">{initials}</span>
            ) : (
              <User size={16} className="text-[#C9A84C]" />
            )}
          </div>
          {!collapsed && profile && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.name ?? "Host"}</p>
              <p className="text-[10px] text-white/40 truncate">{profile.email}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={[
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all",
            collapsed ? "justify-center" : "",
          ].join(" ")}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={[
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all",
            collapsed ? "justify-center" : "",
          ].join(" ")}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] flex lg:hidden pb-[env(safe-area-inset-bottom)]">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] transition-all font-medium",
              active ? "text-[#C9A84C]" : "text-[#9CA3AF]",
            ].join(" ")}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] text-[#9CA3AF] hover:text-red-400 transition-all font-medium"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </nav>
  );
}
