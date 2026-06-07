type BadgeVariant = "trial" | "pending" | "active" | "archived" | "gold" | "default";
type BadgeTheme = "dark" | "light";

const darkMap: Record<BadgeVariant, string> = {
  trial: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  pending: "bg-amber-900/50 text-amber-300 border-amber-700/50",
  active: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  archived: "bg-slate-800/50 text-slate-400 border-slate-700/50",
  gold: "bg-gold/10 text-gold border-gold/30",
  default: "bg-navy-700/50 text-slate-300 border-slate-700/50",
};

const lightMap: Record<BadgeVariant, string> = {
  trial: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
  gold: "bg-[#FDF6E3] text-[#C9A84C] border-[#F0E6CC]",
  default: "bg-slate-100 text-slate-600 border-slate-200",
};

const labelMap: Record<string, string> = {
  trial: "Trial",
  pending: "Pending Review",
  active: "Live",
  archived: "Archived",
};

interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  className?: string;
  theme?: BadgeTheme;
}

export function Badge({ variant = "default", label, className = "", theme = "dark" }: BadgeProps) {
  const displayLabel = label ?? (variant !== "gold" && variant !== "default" ? labelMap[variant] : variant);
  const map = theme === "light" ? lightMap : darkMap;
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        map[variant],
        className,
      ].join(" ")}
    >
      {displayLabel}
    </span>
  );
}
