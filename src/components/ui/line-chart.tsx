type Point = { label: string; value: number };
type LineChartProps = { title: string; points: Point[] };

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 12;
const PAD_Y = 16;
const GRID = [25, 50, 75];

const x = (i: number, n: number) => PAD_X + (n <= 1 ? (WIDTH - 2 * PAD_X) / 2 : (i * (WIDTH - 2 * PAD_X)) / (n - 1));
const y = (v: number) => PAD_Y + ((100 - v) * (HEIGHT - 2 * PAD_Y)) / 100;

// Gráfico em SVG puro (escala fixa 0–100); tabela visualmente oculta para leitores de tela.
export function LineChart({ title, points }: LineChartProps) {
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i, points.length).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  return (
    <figure className="space-y-2">
      <figcaption className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{title}</span>
        <span className="tabular-nums text-muted">{points.at(-1)?.value ?? "—"}</span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" aria-hidden>
        {GRID.map((g) => <line key={g} x1={PAD_X} x2={WIDTH - PAD_X} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth="1" />)}
        <path d={path} fill="none" className="stroke-gold" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => <circle key={i} cx={x(i, points.length)} cy={y(p.value)} r="3" className="fill-gold" />)}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{points.map((p, i) => <tr key={i}><th scope="row">{p.label}</th><td>{p.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
