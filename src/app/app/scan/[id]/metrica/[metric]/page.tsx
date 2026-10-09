import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/disclaimer";
import { FaceZoneMap } from "@/components/ui/face-zone-map";
import { requirePageUser } from "@/lib/auth";
import { getFaceScan } from "@/lib/data";
import { listProducts } from "@/lib/data/products";
import { METRIC_LABELS, type SkinMetric } from "@/lib/data/types";
import type { IngredientFamily } from "@/generated/prisma/enums";

const LOW_SCORE = 50;

// O que cada métrica mede (linguagem cosmética, sem diagnóstico) e famílias de ativos que costumam ajudar.
const METRIC_INFO: Record<SkinMetric, { about: string; helps: IngredientFamily[]; tip: string }> = {
  texture: { about: "Quão lisa a pele parece na luz.", helps: ["aha", "pha", "retinoid"], tip: "Esfoliação suave, 2x por semana." },
  redness: { about: "Áreas avermelhadas visíveis na foto.", helps: ["niacinamide", "azelaic_acid", "ceramide"], tip: "Fórmulas sem fragrância e menos ativos de uma vez." },
  pores: { about: "Quanto os poros aparecem.", helps: ["bha", "niacinamide", "retinoid"], tip: "BHA em noites alternadas." },
  fine_lines: { about: "Linhas finas visíveis, principalmente nos olhos e testa.", helps: ["retinoid", "peptide", "hyaluronic"], tip: "Retinoide à noite e protetor todo dia." },
  spots: { about: "Manchas e tom irregular.", helps: ["vitamin_c", "azelaic_acid", "niacinamide"], tip: "Vitamina C de manhã e protetor reaplicado." },
  oiliness: { about: "Equilíbrio entre brilho e conforto.", helps: ["niacinamide", "bha"], tip: "Hidratante leve — pular hidratação piora o brilho." },
  hydration: { about: "Aparência de pele hidratada e com viço.", helps: ["hyaluronic", "ceramide"], tip: "Hidratante logo depois da limpeza, com a pele úmida." },
};

const isMetric = (m: string): m is SkinMetric => m in METRIC_LABELS;

async function MetricDetail({ params }: { params: Promise<{ id: string; metric: string }> }) {
  const [{ id, metric }, user] = await Promise.all([params, requirePageUser()]);
  if (!isMetric(metric)) notFound();
  const [scan, products] = await Promise.all([getFaceScan(user.id, id), listProducts(user.id)]);
  const result = scan?.metrics.find((m) => m.metric === metric);
  if (!scan || !result) notFound();

  const info = METRIC_INFO[metric];
  const label = METRIC_LABELS[metric];
  const helpers = products.filter((p) => p.ingredients.some(({ ingredient }) => info.helps.includes(ingredient.family)));

  return (
    <div className="space-y-6">
      <Link href={`/app/scan/${id}`} aria-label="Voltar para o resultado" className="press -ml-2 grid size-11 place-items-center rounded-pill">
        <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
      </Link>

      <header className="space-y-2">
        <Eyebrow>{label}</Eyebrow>
        <p className="font-display text-[76px] leading-[68px] font-extrabold tracking-[-0.05em] tabular-nums" data-score>
          {result.score}<span className="ml-2 text-xl font-semibold tracking-normal text-muted">de 100</span>
        </p>
        <p className="text-lg font-semibold">{info.about}</p>
      </header>

      <Card>
        <FaceZoneMap zones={result.zones} label={label} />
      </Card>

      <section aria-labelledby="helps" className="space-y-3">
        <h2 id="helps" className="font-display text-xl">O que ajuda</h2>
        <p className="text-muted">{info.tip}</p>
        {helpers.length > 0 ? (
          <ul className="divide-y divide-[#F1E7DE] rounded-[24px] bg-surface-raised px-4">
            {helpers.map((p) => (
              <li key={p.id}>
                <Link href={`/app/produtos/${p.id}`} className="flex min-h-14 items-center gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                    <span className="text-[13px] text-muted">{p.brand} · já está no seu armário</span>
                  </span>
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link href="/app/produtos/novo" className={buttonClasses("secondary", "lg")}>
            <Plus className="size-5" aria-hidden /> Adicionar produto ao armário
          </Link>
        )}
        {result.score < LOW_SCORE && (
          <p className="text-sm text-muted">Mudanças de rotina levam semanas pra aparecer. Compare na próxima análise.</p>
        )}
      </section>

      <Disclaimer />
    </div>
  );
}

export default function MetricPage({ params }: PageProps<"/app/scan/[id]/metrica/[metric]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MetricDetail params={params} />
    </Suspense>
  );
}
