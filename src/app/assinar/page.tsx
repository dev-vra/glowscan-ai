import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/lib/auth";
import { getPlanPrices } from "@/lib/billing";
import { hasActiveSubscription } from "@/lib/data";
import { BILLING_COPY } from "@/lib/copy";
import { checkoutAction, portalAction } from "./actions";

const BENEFITS = [
  "Análise da pele por foto, sempre que quiser",
  "Leitura dos rótulos de todo o seu armário",
  "Rotina da manhã e da noite na ordem certa",
  "Gráficos da sua evolução",
];

async function PlanPicker() {
  const user = await requirePageUser();
  if (await hasActiveSubscription(user.id)) redirect("/app"); // tester beta ou já assinante
  const prices = await getPlanPrices();
  const plans = [
    { id: "yearly", name: BILLING_COPY.annual.label, price: prices.yearly, detail: `${prices.yearlyPerMonth}/mês`, badge: prices.savingsPercent > 0 ? `Economize ${prices.savingsPercent}%` : null, featured: true },
    { id: "monthly", name: BILLING_COPY.monthly.label, price: prices.monthly, detail: "por mês", badge: null, featured: false },
  ];
  return (
    <form action={checkoutAction} className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="sr-only">Escolha o plano</legend>
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="relative flex min-h-20 cursor-pointer items-center gap-4 rounded-[20px] border-[1.5px] border-[#E2D5CA] bg-surface-raised px-5 py-4 has-checked:border-[2.5px] has-checked:border-accent has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input type="radio" name="plan" value={plan.id} defaultChecked={plan.featured} className="sr-only" />
            {plan.badge && (
              <span className="absolute -top-3 right-4 rounded-pill bg-accent px-3 py-1 text-xs font-bold text-on-accent">{plan.badge}</span>
            )}
            <span className="flex-1">
              <span className="block font-bold">{plan.name}</span>
              <span className="text-sm text-muted">{plan.detail}</span>
            </span>
            <span className="font-display text-xl tabular-nums">{plan.price}</span>
          </label>
        ))}
      </fieldset>
      <Button type="submit" size="lg">{BILLING_COPY.cta}</Button>
      <p className="text-center text-sm text-muted">
        {prices.trialDays} dias grátis. Cancele quando quiser. Avisamos 2 dias antes de cobrar.
      </p>
    </form>
  );
}

export default function PaywallPage() {
  return (
    <main className="mx-auto max-w-content space-y-8 px-5 py-10">
      <header className="space-y-3">
        <p className="font-display text-[32px] font-extrabold tracking-[-0.05em] text-accent">viço</p>
        <h1 className="font-display text-[30px] leading-9">{BILLING_COPY.trialHeadline}</h1>
      </header>
      <ul className="space-y-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-pill bg-accent-soft text-accent"><Check className="size-4" strokeWidth={3} aria-hidden /></span>
            {benefit}
          </li>
        ))}
      </ul>
      <Suspense fallback={<PageSkeleton />}>
        <PlanPicker />
      </Suspense>
      <div className="flex justify-center gap-2 text-sm text-muted">
        <span>Pagamento seguro</span>
        <span aria-hidden>·</span>
        <form action={portalAction}><button type="submit" className="underline underline-offset-4">Restaurar compra</button></form>
      </div>
    </main>
  );
}
