import { ImageResponse } from "next/og";
import { getCurrentUser, getFaceScan, getPreviousScan } from "@/lib/data";
import { METRIC_LABELS } from "@/lib/data/types";

// Card 9:16 para stories, fundo terracota. Sem foto do rosto: só números.
const SIZE = { width: 1080, height: 1920 };
const COLORS = { bg: "#B8462F", ink: "#FFFFFF", soft: "rgba(255,255,255,.72)", track: "rgba(255,255,255,.22)", sun: "#F2B66D" };
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

export async function GET(_request: Request, { params }: RouteContext<"/app/scan/[id]/card">) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const scan = await getFaceScan(user.id, id);
  if (!scan || scan.overallScore == null) return new Response("Not found", { status: 404 });
  const previous = await getPreviousScan(user.id, scan);
  const delta = previous?.overallScore != null ? scan.overallScore - previous.overallScore : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg, color: COLORS.ink, padding: 112, fontSize: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 72, fontWeight: 800, letterSpacing: -4 }}>viço</span>
          <span style={{ color: COLORS.soft, fontSize: 36 }}>{shortDate.format(scan.takenAt)}</span>
        </div>
        <div style={{ display: "flex", color: COLORS.soft, fontSize: 36, letterSpacing: 2, marginTop: 200 }}>MINHA PELE HOJE</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 24 }}>
          <span style={{ fontSize: 340, fontWeight: 800, lineHeight: 1, letterSpacing: -16 }}>{scan.overallScore}</span>
          <span style={{ fontSize: 72, color: COLORS.soft, marginLeft: 20 }}>/100</span>
        </div>
        {delta !== null && previous && (
          <div style={{ display: "flex", marginTop: 32 }}>
            <span style={{ display: "flex", background: COLORS.sun, color: "#2A1B14", borderRadius: 999, padding: "14px 32px", fontWeight: 700 }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pontos desde {shortDate.format(previous.takenAt)}
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 120 }}>
          {scan.metrics.map((m) => (
            <div key={m.metric} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <span style={{ width: 340 }}>{METRIC_LABELS[m.metric]}</span>
              <div style={{ display: "flex", flex: 1, height: 16, borderRadius: 8, background: COLORS.track }}>
                <div style={{ width: `${m.score}%`, borderRadius: 8, background: COLORS.ink }} />
              </div>
              <span style={{ width: 70, textAlign: "right", fontWeight: 700 }}>{m.score}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", color: COLORS.soft, fontSize: 30 }}>Análise cosmética, não é diagnóstico médico.</div>
      </div>
    ),
    SIZE,
  );
}
