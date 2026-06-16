import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "light";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl",
        variant === "default" ? "glass" : "glass-light",
        paddingClasses[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
