import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/disclaimer";
import { MetricBar } from "@/components/ui/metric-bar";
import { ScoreRing } from "@/components/ui/score-ring";
import { requirePageUser } from "@/lib/auth";
import { getFaceScan, getPreviousScan } from "@/lib/data";
import { FACE_ZONES, METRIC_LABELS, type SkinMetric } from "@/lib/data/types";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

async function ScanResult({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requirePageUser()]);
  const scan = await getFaceScan(user.id, id);
  if (!scan) notFound();

  if (scan.status === "rejected") {
    return (
      <Card className="space-y-4">
        <h1 className="font-display text-xl">Não deu para analisar esta foto</h1>
        <p className="text-sm text-muted">{scan.rejectReason ?? "Tente novamente com mais luz e o rosto centralizado."}</p>
        <Link href="/app/scan/rosto" className={buttonClasses("primary", "md")}>Tentar de novo</Link>
      </Card>
    );
  }

  const previous = await getPreviousScan(user.id, scan);
  const previousScore = (metric: SkinMetric) => previous?.metrics.find((m) => m.metric === metric)?.score;
  const scoreDelta = previous?.overallScore != null && scan.overallScore != null ? scan.overallScore - previous.overallScore : null;
  const zoneAverages = FACE_ZONES.map((zone) => ({
    zone,
    score: Math.round(scan.metrics.reduce((sum, m) => sum + (m.zones[zone] ?? 0), 0) / scan.metrics.length),
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Eyebrow>Análise · {dateFormat.format(scan.takenAt)}</Eyebrow>
        <h1 className="font-display text-xl">Leitura da sua pele</h1>
      </header>

      <div className="flex justify-center"><ScoreRing score={scan.overallScore} /></div>
      {scoreDelta !== null && (
        <p className="text-center text-sm text-muted">
          {scoreDelta >= 0 ? "+" : ""}{scoreDelta} pontos desde a análise anterior
        </p>
      )}

      <Card className="space-y-2">
        <Eyebrow>Leitura do dia</Eyebrow>
        <p className="text-sm">{scan.summary}</p>
      </Card>

      <Card className="space-y-5">
        <Eyebrow>Métricas</Eyebrow>
        {scan.metrics.map((m) => {
          const before = previousScore(m.metric);
          return <MetricBar key={m.metric} label={METRIC_LABELS[m.metric]} score={m.score} delta={before == null ? null : m.score - before} />;
        })}
      </Card>

      <Card className="space-y-3">
        <Eyebrow>Por zona do rosto</Eyebrow>
        <ul className="divide-y divide-border text-sm">
          {zoneAverages.map(({ zone, score }) => (
            <li key={zone} className="flex justify-between py-2 capitalize"><span>{zone}</span><span className="tabular-nums">{score}</span></li>
          ))}
        </ul>
      </Card>

      <Disclaimer />
      <Link href="/app" className={buttonClasses("ghost", "md")}><ArrowLeft className="size-4" aria-hidden /> Voltar para Hoje</Link>
    </div>
  );
}

export default function ScanResultPage({ params }: PageProps<"/app/scan/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScanResult params={params} />
    </Suspense>
  );
}
