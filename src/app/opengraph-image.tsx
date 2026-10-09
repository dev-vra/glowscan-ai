import { ImageResponse } from "next/og";

export const alt = "Viço — sua pele lida, sua rotina na ordem certa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFFBF8", padding: 80, color: "#2A1B14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", width: 72, height: 72, borderRadius: 999, background: "#B8462F", position: "relative" }}>
            <div style={{ position: "absolute", top: 12, right: 10, width: 18, height: 18, borderRadius: 999, background: "#F2B66D" }} />
          </div>
          <span style={{ fontSize: 72, fontWeight: 800, letterSpacing: -4, color: "#B8462F" }}>viço</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>Sua pele lida.</span>
          <span style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>Sua rotina na ordem certa.</span>
        </div>
        <span style={{ fontSize: 28, color: "#6E5C51" }}>Análise por foto · leitura de rótulos · evolução em gráficos</span>
      </div>
    ),
    size,
  );
}
