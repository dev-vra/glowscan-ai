import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <p className="flex gap-2 text-xs text-muted">
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      Análise estética e informativa. Não substitui a avaliação de um dermatologista.
    </p>
  );
}
