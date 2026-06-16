import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-[#9CA3AF] mb-8">
      <Link href="/" className="hover:text-[#1F2937] transition-colors">
        <Home size={14} />
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-[#E5E7EB]" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[#1F2937] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1F2937] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
