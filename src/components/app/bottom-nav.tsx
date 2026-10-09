"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CalendarCheck, Home, LineChart, Plus, User } from "lucide-react";

const ITEMS = [
  { href: "/app", label: "Hoje", icon: Home },
  { href: "/app/rotina", label: "Rotina", icon: CalendarCheck },
  { href: "/app/evolucao", label: "Evolução", icon: LineChart },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  const renderItem = ({ href, label, icon: Icon }: (typeof ITEMS)[number]) => (
    <Link
      key={href} href={href} aria-current={isActive(href) ? "page" : undefined}
      className={clsx("flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold", isActive(href) ? "text-accent" : "text-muted")}
    >
      <Icon className="size-5" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-content items-center px-2">
        {ITEMS.slice(0, 2).map(renderItem)}
        <Link
          href="/app/scan/rosto" aria-label="Nova análise"
          className="press -mt-[22px] grid size-14 place-items-center rounded-pill bg-accent text-on-accent shadow-pop"
        >
          <Plus className="size-6" strokeWidth={2.5} aria-hidden />
        </Link>
        {ITEMS.slice(2).map(renderItem)}
      </div>
    </nav>
  );
}
