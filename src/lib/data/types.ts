export type SkinMetric = "texture" | "redness" | "pores" | "fine_lines" | "spots" | "oiliness" | "hydration";
export type ScanStatus = "pending" | "done" | "rejected";

export type User = { id: string; email: string };

export type MetricResult = { metric: SkinMetric; score: number; zones: Record<string, number> };

export type FaceScan = {
  id: string;
  userId: string;
  imageUrl: string;
  takenAt: Date;
  status: ScanStatus;
  rejectReason: string | null;
  lightingQuality: number | null;
  makeupDetected: boolean;
  overallScore: number | null;
  summary: string | null;
  metrics: MetricResult[];
};

export const METRIC_LABELS: Record<SkinMetric, string> = {
  texture: "Textura",
  redness: "Vermelhidão",
  pores: "Poros",
  fine_lines: "Linhas finas",
  spots: "Manchas",
  oiliness: "Oleosidade",
  hydration: "Hidratação aparente",
};

export const FACE_ZONES = ["testa", "zona T", "bochecha esq.", "bochecha dir.", "queixo"] as const;
