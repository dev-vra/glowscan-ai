import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, CalendarCheck, CheckCircle2, Info, Moon, Sun } from "lucide-react";
import { formatDays, SEVERITY_LABELS } from "@/components/app/labels";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { buttonClasses } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/disclaimer";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePageUser } from "@/lib/auth";
import { getRoutinePlan, type ProductWithIngredients } from "@/lib/data/products";
import type { Alert, Conflict, PlannedStep } from "@/lib/routine/engine";
import type { Severity } from "@/generated/prisma/enums";

const SEVERITY_TONE: Record<Severity, string> = { info: "text-muted", warn: "text-warning", critical: "text-danger" };
const SEVERITY_ICON = { info: Info, warn: AlertTriangle, critical: AlertTriangle };

function StepList({ title, icon: Icon, steps, products }: { title: string; icon: typeof Sun; steps: PlannedStep[]; products: Map<string, ProductWithIngredients> }) {
  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 font-display text-xl"><Icon className="size-5 text-gold" strokeWidth={1.5} aria-hidden /> {title}</h2>
      {steps.length === 0 ? (
        <p className="text-sm text-muted">Nenhum produto neste período.</p>
      ) : (
        <ol className="space-y-3">
          {steps.map((step) => {
            const product = products.get(step.productId)!;
            return (
              <li key={step.productId} className="flex gap-4">
                <span className="font-display text-xl tabular-nums text-gold" aria-hidden>{step.order}</span>
                <Link href={`/app/produtos/${product.id}`} className="min-w-0 flex-1 hover:underline">
                  <span className="block truncate text-sm font-semibold">{product.name}</span>
                  <span className="text-xs text-muted">{product.brand} · {formatDays(step.daysOfWeek)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function Finding({ severity, title, text, resolved }: { severity: Severity; title: string; text: string; resolved?: boolean }) {
  const Icon = resolved ? CheckCircle2 : SEVERITY_ICON[severity];
  return (
    <details className="group rounded-md bg-surface-raised p-4 shadow-card">
      <summary className="flex cursor-pointer list-none items-start gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${resolved ? "text-success" : SEVERITY_TONE[severity]}`} aria-hidden />
        <span className="flex-1 text-sm">
          <span className="font-semibold">{resolved ? "Resolvido na agenda" : SEVERITY_LABELS[severity]}:</span> {title}
        </span>
      </summary>
      <p className="mt-3 pl-8 text-sm text-muted">{text}</p>
    </details>
  );
}

async function Routine() {
  const user = await requirePageUser();
  const { plan, products } = await getRoutinePlan(user.id);
  if (products.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Sem rotina ainda"
        text="Adicione os produtos do seu armário e montamos a ordem da manhã e da noite."
        action={<Link href="/app/produtos/novo" className={buttonClasses("primary", "md")}>Adicionar produto</Link>}
      />
    );
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const name = (id: string) => byId.get(id)?.name ?? "";
  const conflictTitle = (c: Conflict) => `${name(c.productIds[0])} + ${name(c.productIds[1])}`;
  const alertTitle = (a: Alert) => name(a.productId);

  return (
    <div className="space-y-6">
      {(plan.alerts.length > 0 || plan.conflicts.length > 0) && (
        <section aria-labelledby="findings" className="space-y-3">
          <h2 id="findings" className="text-sm font-semibold">O que encontramos</h2>
          {plan.alerts.map((a, i) => <Finding key={`a${i}`} severity={a.severity} title={alertTitle(a)} text={a.message} />)}
          {plan.conflicts.map((c, i) => <Finding key={`c${i}`} severity={c.severity} title={conflictTitle(c)} text={c.advice} resolved={c.resolvedBySchedule} />)}
        </section>
      )}
      <StepList title="Manhã" icon={Sun} steps={plan.am} products={byId} />
      <StepList title="Noite" icon={Moon} steps={plan.pm} products={byId} />
      <Disclaimer />
    </div>
  );
}

export default function RoutinePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Eyebrow>Rotina</Eyebrow>
        <h1 className="font-display text-xl">A ordem certa, todos os dias</h1>
        <Link href="/app/produtos" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">Ver meu armário</Link>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <Routine />
      </Suspense>
    </div>
  );
}
