import Link from "next/link";
import { clsx } from "clsx";

type MetricBarProps = { label: string; score: number | null; delta?: number | null; focus?: boolean; index?: number; href?: string };

// Linha: rótulo | barra 8px | valor + delta. Delta sempre seta + número (nunca só cor). Métrica mais baixa = foco.
export function MetricBar({ label, score, delta, focus = false, index = 0, href }: MetricBarProps) {
  const loading = score === null;
  const rowClass = "grid h-12 grid-cols-[104px_1fr_64px] items-center gap-3 border-b border-[#F1E7DE] last:border-b-0";
  const Row = href ? Link : "div";
  return (
    <Row href={href!} className={clsx(rowClass, href && "press")}>
      <span className={clsx("text-[15px]", focus ? "font-bold" : "font-medium")}>{label}</span>
      <div
        className="h-2 overflow-hidden rounded-[4px] bg-[#F1E7DE]"
        role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score ?? undefined}
      >
        {!loading && (
          <div
            className={clsx("metric-fill h-full rounded-[4px]", focus ? "bg-[#D98A2B]" : "bg-accent")}
            style={{ width: `${score}%`, ["--i" as string]: index }}
          />
        )}
      </div>
      <span className="text-right text-sm tabular-nums">
        {loading ? (
          <span className="text-muted">lendo…</span>
        ) : (
          <>
            <span className="font-semibold">{score}</span> <Delta delta={delta} focus={focus} />
          </>
        )}
      </span>
    </Row>
  );
}

function Delta({ delta, focus }: { delta?: number | null; focus: boolean }) {
  if (focus && !delta) return <span className="text-xs font-semibold text-[#D98A2B]">foco</span>;
  if (delta == null) return null;
  if (delta === 0) return <span className="text-xs text-muted" aria-label="sem mudança">=</span>;
  const up = delta > 0;
  return (
    <span className={clsx("text-xs font-semibold", up ? "text-success" : "text-danger")}>
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "subiu" : "caiu"} </span>
      {Math.abs(delta)}
    </span>
  );
}
