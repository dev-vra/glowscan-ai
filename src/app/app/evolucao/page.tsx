import Link from "next/link";
import { Suspense } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LineChart } from "@/components/ui/line-chart";
import { requirePageUser } from "@/lib/auth";
import { getEvolution } from "@/lib/data/daily";
import { METRIC_LABELS, type SkinMetric } from "@/lib/data/types";

const MIN_SCANS = 2;
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

async function Evolution() {
  const user = await requirePageUser();
  const scans = await getEvolution(user.id);

  if (scans.length < MIN_SCANS) {
    return (
      <EmptyState
        icon={LineChartIcon}
        title="Sua curva começa no 2º scan"
        text="Refaça a análise a cada 7 dias, na mesma luz, para ver a evolução de cada métrica."
        action={<Link href="/app/scan/rosto" className={buttonClasses("primary", "md")}>Nova análise</Link>}
      />
    );
  }

  const series = (metric: SkinMetric) =>
    scans.flatMap((s) => {
      const m = s.metrics.find((x) => x.metric === metric);
      return m ? [{ label: shortDate.format(s.takenAt), value: m.score }] : [];
    });
  const overall = scans.map((s) => ({ label: shortDate.format(s.takenAt), value: s.overallScore ?? 0 }));
  const first = overall[0].value;
  const last = overall.at(-1)!.value;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <Eyebrow>Skin Score · {scans.length} análises</Eyebrow>
        <p className="font-display text-display tabular-nums">
          {last}
          <span className={`ml-2 text-lg ${last >= first ? "text-success" : "text-danger"}`}>{last >= first ? "+" : ""}{last - first}</span>
        </p>
        <LineChart title="Geral" points={overall} />
      </Card>
      <Card className="space-y-6">
        <Eyebrow>Por métrica</Eyebrow>
        {(Object.keys(METRIC_LABELS) as SkinMetric[]).map((metric) => (
          <LineChart key={metric} title={METRIC_LABELS[metric]} points={series(metric)} />
        ))}
      </Card>
    </div>
  );
}

export default function EvolutionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Eyebrow>Evolução</Eyebrow>
        <h1 className="font-display text-xl">Sua pele ao longo do tempo</h1>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Evolution />
      </Suspense>
    </div>
  );
}
