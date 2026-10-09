import "server-only";
import { FACE_ZONES, type MetricResult, type SkinMetric } from "./types";

const METRICS: SkinMetric[] = ["texture", "redness", "pores", "fine_lines", "spots", "oiliness", "hydration"];
const MIN_SCORE = 35;
const SCORE_RANGE = 60;

function seededRandom(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
}

// Stand-in determinístico da IA de visão: mesma foto → mesmo resultado.
export function fakeAnalyze(imageFingerprint: string) {
  const random = seededRandom(imageFingerprint);
  const metrics: MetricResult[] = METRICS.map((metric) => ({
    metric,
    score: Math.round(MIN_SCORE + random() * SCORE_RANGE),
    zones: Object.fromEntries(FACE_ZONES.map((zone) => [zone, Math.round(MIN_SCORE + random() * SCORE_RANGE)])),
  }));
  const overallScore = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);
  const weakest = [...metrics].sort((a, b) => a.score - b.score)[0];
  return {
    metrics,
    overallScore,
    lightingQuality: Math.round(60 + random() * 40),
    weakestMetric: weakest.metric,
  };
}
