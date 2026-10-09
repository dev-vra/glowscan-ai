import { Suspense } from "react";
import { Check } from "lucide-react";
import { PageSkeleton } from "@/components/app/page-skeleton";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { checkoutAction } from "./actions";

const BENEFITS = [
  "Análises ilimitadas da pele com IA",
  "Leitura dos rótulos de todo o seu armário",
  "Rotina da manhã e da noite na ordem certa",
  "Alertas de ativos que não combinam",
  "Diário de evolução com gráficos",
];

const PLANS = [
  { id: "yearly", name: "Anual", price: "R$ 199", detail: "R$ 16,58/mês · economize 43%", featured: true },
  { id: "monthly", name: "Mensal", price: "R$ 29", detail: "por mês", featured: false },
] as const;

async function PlanPicker() {
  await requirePageUser();
  return (
    <form action={checkoutAction} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="sr-only">Escolha o plano</legend>
        {PLANS.map((plan) => (
          <label
            key={plan.id}
            className="flex cursor-pointer items-center gap-4 rounded-md border border-border bg-surface-raised p-4 has-checked:border-gold has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input type="radio" name="plan" value={plan.id} defaultChecked={plan.featured} className="sr-only" />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-semibold">
                {plan.name}
                {plan.featured && <span className="rounded-pill bg-gold px-2 py-0.5 text-xs text-on-accent">Melhor valor</span>}
              </span>
              <span className="text-sm text-muted">{plan.detail}</span>
            </span>
            <span className="font-display text-xl tabular-nums">{plan.price}</span>
          </label>
        ))}
      </fieldset>
      <Button type="submit" size="lg">Começar 3 dias grátis</Button>
      <p className="text-center text-xs text-muted">Nenhuma cobrança hoje. Cancele em um clique, a qualquer momento, em Perfil.</p>
    </form>
  );
}

export default function PaywallPage() {
  return (
    <main className="mx-auto max-w-content space-y-8 px-6 py-12">
      <header className="space-y-3">
        <Eyebrow>GlowScan Premium</Eyebrow>
        <h1 className="font-display text-display">Seu sommelier de skincare.</h1>
      </header>
      <ul className="space-y-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-3 text-sm">
            <Check className="size-5 shrink-0 text-gold" aria-hidden /> {benefit}
          </li>
        ))}
      </ul>
      <Suspense fallback={<PageSkeleton />}>
        <PlanPicker />
      </Suspense>
    </main>
  );
}
