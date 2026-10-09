import { ArrowDown, ArrowUp } from "lucide-react";

const GOOD_THRESHOLD = 70;
const FAIR_THRESHOLD = 40;

function grade(score: number) {
  if (score >= GOOD_THRESHOLD) return { word: "Bom", tone: "text-success" };
  if (score >= FAIR_THRESHOLD) return { word: "Médio", tone: "text-warning" };
  return { word: "Atenção", tone: "text-danger" };
}

type MetricBarProps = { label: string; score: number; delta?: number | null };

export function MetricBar({ label, score, delta }: MetricBarProps) {
  const { word, tone } = grade(score);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="flex items-center gap-2 tabular-nums">
          {delta != null && delta !== 0 && (
            <span className={delta > 0 ? "flex items-center text-success" : "flex items-center text-danger"}>
              {delta > 0 ? <ArrowUp className="size-3.5" aria-hidden /> : <ArrowDown className="size-3.5" aria-hidden />}
              <span className="sr-only">{delta > 0 ? "melhorou" : "piorou"}</span>
              {Math.abs(delta)}
            </span>
          )}
          <span className={tone}>{word}</span>
          <span>{score}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-pill bg-surface" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-pill bg-gold" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
