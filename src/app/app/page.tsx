import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ScanFace } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { RoutineChecklist } from "@/components/app/routine-checklist";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import { requireSubscriber } from "@/lib/auth";
import { listFaceScans } from "@/lib/data";
import { getTodayChecklist } from "@/lib/data/daily";
import { getSkinProfile } from "@/lib/data/profile";
import { checkInAction } from "./actions";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });
const FEELINGS = ["Irritada", "Desconfortável", "Ok", "Bem", "Radiante"];
const REACTIONS = [
  { value: "ardor", label: "Ardor" },
  { value: "vermelhidao", label: "Vermelhidão" },
  { value: "descamacao", label: "Descamação" },
  { value: "espinhas", label: "Espinhas novas" },
  { value: "oleosidade", label: "Oleosidade" },
  { value: "repuxando", label: "Repuxando" },
];

function CheckInForm() {
  return (
    <Card>
      <form action={checkInAction} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="font-display text-xl">Como sua pele está hoje?</legend>
          <div className="grid grid-cols-5 gap-1">
            {FEELINGS.map((label, i) => (
              <label key={label} className="flex cursor-pointer flex-col items-center gap-1 rounded-md p-2 text-center text-xs has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-accent">
                <input type="radio" name="feeling" value={i + 1} required className="sr-only" />
                <span className="font-display text-xl tabular-nums">{i + 1}</span>
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Notou algo? (opcional)</legend>
          <div className="flex flex-wrap gap-2">
            {REACTIONS.map((r) => (
              <label key={r.value} className="cursor-pointer rounded-pill border border-border px-3 py-1 text-xs has-checked:border-gold has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-accent">
                <input type="checkbox" name="reactions" value={r.value} className="sr-only" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <Button variant="secondary">Registrar</Button>
      </form>
    </Card>
  );
}

async function Today() {
  const user = await requireSubscriber();
  const [profile, scans, today] = await Promise.all([getSkinProfile(user.id), listFaceScans(user.id), getTodayChecklist(user.id)]);
  if (!profile) redirect("/onboarding");
  const latest = scans.find((s) => s.status === "done");

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Eyebrow>Hoje</Eyebrow>
        <h1 className="font-display text-xl">Seu ritual</h1>
      </header>

      {latest ? (
        <>
          <div className="flex justify-center"><ScoreRing score={latest.overallScore} /></div>
          <Card className="space-y-3">
            <Eyebrow>Última análise · {dateFormat.format(latest.takenAt)}</Eyebrow>
            <p className="text-sm">{latest.summary}</p>
            <Link href={`/app/scan/${latest.id}`} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">Ver detalhes</Link>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={ScanFace}
          title="Vamos conhecer sua pele"
          text="Sua primeira análise leva menos de um minuto. Use luz natural e o rosto sem maquiagem."
          action={<Link href="/app/scan/rosto" className={buttonClasses("primary", "md")}>Fazer primeira análise</Link>}
        />
      )}

      {today.periods.every((p) => p.steps.length === 0) ? (
        <Card className="space-y-3">
          <Eyebrow>Rotina</Eyebrow>
          <p className="text-sm">Fotografe os rótulos do seu armário para montarmos sua rotina.</p>
          <Link href="/app/produtos/novo" className={buttonClasses("secondary", "md")}>Adicionar produto</Link>
        </Card>
      ) : (
        today.periods.map((p) => <RoutineChecklist key={p.period} period={p.period} steps={p.steps} />)
      )}

      {today.checkIn ? (
        <p className="text-center text-sm text-muted">Check-in de hoje registrado: {FEELINGS[today.checkIn.feeling - 1].toLowerCase()}.</p>
      ) : (
        <CheckInForm />
      )}
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Today />
    </Suspense>
  );
}
