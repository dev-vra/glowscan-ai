"use client";

import { useEffect, useState, useTransition } from "react";
import { OctagonAlert, X } from "lucide-react";
import { applySuggestionAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { ROUTINE_COPY } from "@/lib/copy";

type SheetProduct = { id: string; name: string; brand: string };
type ConflictSheetProps = { conflictKey: string; period: "am" | "pm"; products: [SheetProduct, SheetProduct]; advice: string };

const DISMISSED_KEY = "vico:conflict-dismissed";

function readDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// Conflito crítico não resolvido: abre sozinho uma vez por sessão; "Manter" não volta a abrir.
export function ConflictSheet({ conflictKey, period, products, advice }: ConflictSheetProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (readDismissed().includes(conflictKey)) return;
    const show = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(show);
  }, [conflictKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...readDismissed(), conflictKey]));
    } catch {
      // sem storage: só fecha
    }
    setOpen(false);
  }

  const apply = () =>
    startTransition(async () => {
      await applySuggestionAction({ productIds: [products[0].id, products[1].id], period });
      setOpen(false);
    });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button type="button" aria-label="Fechar" className="scrim absolute inset-0" onClick={dismiss} />
      <div role="dialog" aria-modal="true" aria-labelledby="conflict-title" className="sheet relative w-full max-w-content space-y-5 rounded-t-[32px] bg-bg px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto h-1.5 w-10 rounded-pill bg-border" aria-hidden />
        <div className="flex items-start gap-3 text-danger">
          <OctagonAlert className="size-6 shrink-0" strokeWidth={2} aria-hidden />
          <h2 id="conflict-title" className="font-display text-xl font-bold tracking-[-0.02em]">Esses dois não combinam</h2>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {[products[0], null, products[1]].map((p, i) =>
            p ? (
              <div key={p.id} className="rounded-[18px] bg-surface-raised p-3">
                <p className="truncate text-[13px] text-muted">{p.brand}</p>
                <p className="line-clamp-2 font-semibold">{p.name}</p>
              </div>
            ) : (
              <span key={i} className="grid size-8 place-items-center rounded-pill bg-danger-soft text-danger" aria-label="com">
                <X className="size-4" strokeWidth={3} aria-hidden />
              </span>
            ),
          )}
        </div>
        <div className="space-y-1 rounded-[18px] bg-surface p-4">
          <p className="font-bold">{ROUTINE_COPY.suggestion}</p>
          <p className="text-sm">{advice}</p>
        </div>
        <div className="space-y-2">
          <Button size="lg" onClick={apply} loading={pending}>{ROUTINE_COPY.apply}</Button>
          <Button size="lg" variant="ghost" onClick={dismiss} disabled={pending}>{ROUTINE_COPY.keep}</Button>
        </div>
      </div>
    </div>
  );
}
