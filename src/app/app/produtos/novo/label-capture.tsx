"use client";

import { useState, useTransition } from "react";
import { Camera, PencilLine } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { fileToJpegDataUrl } from "@/lib/client-image";
import type { ProductDraft } from "@/lib/data/products";
import { extractLabelAction } from "../actions";
import { ProductForm } from "../product-form";

const EMPTY_DRAFT: ProductDraft = { brand: "", name: "", category: "serum", period: "both", inci: [], imagePath: null };

export function LabelCapture() {
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const result = await extractLabelAction(await fileToJpegDataUrl(file));
      if (result.error) setError(result.error);
      setDraft(result.draft);
      setLowConfidence(result.lowConfidence);
    });
  };

  if (draft) return <ProductForm draft={draft} lowConfidence={lowConfidence} />;

  if (pending) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="relative grid size-32 place-items-center">
          <div className="reading-ring absolute inset-0 rounded-pill border-[6px] border-[#EFE5DC] border-t-accent" />
        </div>
        <p className="font-display text-[26px] font-bold tracking-[-0.02em]">Lendo o rótulo…</p>
        <p className="text-sm text-muted">Marca, categoria e cada ingrediente da fórmula.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid h-[380px] place-items-center rounded-[24px] border-[1.5px] border-dashed border-border-input bg-surface p-8 text-center">
        <p className="text-muted">Fotografe o verso da embalagem, onde fica a lista de ingredientes. Luz boa e sem reflexo.</p>
      </div>
      <label className={buttonClasses("primary", "lg", "cursor-pointer focus-within:outline-2 focus-within:outline-accent")}>
        <Camera className="size-5" aria-hidden /> Fotografar rótulo
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <Button variant="ghost" size="lg" onClick={() => setDraft(EMPTY_DRAFT)}>
        <PencilLine className="size-5" aria-hidden /> Cadastrar manualmente
      </Button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
