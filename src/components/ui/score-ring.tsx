"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

type Size = "sm" | "md" | "lg";
type ScoreRingProps = { score: number | null; size?: Size; label?: string; animate?: boolean };

const SIZES: Record<Size, { box: string; ring: string; number: string }> = {
  lg: { box: "size-[184px]", ring: "13px", number: "text-[76px] leading-[68px]" },
  md: { box: "size-[140px]", ring: "10px", number: "text-[56px] leading-[52px]" },
  sm: { box: "size-[72px]", ring: "7px", number: "text-[26px] leading-none" },
};

const COUNT_MS = 1200;
const EMPTY_COLOR = "text-[#C9B6A8]";
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Anel sempre terracota (nunca verde/vermelho por faixa). Preenchimento via motion.css §4.
export function ScoreRing({ score, size = "lg", label = "Skin Score", animate = true }: ScoreRingProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(0);
  const shown = animate ? counted : (score ?? 0);

  useEffect(() => {
    if (score === null) return;
    ringRef.current?.style.setProperty("--ring", `${score}%`);
    if (!animate) return;
    const duration = prefersReducedMotion() ? 0 : COUNT_MS;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      setCounted(Math.round(easeOutCubic(t) * score));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  const { box, ring, number } = SIZES[size];
  const ariaLabel = score === null ? `${label}: sem análise ainda` : `${label} ${score} de 100`;
  return (
    <div
      ref={ringRef} role="img" aria-label={ariaLabel}
      className={clsx("score-ring relative grid shrink-0 place-items-center rounded-pill", box)}
      style={{ ["--ring" as string]: animate ? "0%" : `${score ?? 0}%`, padding: ring }}
    >
      <div className="grid size-full place-items-center rounded-pill bg-surface-raised text-center" aria-hidden>
        <div>
          <p data-score className={clsx("font-display font-extrabold tracking-[-0.05em]", number, score === null && EMPTY_COLOR)}>
            {score === null ? "–" : shown}
          </p>
          {size === "lg" && <p className="mt-1 text-sm text-muted">de 100</p>}
        </div>
      </div>
    </div>
  );
}
