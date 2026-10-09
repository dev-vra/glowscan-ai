import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

// Sem sombra no claro: o contraste vem do branco sobre o creme.
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-[24px] bg-surface-raised p-5", className)} {...rest} />;
}

export function Eyebrow({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-[13px] font-bold uppercase tracking-[0.04em] text-accent", className)} {...rest} />;
}
