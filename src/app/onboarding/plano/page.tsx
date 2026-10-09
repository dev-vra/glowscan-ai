import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { getSkinProfile } from "@/lib/data/profile";
import type { SkinType } from "@/generated/prisma/enums";

const SKIN_INSIGHT: Record<SkinType, { name: string; focus: string }> = {
  dry: { name: "Pele seca", focus: "reforço de barreira: ceramidas, ácido hialurônico e esfoliação suave e espaçada" },
  oily: { name: "Pele oleosa", focus: "controle de oleosidade sem agredir: niacinamida, BHA em noites alternadas e hidratação leve" },
  combination: { name: "Pele mista", focus: "equilíbrio por zona: textura leve no T, conforto nas bochechas" },
  normal: { name: "Pele normal", focus: "prevenção: antioxidante de manhã, renovação à noite e protetor solar diário" },
  sensitive: { name: "Pele sensível", focus: "introdução lenta de ativos, um por vez, e fórmulas sem fragrância" },
};

const CONCERN_LABELS: Record<string, string> = {
  lines: "linhas finas", spots: "manchas", pores: "poros", blemishes: "cravos e espinhas",
  redness: "vermelhidão", dullness: "viço", dehydration: "hidratação",
};

async function Plan() {
  const user = await requirePageUser();
  const profile = await getSkinProfile(user.id);
  if (!profile) redirect("/onboarding");
  const insight = SKIN_INSIGHT[profile.skinType];
  const goals = profile.concerns.map((c) => CONCERN_LABELS[c]).filter(Boolean);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Eyebrow className="flex items-center gap-2"><Sparkles className="size-3.5" aria-hidden /> Seu perfil</Eyebrow>
        <h1 className="font-display text-display">{insight.name}</h1>
        {goals.length > 0 && <p className="text-muted">Foco em {goals.join(", ")}.</p>}
      </header>
      <Card className="space-y-2">
        <Eyebrow>Estratégia</Eyebrow>
        <p className="text-sm">Sua rotina ideal prioriza {insight.focus}.</p>
      </Card>
      <Card className="space-y-2">
        <Eyebrow>Próximos passos</Eyebrow>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Análise da pele por foto, com nota de 0 a 100</li>
          <li>Leitura dos rótulos do seu armário</li>
          <li>Rotina da manhã e da noite, com alertas de combinação</li>
        </ol>
      </Card>
      {profile.pregnantOrNursing && (
        <p className="rounded-md bg-accent-soft p-4 text-sm">Vamos sinalizar ingredientes que pedem cautela na gestação e amamentação.</p>
      )}
      <Link href="/assinar" className={buttonClasses("primary", "lg")}>Desbloquear minha rotina</Link>
    </div>
  );
}

export default function PlanPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-content px-6 py-12">
      <Suspense fallback={<PageSkeleton />}>
        <Plan />
      </Suspense>
    </main>
  );
}
