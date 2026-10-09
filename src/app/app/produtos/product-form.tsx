"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { CATEGORY_LABELS, PERIOD_LABELS } from "@/components/app/labels";
import { Button } from "@/components/ui/button";
import type { ProductDraft } from "@/lib/data/products";
import { saveProductAction, type SaveState } from "./actions";

const initialState: SaveState = { error: null };
const fieldClass = "h-12 w-full rounded-md border border-border-input bg-surface-raised px-4 text-base outline-none focus-visible:border-accent";

type ProductFormProps = { draft: ProductDraft; productId?: string; lowConfidence?: boolean };

export function ProductForm({ draft, productId, lowConfidence = false }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);
  return (
    <form action={formAction} className="space-y-5">
      {lowConfidence && (
        <p role="status" className="flex gap-2 rounded-md border border-dashed border-warning bg-surface p-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
          Leitura incerta. Confira os ingredientes com o rótulo antes de salvar.
        </p>
      )}
      <input type="hidden" name="imagePath" value={draft.imagePath ?? ""} />
      {productId && <input type="hidden" name="productId" value={productId} />}
      <div className="space-y-2">
        <label htmlFor="brand" className="text-sm font-semibold">Marca</label>
        <input id="brand" name="brand" defaultValue={draft.brand} required maxLength={80} className={fieldClass} />
      </div>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold">Produto</label>
        <input id="name" name="name" defaultValue={draft.name} required maxLength={120} className={fieldClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold">Categoria</label>
          <select id="category" name="category" defaultValue={draft.category} className={fieldClass}>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="period" className="text-sm font-semibold">Quando usar</label>
          <select id="period" name="period" defaultValue={draft.period} className={fieldClass}>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="inci" className="text-sm font-semibold">Ingredientes (INCI)</label>
        <textarea
          id="inci" name="inci" rows={6} defaultValue={draft.inci.join(", ")} aria-describedby="inci-help"
          className="w-full rounded-md border border-border-input bg-surface-raised p-4 text-sm outline-none focus-visible:border-accent"
        />
        <p id="inci-help" className="text-xs text-muted">Separe por vírgula, na ordem do rótulo.</p>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending}>Salvar no armário</Button>
    </form>
  );
}
