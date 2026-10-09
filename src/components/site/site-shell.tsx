import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";

const NAV = [
  { href: "/#produto", label: "Produto" },
  { href: "/casos-de-uso", label: "Casos de uso" },
  { href: "/como-usar", label: "Como usar" },
  { href: "/#preco", label: "Preço" },
];

export const APK_URL = "/download/vico.apk";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-wide items-center gap-6 px-5">
        <Link href="/" className="font-display text-[28px] font-extrabold tracking-[-0.05em] text-accent">viço</Link>
        <nav aria-label="Site" className="hidden flex-1 gap-1 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-pill px-3 py-2 text-[15px] font-semibold text-muted hover:bg-surface hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/entrar" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>Entrar</Link>
          <Link href="/app" className={buttonClasses("primary", "sm")}>Abrir o app</Link>
        </div>
      </div>
      <nav aria-label="Site (celular)" className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-pill px-3 py-1.5 text-sm font-semibold text-muted">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-wide gap-8 px-5 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="font-display text-[28px] font-extrabold tracking-[-0.05em] text-accent">viço</p>
          <p className="text-sm text-muted">Sua pele lida, sua rotina na ordem certa.</p>
        </div>
        <ul className="space-y-2 text-sm">
          <li><Link href="/como-usar" className="hover:underline">Manual de uso</Link></li>
          <li><Link href="/casos-de-uso" className="hover:underline">Casos de uso</Link></li>
          <li><Link href="/privacidade" className="hover:underline">Privacidade e dados</Link></li>
        </ul>
        <ul className="space-y-2 text-sm">
          <li><Link href="/app" className="hover:underline">Abrir o app</Link></li>
          <li><a href={APK_URL} download className="hover:underline">Baixar para Android</a></li>
          <li><Link href="/entrar" className="hover:underline">Entrar</Link></li>
        </ul>
      </div>
      <p className="mx-auto max-w-wide px-5 pb-8 text-xs text-muted">
        Viço · Análise cosmética, não é diagnóstico médico. Para qualquer condição de pele, procure um dermatologista.
      </p>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <section className="mx-auto max-w-3xl space-y-4 px-5 pt-12 pb-6">
      <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-accent">{eyebrow}</p>
      <h1 className="font-display text-[40px] leading-[44px] font-extrabold tracking-[-0.035em] sm:text-[52px] sm:leading-[54px]">{title}</h1>
      <p className="text-lg text-muted">{intro}</p>
    </section>
  );
}
