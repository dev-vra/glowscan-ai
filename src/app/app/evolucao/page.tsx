import Link from "next/link";
import { Suspense } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { BeforeAfter } from "@/components/ui/before-after";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { LineChart } from "@/components/ui/line-chart";
import { requirePageUser } from "@/lib/auth";
import { getEvolution } from "@/lib/data/daily";
import { METRIC_LABELS, type SkinMetric } from "@/lib/data/types";
import { signedPhotoUrl } from "@/lib/supabase";

const MIN_SCANS = 2;
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const longDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const METRICS = Object.keys(METRIC_LABELS) as SkinMetric[];

async function Evolution({ metric }: { metric: SkinMetric | null }) {
  const user = await requirePageUser();
  const scans = await getEvolution(user.id);

  if (scans.length < MIN_SCANS) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title={`Falta ${MIN_SCANS - scans.length} análise pro primeiro gráfico`}
        text="Refaça a análise a cada 7 dias, na mesma luz, pra comparação ser justa."
        action={<Link href="/app/scan/rosto" className={buttonClasses("primary", "lg")}>Nova análise</Link>}
      />
    );
  }

  const point = (s: (typeof scans)[number], value: number) => ({ label: shortDate.format(s.takenAt), value });
  const overall = scans.map((s) => point(s, s.overallScore ?? 0));
  const metricSeries = metric
    ? scans.flatMap((s) => {
        const m = s.metrics.find((x) => x.metric === metric);
        return m ? [point(s, m.score)] : [];
      })
    : null;
  const shown = metricSeries ?? overall;
  const first = shown[0].value;
  const last = shown.at(-1)!.value;
  const delta = last - first;
  const title = metric ? METRIC_LABELS[metric] : "Skin Score";

  const [firstScan, lastScan] = [scans[0], scans.at(-1)!];
  const [beforeSrc, afterSrc] = await Promise.all(
    [firstScan, lastScan].map((s) => signedPhotoUrl(s.imagePath).catch(() => null)),
  );

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">{title}</p>
          <Badge tone={delta >= 0 ? "delta" : "study"}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}</Badge>
        </div>
        <p className="font-display text-[44px] font-extrabold leading-none tracking-[-0.035em] tabular-nums">
          <span className="text-muted">{first}</span> → {last}
        </p>
        <LineChart
          title={`${scans.length} análises`} points={shown} compare={metricSeries ? overall : undefined}
          summary={`${title} ${delta >= 0 ? "subiu" : "caiu"} de ${first} para ${last} em ${scans.length} análises`}
        />
      </Card>

      <nav aria-label="Métricas" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[null, ...METRICS].map((m) => {
          const active = m === metric;
          return (
            <Link
              key={m ?? "all"} href={m ? `/app/evolucao?m=${m}` : "/app/evolucao"} replace scroll={false} aria-current={active ? "true" : undefined}
              className={active
                ? "inline-flex h-11 shrink-0 items-center rounded-pill bg-text px-4 text-[15px] font-semibold text-bg"
                : "inline-flex h-11 shrink-0 items-center rounded-pill border-[1.5px] border-[#E2D5CA] bg-surface-raised px-4 text-[15px] font-semibold"}
            >
              {m ? METRIC_LABELS[m] : "Geral"}
            </Link>
          );
        })}
      </nav>

      {beforeSrc && afterSrc && (
        <section aria-labelledby="before-after" className="space-y-2">
          <Eyebrow id="before-after">Antes e depois</Eyebrow>
          <BeforeAfter
            before={{ src: beforeSrc, date: longDate.format(firstScan.takenAt) }}
            after={{ src: afterSrc, date: longDate.format(lastScan.takenAt) }}
          />
        </section>
      )}
    </div>
  );
}

async function EvolutionForMetric({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const metric = METRICS.includes(m as SkinMetric) ? (m as SkinMetric) : null;
  return <Evolution metric={metric} />;
}

export default function EvolutionPage({ searchParams }: PageProps<"/app/evolucao">) {
  return (
    <div className="space-y-4">
      <h1 className="pb-2 font-display text-[28px]">Evolução</h1>
      <Suspense fallback={<PageSkeleton />}>
        <EvolutionForMetric searchParams={searchParams as Promise<{ m?: string }>} />
      </Suspense>
    </div>
  );
}
