import { clsx } from "clsx";
import { Check, OctagonAlert } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IngredientTone = "active" | "retinoid" | "neutral" | "pregnancy";

const INGREDIENT_TONES: Record<IngredientTone, string> = {
  active: "bg-gold-soft",
  retinoid: "bg-accent-soft",
  neutral: "bg-[#F1E7DE] dark:bg-surface",
  pregnancy: "bg-danger-soft border border-danger-line text-danger",
};

type IngredientChipProps = { inci: string; translation?: string; tone?: IngredientTone };

export function IngredientChip({ inci, translation, tone = "neutral" }: IngredientChipProps) {
  return (
    <span className={clsx("inline-flex h-9 items-center gap-1.5 rounded-pill px-3.5 text-sm", INGREDIENT_TONES[tone])}>
      {tone === "pregnancy" && <OctagonAlert className="size-4" aria-label="Evitar na gestação" />}
      <span className="font-semibold">{inci}</span>
      {translation && <span className="font-medium text-muted">· {translation}</span>}
    </span>
  );
}

type SelectChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean };

export function SelectChip({ selected, className, children, ...rest }: SelectChipProps) {
  return (
    <button
      type="button" aria-pressed={selected}
      className={clsx(
        "press inline-flex h-11 items-center gap-1.5 rounded-pill px-4 text-[15px] font-semibold",
        selected ? "bg-text text-bg" : "border-[1.5px] border-[#E2D5CA] bg-surface-raised",
        className,
      )}
      {...rest}
    >
      {selected && <Check className="size-4" strokeWidth={2.5} aria-hidden />}
      {children}
    </button>
  );
}

type BadgeTone = "sponsored" | "delta" | "streak" | "study";

const BADGE_TONES: Record<BadgeTone, string> = {
  sponsored: "rounded-[6px] bg-text px-1.5 py-0.5 text-[11px] uppercase tracking-[0.04em] text-bg",
  delta: "delta-badge rounded-pill bg-success-soft px-3 py-1 text-[13px] text-success",
  streak: "rounded-pill bg-gold-soft px-3 py-1 text-[13px] text-warning",
  study: "rounded-pill bg-info-soft px-3 py-1 text-[13px] text-info",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={clsx("inline-flex items-center gap-1 font-bold tabular-nums", BADGE_TONES[tone])}>{children}</span>;
}
