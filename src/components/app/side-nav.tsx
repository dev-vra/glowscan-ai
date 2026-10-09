"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CalendarCheck, Home, LineChart, Package, Plus, User } from "lucide-react";

const ITEMS = [
  { href: "/app", label: "Hoje", icon: Home },
  { href: "/app/rotina", label: "Rotina", icon: CalendarCheck },
  { href: "/app/produtos", label: "Armário", icon: Package },
  { href: "/app/evolucao", label: "Evolução", icon: LineChart },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

// Desktop (≥1024px): sidebar de 240px no lugar da bottom nav.
export function SideNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  return (
    <nav aria-label="Principal" className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-border bg-bg px-4 py-8 lg:flex">
      <Link href="/app" className="mb-8 px-3 font-display text-[32px] font-extrabold tracking-[-0.05em]">viço</Link>
      <ul className="space-y-1">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href} aria-current={isActive(href) ? "page" : undefined}
              className={clsx(
                "flex h-11 items-center gap-3 rounded-[14px] px-3 font-semibold",
                isActive(href) ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface",
              )}
            >
              <Icon className="size-5" strokeWidth={2} aria-hidden /> {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/app/scan/rosto"
        className="press mt-auto flex h-12 items-center justify-center gap-2 rounded-pill bg-accent font-bold text-on-accent shadow-pop"
      >
        <Plus className="size-5" strokeWidth={2.5} aria-hidden /> Nova análise
      </Link>
    </nav>
  );
}
