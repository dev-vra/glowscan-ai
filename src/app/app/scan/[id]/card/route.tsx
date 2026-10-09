import { ImageResponse } from "next/og";
import { getCurrentUser, getFaceScan } from "@/lib/data";
import { METRIC_LABELS } from "@/lib/data/types";

// Card de resultado para compartilhar (stories 4:5). Sem foto do rosto: só números.
const SIZE = { width: 1080, height: 1350 };
const COLORS = { bg: "#FBF7F4", ink: "#2B2320", muted: "#7A6E69", accent: "#C8765A", track: "#EFE6E1" };

export async function GET(_request: Request, { params }: RouteContext<"/app/scan/[id]/card">) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const scan = await getFaceScan(user.id, id);
  if (!scan || scan.overallScore == null) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg, color: COLORS.ink, padding: 96, fontSize: 36 }}>
        <div style={{ display: "flex", color: COLORS.muted, fontSize: 32, letterSpacing: 4 }}>MINHA PELE HOJE</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 48 }}>
          <span style={{ fontSize: 260, fontWeight: 700, color: COLORS.accent, lineHeight: 1 }}>{scan.overallScore}</span>
          <span style={{ fontSize: 64, color: COLORS.muted, marginLeft: 16 }}>/100</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 72 }}>
          {scan.metrics.map((m) => (
            <div key={m.metric} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{METRIC_LABELS[m.metric]}</span>
                <span style={{ color: COLORS.muted }}>{m.score}</span>
              </div>
              <div style={{ display: "flex", height: 14, borderRadius: 7, background: COLORS.track }}>
                <div style={{ width: `${m.score}%`, borderRadius: 7, background: COLORS.accent }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", color: COLORS.muted, fontSize: 30 }}>GlowScan AI · análise estética, não diagnóstico</div>
      </div>
    ),
    SIZE,
  );
}
