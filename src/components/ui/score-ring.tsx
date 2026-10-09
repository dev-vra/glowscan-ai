import { clsx } from "clsx";

type ScoreRingProps = { score: number | null; size?: "sm" | "lg"; label?: string };

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, size = "lg", label = "Skin Score" }: ScoreRingProps) {
  const filled = score === null ? 0 : (score / 100) * CIRCUMFERENCE;
  const ariaLabel = score === null ? `${label}: sem análise ainda` : `${label} ${score} de 100`;
  return (
    <div role="img" aria-label={ariaLabel} className={clsx("relative grid place-items-center", size === "lg" ? "size-52" : "size-14")}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="4" className="stroke-border" />
        <circle
          cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="4" strokeLinecap="round"
          className="stroke-gold transition-[stroke-dasharray] duration-700 ease-lux"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        />
      </svg>
      <div className="text-center">
        <p className={clsx("font-display tabular-nums leading-none", size === "lg" ? "text-display" : "text-lg")}>{score ?? "—"}</p>
        {size === "lg" && <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted">{label}</p>}
      </div>
    </div>
  );
}
