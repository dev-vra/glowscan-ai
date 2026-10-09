type Point = { label: string; value: number };
type LineChartProps = { title: string; points: Point[]; compare?: Point[]; summary?: string };

const WIDTH = 340;
const HEIGHT = 160;
const PAD_X = 16;
const PAD_TOP = 32;
const PAD_BOTTOM = 24;
const GRID = [25, 50, 75];
const TAG_W = 36;

const x = (i: number, n: number) => PAD_X + (n <= 1 ? (WIDTH - 2 * PAD_X) / 2 : (i * (WIDTH - 2 * PAD_X)) / (n - 1));
const y = (v: number) => PAD_TOP + ((100 - v) * (HEIGHT - PAD_TOP - PAD_BOTTOM)) / 100;
const toPath = (pts: Point[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i, pts.length).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

// SVG puro (escala 0–100). Resumo em <title> + tabela oculta para leitores de tela.
export function LineChart({ title, points, compare, summary }: LineChartProps) {
  const last = points.at(-1);
  const first = points[0];
  const lastX = x(points.length - 1, points.length);
  const tagX = Math.min(Math.max(lastX - TAG_W / 2, 0), WIDTH - TAG_W);
  return (
    <figure className="space-y-2">
      <figcaption className="flex items-baseline justify-between text-sm">
        <span className="font-bold">{title}</span>
        <span className="tabular-nums text-muted">{last?.value ?? "—"}</span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={summary ?? title}>
        <title>{summary ?? title}</title>
        {GRID.map((g) => <line key={g} x1={PAD_X} x2={WIDTH - PAD_X} y1={y(g)} y2={y(g)} stroke="#F1E7DE" strokeWidth="1" />)}
        {compare && compare.length > 1 && (
          <path d={toPath(compare)} fill="none" className="stroke-gold" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
        )}
        <path d={toPath(points)} fill="none" className="stroke-accent" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.slice(0, -1).map((p, i) => <circle key={i} cx={x(i, points.length)} cy={y(p.value)} r="2.5" className="fill-accent" />)}
        {last && (
          <g>
            <circle cx={lastX} cy={y(last.value)} r="6" className="fill-surface-raised stroke-accent" strokeWidth="3" />
            <rect x={tagX} y={y(last.value) - 32} width={TAG_W} height="22" rx="8" className="fill-text" />
            <text x={tagX + TAG_W / 2} y={y(last.value) - 17} textAnchor="middle" className="fill-bg text-[12px] font-bold tabular-nums">{last.value}</text>
          </g>
        )}
        {first && last && points.length > 1 && (
          <>
            <text x={PAD_X} y={HEIGHT - 4} className="fill-muted text-[12px] tabular-nums">{first.label}</text>
            <text x={WIDTH - PAD_X} y={HEIGHT - 4} textAnchor="end" className="fill-muted text-[12px] tabular-nums">{last.label}</text>
          </>
        )}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{points.map((p, i) => <tr key={i}><th scope="row">{p.label}</th><td>{p.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
