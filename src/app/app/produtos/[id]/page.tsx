import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { buyLinks } from "@/lib/affiliate";
import { requirePageUser } from "@/lib/auth";
import { getProduct } from "@/lib/data/products";
import { deleteProductAction } from "../actions";
import { ProductForm } from "../product-form";

const HIGHLIGHT_FAMILIES = new Set(["retinoid", "aha", "bha", "pha", "vitamin_c", "niacinamide", "benzoyl_peroxide", "peptide", "copper_peptide", "azelaic_acid"]);

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requirePageUser()]);
  const product = await getProduct(user.id, id);
  if (!product) notFound();
  const actives = product.ingredients.filter(({ ingredient }) => HIGHLIGHT_FAMILIES.has(ingredient.family));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Eyebrow>{product.brand}</Eyebrow>
        <h1 className="font-display text-xl">{product.name}</h1>
      </header>
      {actives.length > 0 && (
        <section aria-labelledby="actives" className="space-y-2">
          <h2 id="actives" className="text-sm font-semibold">Ativos identificados</h2>
          <ul className="flex flex-wrap gap-2">
            {actives.map(({ ingredient }) => (
              <li key={ingredient.id} className="rounded-pill bg-accent-soft px-3 py-1 text-xs capitalize">{ingredient.inciName}</li>
            ))}
          </ul>
        </section>
      )}
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
      <section aria-labelledby="buy" className="space-y-2">
        <h2 id="buy" className="text-sm font-semibold">Acabou? Comprar de novo</h2>
        <ul className="flex flex-wrap gap-2">
          {buyLinks(product.brand, product.name).map(({ store, url }) => (
            <li key={store}>
              <a href={url} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex h-11 items-center rounded-pill border border-border-input px-4 text-sm">
                {store}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Podemos receber comissão por compras nesses links. Isso nunca muda suas recomendações.</p>
      </section>
      <form action={deleteProductAction}>
        <input type="hidden" name="productId" value={product.id} />
        <Button variant="ghost" className="text-danger">Remover do armário</Button>
      </form>
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
