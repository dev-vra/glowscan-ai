import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Droplets, Plus } from "lucide-react";
import { CATEGORY_LABELS, PERIOD_LABELS } from "@/components/app/labels";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePageUser } from "@/lib/auth";
import { listProducts } from "@/lib/data/products";

async function Closet() {
  const user = await requirePageUser();
  const products = await listProducts(user.id);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Droplets}
        title="Seu armário está vazio"
        text="Fotografe o rótulo dos produtos que você usa. Montamos a ordem certa e avisamos sobre combinações arriscadas."
        action={<Link href="/app/produtos/novo" className={buttonClasses("primary", "md")}>Adicionar primeiro produto</Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border rounded-lg bg-surface-raised shadow-card">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/app/produtos/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-surface">
              <span className="min-w-0 flex-1">
                <Eyebrow className="truncate">{p.brand}</Eyebrow>
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="text-xs text-muted">{CATEGORY_LABELS[p.category]} · {PERIOD_LABELS[p.period]}</span>
              </span>
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/app/produtos/novo" className={buttonClasses("secondary", "lg")}><Plus className="size-5" aria-hidden /> Adicionar produto</Link>
    </div>
  );
}

export default function ClosetPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Eyebrow>Armário</Eyebrow>
        <h1 className="font-display text-xl">Seus produtos</h1>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Closet />
      </Suspense>
    </div>
  );
}
