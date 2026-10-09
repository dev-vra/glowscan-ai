import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CATEGORY_LABELS, formatDays } from "@/components/app/labels";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Badge, IngredientChip } from "@/components/ui/chip";
import { ConflictAlert } from "@/components/ui/conflict-alert";
import { buyLinks } from "@/lib/affiliate";
import { requirePageUser } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { getProduct, getRoutinePlan } from "@/lib/data/products";
import type { IngredientFamily } from "@/generated/prisma/enums";
import { deleteProductAction } from "../actions";
import { ProductForm } from "../product-form";

const HIGHLIGHT_FAMILIES = new Set<IngredientFamily>(["retinoid", "aha", "bha", "pha", "vitamin_c", "niacinamide", "benzoyl_peroxide", "peptide", "copper_peptide", "azelaic_acid"]);

const toneOf = (family: IngredientFamily, pregnancyCaution: boolean) =>
  pregnancyCaution ? "pregnancy" : family === "retinoid" ? "retinoid" : HIGHLIGHT_FAMILIES.has(family) ? "active" : "neutral";

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requirePageUser()]);
  const [product, { plan, products }] = await Promise.all([getProduct(user.id, id), getRoutinePlan(user.id)]);
  if (!product) notFound();

  const actives = product.ingredients.filter(({ ingredient }) => HIGHLIGHT_FAMILIES.has(ingredient.family));
  const photosensitizing = product.ingredients.some(({ ingredient }) => ingredient.photosensitizing);
  const amStep = plan.am.find((s) => s.productId === id);
  const pmStep = plan.pm.find((s) => s.productId === id);
  const nameOf = (pid: string) => products.find((p) => p.id === pid)?.name ?? "";
  const clashes = plan.conflicts
    .filter((c) => c.productIds.includes(id) && !c.resolvedBySchedule)
    .map((c) => nameOf(c.productIds[0] === id ? c.productIds[1] : c.productIds[0]));
  const when = [amStep && `Manhã · passo ${amStep.order}`, pmStep && `Noite · passo ${pmStep.order}`].filter(Boolean).join(" e ");
  const days = (amStep ?? pmStep)?.daysOfWeek;

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <Link href="/app/produtos" aria-label="Voltar para o armário" className="press -ml-2 grid size-11 place-items-center rounded-pill">
          <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do Storage
          <img src={product.imageUrl} alt={`Rótulo de ${product.name}`} className="h-48 w-full rounded-[24px] bg-surface object-cover" />
        )}
        <div className="space-y-1">
          <p className="text-muted">{product.brand} · {CATEGORY_LABELS[product.category]}</p>
          <h1 className="font-display text-[28px] leading-8">{product.name}</h1>
        </div>
      </header>

      <Card className="divide-y divide-[#F1E7DE] px-4 py-1">
        <Row label="Quando">{when || "Fora da rotina"}{days && ` · ${formatDays(days)}`}</Row>
        <Row label="Não mistura com">{clashes.length > 0 ? clashes.join(", ") : "Nada no seu armário"}</Row>
      </Card>

      {photosensitizing && (
        <ConflictAlert level="warn" title="Deixa a pele mais sensível ao sol">
          Use à noite e capriche no protetor de manhã.
        </ConflictAlert>
      )}

      {actives.length > 0 && (
        <section aria-labelledby="actives" className="space-y-2">
          <h2 id="actives" className="font-bold">Ativos</h2>
          <ul className="flex flex-wrap gap-2">
            {actives.map(({ ingredient }) => (
              <li key={ingredient.id}>
                <IngredientChip inci={ingredient.inciName} tone={toneOf(ingredient.family, ingredient.pregnancyCaution)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <Eyebrow>Quando acabar</Eyebrow>
          {isEnabled("sponsoredSlots") && <Badge tone="sponsored">Patrocinado</Badge>}
        </div>
        <ul className="space-y-2">
          {buyLinks(product.brand, product.name).map(({ store, url }) => (
            <li key={store}>
              <a href={url} target="_blank" rel="sponsored noopener noreferrer" className="press flex h-12 items-center justify-between rounded-[14px] border-[1.5px] border-[#E2D5CA] px-4 font-semibold">
                Comprar na {store} <ExternalLink className="size-4 text-muted" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Podemos receber comissão por compras nesses links. Isso nunca muda a ordem nem as recomendações da sua rotina.</p>
      </Card>

      <details className="rounded-[24px] bg-surface-raised px-5">
        <summary className="flex min-h-14 cursor-pointer list-none items-center font-bold">Editar produto</summary>
        <div className="pb-5">
          <ProductForm
            productId={product.id}
            draft={{
              brand: product.brand,
              name: product.name,
              category: product.category,
              period: product.period,
              inci: product.ingredients.map(({ ingredient }) => ingredient.inciName),
              imagePath: product.imagePath,
            }}
          />
        </div>
      </details>

      <form action={deleteProductAction}>
        <input type="hidden" name="productId" value={product.id} />
        <Button variant="ghost" size="lg" className="text-danger">Remover do armário</Button>
      </form>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-[15px] font-semibold">{children}</span>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<"/app/produtos/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
