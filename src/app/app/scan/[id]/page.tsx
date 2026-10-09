import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { ShareCardButton } from "@/components/app/share-card-button";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/chip";
import { ConflictAlert } from "@/components/ui/conflict-alert";
import { Disclaimer } from "@/components/ui/disclaimer";
import { MetricBar } from "@/components/ui/metric-bar";
import { ScoreRing } from "@/components/ui/score-ring";
import { requirePageUser } from "@/lib/auth";
import { RESULT_COPY, SCAN_COPY } from "@/lib/copy";
import { getFaceScan, getPreviousScan } from "@/lib/data";
import { FACE_ZONES, METRIC_LABELS, type MetricResult, type SkinMetric } from "@/lib/data/types";

// Abaixo disso a gente sugere um olhar profissional (cartão info, nunca vermelho, nunca diagnóstico).
const PROFESSIONAL_SIGNAL_SCORE = 25;
const DERM_SEARCH_URL = "https://www.google.com/maps/search/dermatologista";

const longDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

const byScore = (a: MetricResult, b: MetricResult) => a.score - b.score;

async function ScanResult({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requirePageUser()]);
  const scan = await getFaceScan(user.id, id);
  if (!scan) notFound();

  if (scan.status === "rejected") return <Rejected reason={scan.rejectReason} />;

  const previous = await getPreviousScan(user.id, scan);
  const previousScore = (metric: SkinMetric) => previous?.metrics.find((m) => m.metric === metric)?.score;
  const scoreDelta = previous?.overallScore != null && scan.overallScore != null ? scan.overallScore - previous.overallScore : null;
  const sorted = [...scan.metrics].sort(byScore);
  const focus = sorted[0];
  const strongest = sorted.at(-1);
  const needsProfessional = scan.metrics.some((m) => m.score < PROFESSIONAL_SIGNAL_SCORE);
  const focusZone = focus && lowestZone(focus);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <Link href="/app" aria-label="Voltar para Hoje" className="press -ml-2 grid size-11 place-items-center rounded-pill">
          <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
        </Link>
        <p className="text-sm font-semibold text-muted">{longDate.format(scan.takenAt)}</p>
        {scan.overallScore != null ? <ShareCardButton compact cardUrl={`/app/scan/${scan.id}/card`} /> : <span className="size-11" />}
      </header>

      {needsProfessional && (
        <ConflictAlert
          level="info" title={RESULT_COPY.professional.title}
          action={<a href={DERM_SEARCH_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>{RESULT_COPY.professional.cta}</a>}
        >
          <p>{RESULT_COPY.professional.body}</p>
          <p className="mt-1 text-muted">{RESULT_COPY.professional.after}</p>
        </ConflictAlert>
      )}

      <section className="flex flex-col items-center gap-3 text-center">
        <ScoreRing score={scan.overallScore} />
        {scoreDelta !== null && previous ? (
          <Badge tone="delta">
            {scoreDelta >= 0
              ? RESULT_COPY.deltaUp(scoreDelta, shortDate.format(previous.takenAt))
              : RESULT_COPY.deltaDown(Math.abs(scoreDelta), shortDate.format(previous.takenAt))}
          </Badge>
        ) : (
          <Eyebrow>{RESULT_COPY.firstTitle}</Eyebrow>
        )}
        {scan.summary && <p className="max-w-sm text-lg font-semibold">{scan.summary}</p>}
      </section>

      {scan.makeupDetected && (
        <ConflictAlert level="warn" title={SCAN_COPY.makeup.title}>
          {SCAN_COPY.makeup.body}
        </ConflictAlert>
      )}

      {!previous && focus && strongest && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="space-y-1 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-success">Mais forte</p>
            <p className="font-bold">{METRIC_LABELS[strongest.metric]}</p>
            <p className="font-display text-xl font-bold tabular-nums">{strongest.score}</p>
          </Card>
          <Card className="space-y-1 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#D98A2B]">Foco</p>
            <p className="font-bold">{METRIC_LABELS[focus.metric]}</p>
            <p className="font-display text-xl font-bold tabular-nums">{focus.score}</p>
          </Card>
        </div>
      )}

      <Card className="px-4 py-2">
        {scan.metrics.map((m, i) => {
          const before = previousScore(m.metric);
          return (
            <MetricBar
              key={m.metric} index={i} label={METRIC_LABELS[m.metric]} score={m.score}
              delta={before == null ? null : m.score - before} focus={m.metric === focus?.metric}
            />
          );
        })}
      </Card>

      {!previous && <p className="text-center text-muted">{RESULT_COPY.firstCompare}</p>}

      {focus && (
        <Link href="/app/rotina" className={buttonClasses("primary", "lg")}>
          Ver minha rotina pra {focusZone ?? METRIC_LABELS[focus.metric].toLowerCase()}
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      )}

      <Disclaimer />
    </div>
  );
}

function lowestZone(metric: MetricResult) {
  const zones = FACE_ZONES.filter((z) => metric.zones[z] != null);
  if (zones.length === 0) return null;
  return zones.reduce((low, z) => ((metric.zones[z] ?? 0) < (metric.zones[low] ?? 0) ? z : low));
}

function Rejected({ reason }: { reason: string | null }) {
  const copy = SCAN_COPY.rejected;
  return (
    <div className="space-y-6 pt-8">
      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">{copy.title}</h1>
        <p className="text-muted">{copy.body}</p>
        {reason && <p className="text-sm text-muted">Motivo: {reason}</p>}
      </div>
      <Card className="space-y-3">
        <p className="font-bold">{copy.tipsTitle}</p>
        <ol className="space-y-3">
          {copy.tips.map((tip, i) => (
            <li key={tip} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-pill bg-accent-soft font-display font-bold text-accent">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
      </Card>
      <Link href="/app/scan/rosto" className={buttonClasses("primary", "lg")}>
        <RotateCcw className="size-5" aria-hidden /> {copy.cta}
      </Link>
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
