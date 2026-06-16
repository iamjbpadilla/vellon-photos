import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const content = (
    <span className={`font-serif font-bold tracking-tight ${sizeMap[size]}`}>
      <span className="text-gold-gradient">Vellon</span>
      <span className="text-slate-400 font-light">.photos</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
