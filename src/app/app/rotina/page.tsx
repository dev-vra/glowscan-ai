import Link from "next/link";
import { Suspense } from "react";
import { CalendarCheck, ChevronRight, Moon, Sun } from "lucide-react";
import { ConflictSheet } from "@/components/app/conflict-sheet";
import { formatDays } from "@/components/app/labels";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { ConflictAlert, type AlertLevel } from "@/components/ui/conflict-alert";
import { Disclaimer } from "@/components/ui/disclaimer";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePageUser } from "@/lib/auth";
import { ROUTINE_COPY } from "@/lib/copy";
import { getRoutinePlan, type ProductWithIngredients } from "@/lib/data/products";
import type { Conflict, PlannedStep } from "@/lib/routine/engine";
import type { IngredientFamily, ProductCategory } from "@/generated/prisma/enums";

type Period = "am" | "pm";

const WEEK = [
  { day: 1, label: "S" }, { day: 2, label: "T" }, { day: 3, label: "Q" }, { day: 4, label: "Q" },
  { day: 5, label: "S" }, { day: 6, label: "S" }, { day: 0, label: "D" },
];
const EXFOLIANT_FAMILIES = new Set<IngredientFamily>(["aha", "bha", "pha"]);
const AMOUNT_HINTS: Partial<Record<ProductCategory, string>> = {
  serum: "3 gotas",
  treatment: "uma ervilha",
  moisturizer: "uma avelã",
  eye: "um grão de arroz por olho",
  spf: "2 dedos de produto",
  oil: "2 gotas",
};
const DEFAULT_TZ = "America/Sao_Paulo";
const AM_UNTIL_HOUR = 15;

const families = (p: ProductWithIngredients) => new Set(p.ingredients.map(({ ingredient }) => ingredient.family));
const levelOf = (c: { severity: AlertLevel }, resolved?: boolean): AlertLevel => (resolved ? "resolved" : c.severity);

