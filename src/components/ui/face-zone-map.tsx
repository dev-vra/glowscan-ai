import { FACE_ZONES } from "@/lib/data/types";

type Zone = (typeof FACE_ZONES)[number];
type FaceZoneMapProps = { zones: Record<string, number>; label: string };

const LOW_SCORE = 50; // abaixo disso a zona fica âmbar
const LOW_FILL = "#D98A2B";

// Formas simples por zona sobre um oval de rosto (viewBox 200×260).
const SHAPES: Record<Zone, { d: string; tx: number; ty: number }> = {
  testa: { d: "M50 70 Q100 20 150 70 L150 92 Q100 80 50 92 Z", tx: 100, ty: 72 },
  "zona T": { d: "M88 96 L112 96 L114 170 Q100 178 86 170 Z", tx: 100, ty: 138 },
  "bochecha esq.": { d: "M44 112 Q70 104 80 122 L78 170 Q56 172 44 150 Z", tx: 62, ty: 142 },
  "bochecha dir.": { d: "M156 112 Q130 104 120 122 L122 170 Q144 172 156 150 Z", tx: 138, ty: 142 },
  queixo: { d: "M70 196 Q100 186 130 196 Q122 230 100 234 Q78 230 70 196 Z", tx: 100, ty: 214 },
};

export function FaceZoneMap({ zones, label }: FaceZoneMapProps) {
  const summary = FACE_ZONES.filter((z) => zones[z] != null).map((z) => `${z}: ${zones[z]}`).join(", ");
  return (
    <figure className="space-y-3">
      <svg viewBox="0 0 200 260" className="mx-auto w-full max-w-[240px]" role="img" aria-label={`${label} por zona — ${summary}`}>
        <title>{`${label} por zona — ${summary}`}</title>
        <ellipse cx="100" cy="135" rx="78" ry="112" className="fill-surface stroke-border" strokeWidth="2" />
        {FACE_ZONES.map((zone) => {
          const score = zones[zone];
          if (score == null) return null;
          const { d, tx, ty } = SHAPES[zone];
          const low = score < LOW_SCORE;
          return (
            <g key={zone}>
              <path d={d} fill={low ? LOW_FILL : undefined} className={low ? undefined : "fill-accent-soft"} opacity={low ? 0.85 : 1} />
              <text x={tx} y={ty} textAnchor="middle" className={low ? "fill-white text-[14px] font-bold" : "fill-text text-[14px] font-bold"}>{score}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-accent-soft" aria-hidden /> ok</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-[4px] bg-[#D98A2B]" aria-hidden /> abaixo de {LOW_SCORE}</span>
      </figcaption>
    </figure>
  );
}
