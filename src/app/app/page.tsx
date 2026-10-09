import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Flame, Plus, ScanFace } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { RoutineChecklist } from "@/components/app/routine-checklist";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/chip";
import { ScoreRing } from "@/components/ui/score-ring";
import { requireSubscriber } from "@/lib/auth";
import { TODAY_COPY } from "@/lib/copy";
import { listFaceScans } from "@/lib/data";
import { getStreak, getTodayChecklist } from "@/lib/data/daily";
import { getSkinProfile } from "@/lib/data/profile";
import { checkInAction } from "./actions";

const DAY_MS = 86_400_000;
const SCAN_INTERVAL_DAYS = 7;
const AM_UNTIL_HOUR = 15; // antes das 15h o período padrão é a manhã
const DEFAULT_TZ = "America/Sao_Paulo";
const REACTIONS = [
  { value: "ardor", label: "Ardor" },
  { value: "vermelhidao", label: "Vermelhidão" },
  { value: "descamacao", label: "Descamação" },
  { value: "espinhas", label: "Espinhas novas" },
  { value: "oleosidade", label: "Oleosidade" },
  { value: "repuxando", label: "Repuxando" },
];

function localHour(timezone: string) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

function daysUntilNextScan(lastScan: Date) {
  return Math.max(0, SCAN_INTERVAL_DAYS - Math.floor((Date.now() - lastScan.getTime()) / DAY_MS));
}

function CheckInForm() {
  return (
    <form action={checkInAction} className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="font-display text-xl font-bold tracking-[-0.02em]">{TODAY_COPY.checkIn}</legend>
        <div className="grid grid-cols-5 gap-2">
          {TODAY_COPY.feelings.map((label, i) => (
            <label
              key={label}
              className="press flex h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[18px] border-[1.5px] border-[#E2D5CA] text-center text-xs font-semibold has-checked:border-2 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-accent"
            >
              <input type="radio" name="feeling" value={i + 1} required className="sr-only" />
              <span className="font-display text-xl font-bold tabular-nums">{i + 1}</span>
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-muted">{TODAY_COPY.noticed}</legend>
        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((r) => (
            <label
              key={r.value}
              className="inline-flex h-11 cursor-pointer items-center rounded-pill border-[1.5px] border-[#E2D5CA] px-4 text-sm font-semibold has-checked:border-text has-checked:bg-text has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-accent"
            >
              <input type="checkbox" name="reactions" value={r.value} className="sr-only" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Button variant="dark" size="lg">{TODAY_COPY.register}</Button>
    </form>
  );
}

async function Today() {
  const user = await requireSubscriber();
  const [profile, scans, today, streak] = await Promise.all([
    getSkinProfile(user.id), listFaceScans(user.id), getTodayChecklist(user.id), getStreak(user.id),
  ]);
  if (!profile) redirect("/onboarding");

  const hour = localHour(profile.timezone ?? DEFAULT_TZ);
  const done = scans.filter((s) => s.status === "done");
  const [latest, previous] = done;
  const delta = latest?.overallScore != null && previous?.overallScore != null ? latest.overallScore - previous.overallScore : null;
  const daysToNextScan = latest ? daysUntilNextScan(latest.takenAt) : 0;

  const currentPeriod = hour < AM_UNTIL_HOUR ? "am" : "pm";
  const current = today.periods.find((p) => p.period === currentPeriod)!;
  const other = today.periods.find((p) => p.period !== currentPeriod)!;
  const hasRoutine = today.periods.some((p) => p.steps.length > 0);
  const currentDone = current.steps.length > 0 && current.steps.every((s) => s.done);
  const greeting = TODAY_COPY.greeting(hour, "").replace(/, $/, "");

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pb-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">{greeting}</h1>
        {streak > 0 && <Badge tone="streak"><Flame className="size-4" aria-hidden /> {TODAY_COPY.streak(streak)}</Badge>}
      </header>

      {latest ? (
        <Link href={`/app/scan/${latest.id}`} className="press flex items-center gap-4 rounded-[24px] bg-surface-raised p-4">
          <ScoreRing score={latest.overallScore} size="sm" animate={false} />
          <span className="min-w-0 flex-1 space-y-1">
            <span className="block font-bold">Skin Score</span>
            {delta !== null && (
              <span className={delta >= 0 ? "block text-sm font-semibold text-success" : "block text-sm font-semibold text-danger"}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pontos
              </span>
            )}
            <span className="block text-sm text-muted">{TODAY_COPY.nextScan(daysToNextScan)}</span>
          </span>
          <ChevronRight className="size-5 text-muted" aria-hidden />
        </Link>
      ) : (
        <Card className="space-y-4 p-6">
          <div className="grid size-12 place-items-center rounded-pill bg-accent-soft text-accent"><ScanFace className="size-6" strokeWidth={2} aria-hidden /></div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em]">{TODAY_COPY.firstTitle}</h2>
            <p className="text-muted">{TODAY_COPY.firstBody}</p>
          </div>
          <Link href="/app/scan/rosto" className={buttonClasses("primary", "lg")}>{TODAY_COPY.firstCta}</Link>
        </Card>
      )}

      {hasRoutine ? (
        <>
          <RoutineChecklist key={current.period} period={current.period} steps={current.steps} />
          {other.steps.length > 0 && <RoutineChecklist key={other.period} period={other.period} steps={other.steps} collapsed />}
        </>
      ) : (
        <Card className="flex items-center gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-[#F1E7DE] font-display font-bold text-muted dark:bg-surface">2</span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Monte sua rotina</span>
            <span className="text-sm text-muted">Fotografe os rótulos do seu armário.</span>
          </span>
          <Link href="/app/produtos/novo" aria-label="Adicionar produto" className={buttonClasses("secondary", "sm", "w-11 px-0")}>
            <Plus className="size-5" aria-hidden />
          </Link>
        </Card>
      )}

      {currentDone && streak > 0 && (
        <div className="rise rounded-[28px] bg-accent p-6 text-on-accent">
          <p className="font-display text-[44px] font-extrabold leading-none tracking-[-0.035em]">
            <span className="streak-digit">{streak}</span>
          </p>
          <p className="mt-1 text-lg font-bold">{TODAY_COPY.streakLong(streak).replace(/^\d+ /, "")}</p>
        </div>
      )}

      {today.checkIn ? (
        <p className="py-2 text-center text-sm text-muted">
          Check-in de hoje: {TODAY_COPY.feelings[today.checkIn.feeling - 1].toLowerCase()}.
        </p>
      ) : (
        (currentDone || !hasRoutine) && (
          <Card>
            <Eyebrow className="mb-2">Check-in</Eyebrow>
            <CheckInForm />
          </Card>
        )
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
