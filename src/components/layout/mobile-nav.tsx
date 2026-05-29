"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/components/layout/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) => !item.disabled).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white lg:hidden">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              isActive ? "text-teal" : "text-slate-500"
            }`}
          >
            <span className="text-xs font-semibold">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
