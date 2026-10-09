import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg bg-surface-raised p-5 shadow-card", className)} {...rest} />;
}

export function Eyebrow({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-xs font-medium uppercase tracking-[0.08em] text-muted", className)} {...rest} />;
}
