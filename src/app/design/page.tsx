import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/disclaimer";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricBar } from "@/components/ui/metric-bar";
import { ScoreRing } from "@/components/ui/score-ring";

const SWATCHES = ["bg", "surface", "surface-raised", "border", "text", "muted", "accent", "accent-soft", "gold", "danger", "warning", "success"];

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-wide space-y-12 px-6 py-12">
      <header className="space-y-2">
        <Eyebrow>Design system</Eyebrow>
        <h1 className="font-display text-display">Viço — componentes</h1>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Cores</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((name) => (
            <li key={name} className="space-y-2 text-xs">
              <div className="h-16 rounded-md border border-border" style={{ background: `var(--color-${name})` }} />
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Botões</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Excluir</Button>
          <Button loading>Salvando</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card className="flex justify-center gap-6">
          <ScoreRing score={78} />
          <ScoreRing score={null} size="sm" />
        </Card>
        <Card className="space-y-5">
          <MetricBar label="Hidratação aparente" score={82} delta={6} />
          <MetricBar label="Vermelhidão" score={55} delta={-3} />
          <MetricBar label="Poros" score={31} />
        </Card>
      </section>

      <Card>
        <EmptyState icon={Droplets} title="Armário vazio" text="Fotografe o rótulo do primeiro produto." action={<Button>Adicionar produto</Button>} />
      </Card>
      <Disclaimer />
    </main>
  );
}
