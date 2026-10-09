import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Droplets, Plus } from "lucide-react";
import { PERIOD_LABELS } from "@/components/app/labels";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePageUser } from "@/lib/auth";
import { listProducts } from "@/lib/data/products";
import { signedPhotoUrl } from "@/lib/supabase";

const photoUrl = (path: string | null) => (path ? signedPhotoUrl(path).catch(() => null) : Promise.resolve(null));

async function Closet() {
  const user = await requirePageUser();
  const products = await listProducts(user.id);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Droplets}
        title="Seu armário está vazio"
        text="Fotografe o rótulo dos produtos que você usa. A gente monta a ordem certa e avisa sobre combinações arriscadas."
        action={<Link href="/app/produtos/novo" className={buttonClasses("primary", "lg")}>Adicionar primeiro produto</Link>}
      />
    );
  }

  const photos = await Promise.all(products.map((p) => photoUrl(p.imagePath)));

  return (
    <ul className="grid grid-cols-2 gap-3">
      {products.map((p, i) => (
        <li key={p.id} className="rise" style={{ ["--i" as string]: Math.min(i, 5) }}>
          <Link href={`/app/produtos/${p.id}`} className="press block overflow-hidden rounded-[20px] bg-surface-raised">
            <span className="block h-[110px] bg-surface">
              {photos[i] && (
                // eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do Storage
                <img src={photos[i]!} alt="" className="size-full object-cover" />
              )}
            </span>
            <span className="block space-y-1 p-3">
              <span className="block truncate text-[13px] text-muted">{p.brand}</span>
              <span className="line-clamp-2 block min-h-10 text-[15px] leading-5 font-semibold">{p.name}</span>
              <span className="inline-flex rounded-pill bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">{PERIOD_LABELS[p.period]}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ClosetPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2 pb-2">
        <Link href="/app/rotina" aria-label="Voltar para Rotina" className="press -ml-2 grid size-11 place-items-center rounded-pill">
          <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="flex-1 font-display text-[28px]">Meu armário</h1>
        <Link href="/app/produtos/novo" aria-label="Adicionar produto" className={buttonClasses("primary", "sm", "w-11 px-0")}>
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
        </Link>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Closet />
      </Suspense>
    </div>
  );
}
