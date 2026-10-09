import { Info } from "lucide-react";
import { RESULT_COPY } from "@/lib/copy";

export function Disclaimer() {
  return (
    <p className="flex gap-2 text-xs text-muted">
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      {RESULT_COPY.disclaimer}
    </p>
  );
}
