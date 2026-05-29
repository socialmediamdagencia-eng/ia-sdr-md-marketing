"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/components/layout/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-line bg-white px-4 py-5 lg:block">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
            MD
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">MD Marketing</p>
            <p className="text-xs text-slate-500">IA SDR Platform</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400"
                title="Módulo previsto para próxima etapa"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[11px] font-semibold">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-teal text-white" : "text-graphite hover:bg-mist hover:text-ink"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-semibold ${
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