function todayWeekday() {
  const short = new Intl.DateTimeFormat("en-US", { timeZone: DEFAULT_TZ, weekday: "short" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(short);
}

function WeekStrip({ steps, products }: { steps: PlannedStep[]; products: Map<string, ProductWithIngredients> }) {
  const today = todayWeekday();
  const daysWith = (match: (f: Set<IngredientFamily>) => boolean) =>
    new Set(steps.filter((s) => match(families(products.get(s.productId)!))).flatMap((s) => s.daysOfWeek));
  const retinoidDays = daysWith((f) => f.has("retinoid"));
  const exfoliantDays = daysWith((f) => [...f].some((x) => EXFOLIANT_FAMILIES.has(x)));
  return (
    <ol className="grid grid-cols-7 gap-1" aria-label="Semana">
      {WEEK.map(({ day, label }) => (
        <li
          key={day} aria-current={day === today ? "date" : undefined}
          className={day === today ? "flex h-14 flex-col items-center justify-center gap-1 rounded-[14px] bg-text text-bg" : "flex h-14 flex-col items-center justify-center gap-1 rounded-[14px]"}
        >
          <span className="text-sm font-bold">{label}</span>
          <span className="flex h-1.5 gap-1" aria-hidden>
            {retinoidDays.has(day) && <span className="size-1.5 rounded-pill bg-accent" />}
            {exfoliantDays.has(day) && <span className="size-1.5 rounded-pill bg-gold" />}
          </span>
        </li>
      ))}
    </ol>
  );
}

async function Routine({ period }: { period: Period }) {
  const user = await requirePageUser();
  const { plan, products } = await getRoutinePlan(user.id);
  if (products.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title={ROUTINE_COPY.empty.title}
        text={ROUTINE_COPY.empty.body}
        action={<Link href="/app/produtos/novo" className={buttonClasses("primary", "lg")}>{ROUTINE_COPY.empty.cta}</Link>}
      />
    );
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const name = (id: string) => byId.get(id)?.name ?? "";
  const steps = plan[period];
  const conflicts = plan.conflicts.filter((c) => c.period === period);
  const periodIds = new Set(steps.map((s) => s.productId));
  const alerts = plan.alerts.filter((a) => periodIds.has(a.productId));
  const hasSpf = plan.am.some((s) => byId.get(s.productId)?.category === "spf");
  const critical = conflicts.find((c) => c.severity === "critical" && !c.resolvedBySchedule);
  const conflictKey = (c: Conflict) => `${c.period}:${c.productIds.join("+")}`;

  return (
    <div className="space-y-4">
      <WeekStrip steps={steps} products={byId} />

      {alerts.map((a, i) => (
        <ConflictAlert key={`a${i}`} level={a.severity} title={name(a.productId)}>{a.message}</ConflictAlert>
      ))}
      {conflicts.map((c) => (
        <ConflictAlert key={conflictKey(c)} level={levelOf(c, c.resolvedBySchedule)} title={`${name(c.productIds[0])} + ${name(c.productIds[1])}`}>
          {c.advice}
        </ConflictAlert>
      ))}
      {period === "am" && !hasSpf && <ConflictAlert level="info">{ROUTINE_COPY.noSpf}</ConflictAlert>}

      {steps.length === 0 ? (
        <p className="py-6 text-center text-muted">Nenhum produto neste período.</p>
      ) : (
        <ol className="rounded-[24px] bg-surface-raised px-4">
          {steps.map((step, i) => {
            const product = byId.get(step.productId)!;
            const hint = AMOUNT_HINTS[product.category];
            return (
              <li key={step.productId} className="rise border-b border-[#F1E7DE] last:border-b-0" style={{ ["--i" as string]: Math.min(i, 5) }}>
                <Link href={`/app/produtos/${product.id}`} className="flex min-h-16 items-center gap-4 py-3">
                  <span className="w-7 text-center font-display text-xl font-bold tabular-nums text-accent" aria-hidden>{step.order}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{product.name}</span>
                    <span className="block text-[13px] text-muted">
                      {product.brand} · {formatDays(step.daysOfWeek)}{hint && ` · ${hint}`}
                    </span>
                  </span>
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {critical && (
        <ConflictSheet
          conflictKey={conflictKey(critical)} period={critical.period} advice={critical.advice}
          products={[
            { id: critical.productIds[0], name: name(critical.productIds[0]), brand: byId.get(critical.productIds[0])?.brand ?? "" },
            { id: critical.productIds[1], name: name(critical.productIds[1]), brand: byId.get(critical.productIds[1])?.brand ?? "" },
          ]}
        />
      )}
      <Disclaimer />
    </div>
  );
}

async function RoutineForPeriod({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: DEFAULT_TZ, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const period: Period = p === "pm" || p === "am" ? p : hour < AM_UNTIL_HOUR ? "am" : "pm";
  return (
    <>
      <div role="tablist" aria-label="Período" className="grid grid-cols-2 rounded-pill bg-surface p-1">
        {(["am", "pm"] as const).map((value) => {
          const Icon = value === "am" ? Sun : Moon;
          const active = value === period;
          return (
            <Link
              key={value} href={`/app/rotina?p=${value}`} role="tab" aria-selected={active} replace scroll={false}
              className={active ? "flex h-11 items-center justify-center gap-2 rounded-pill bg-surface-raised font-bold" : "flex h-11 items-center justify-center gap-2 rounded-pill font-semibold text-muted"}
            >
              <Icon className="size-5" strokeWidth={2} aria-hidden /> {value === "am" ? ROUTINE_COPY.am : ROUTINE_COPY.pm}
            </Link>
          );
        })}
      </div>
      <Suspense fallback={<PageSkeleton />}>
        <Routine period={period} />
      </Suspense>
    </>
  );
}

export default function RoutinePage({ searchParams }: PageProps<"/app/rotina">) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pb-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">{ROUTINE_COPY.title}</h1>
        <Link href="/app/produtos" className="text-sm font-bold text-accent underline-offset-4 hover:underline">Meu armário</Link>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <RoutineForPeriod searchParams={searchParams as Promise<{ p?: string }>} />
      </Suspense>
    </div>
  );
}
