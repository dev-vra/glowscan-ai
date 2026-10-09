import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { ConflictAlert } from "@/components/ui/conflict-alert";
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

const STEPS = [
  { title: "Ler sua pele", text: "Uma selfie com luz natural vira um Skin Score de 0 a 100 e 7 métricas." },
  { title: "Ler seu armário", text: "Foto do rótulo e a gente entende cada ingrediente." },
  { title: "Montar a ordem certa", text: "Manhã e noite, com aviso do que não combina." },
];

async function Plan() {
  const user = await requirePageUser();
  const profile = await getSkinProfile(user.id);
  if (!profile) redirect("/onboarding");
  const insight = SKIN_INSIGHT[profile.skinType];
  const goals = profile.concerns.map((c) => CONCERN_LABELS[c]).filter(Boolean);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Eyebrow>Seu plano</Eyebrow>
        <h1 className="font-display text-[44px] leading-[46px] font-extrabold tracking-[-0.035em]">{insight.name}</h1>
        <p className="text-muted">
          {goals.length > 0 && `Foco em ${goals.join(", ")}. `}A rotina prioriza {insight.focus}.
        </p>
      </header>
      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Card className="flex gap-4 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-accent-soft font-display text-xl text-accent" aria-hidden>{i + 1}</span>
              <span>
                <span className="block font-bold">{step.title}</span>
                <span className="text-sm text-muted">{step.text}</span>
              </span>
            </Card>
          </li>
        ))}
      </ol>
      {profile.pregnantOrNursing && (
        <ConflictAlert level="info" title="Gestação e amamentação">A gente sinaliza ingredientes que pedem cautela nessa fase.</ConflictAlert>
      )}
      <Link href="/assinar" className={buttonClasses("primary", "lg")}>Quero esse plano</Link>
    </div>
  );
}

export default function PlanPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-content px-5 py-10">
      <Suspense fallback={<PageSkeleton />}>
        <Plan />
      </Suspense>
    </main>
  );
}
