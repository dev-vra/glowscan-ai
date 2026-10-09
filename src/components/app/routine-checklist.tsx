"use client";

import { useOptimistic, useTransition } from "react";
import { clsx } from "clsx";
import { Moon, Sun } from "lucide-react";
import { toggleStepAction } from "@/app/app/actions";

type Step = { id: string; order: number; name: string; brand: string; done: boolean };
type ChecklistProps = { period: "am" | "pm"; steps: Step[] };

export function RoutineChecklist({ period, steps }: ChecklistProps) {
  const [optimistic, setOptimistic] = useOptimistic(steps, (state, { id, done }: { id: string; done: boolean }) =>
    state.map((s) => (s.id === id ? { ...s, done } : s)),
  );
  const [, startTransition] = useTransition();
  const doneCount = optimistic.filter((s) => s.done).length;
  const Icon = period === "am" ? Sun : Moon;

  const toggle = (id: string, done: boolean) =>
    startTransition(async () => {
      setOptimistic({ id, done });
      await toggleStepAction({ period, stepId: id, done });
    });

  return (
    <section aria-labelledby={`routine-${period}`} className="space-y-3 rounded-lg bg-surface-raised p-5 shadow-card">
      <h2 id={`routine-${period}`} className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-xl"><Icon className="size-5 text-gold" strokeWidth={1.5} aria-hidden /> {period === "am" ? "Manhã" : "Noite"}</span>
        <span className="text-xs tabular-nums text-muted">{doneCount}/{optimistic.length}</span>
      </h2>
      {optimistic.length === 0 ? (
        <p className="text-sm text-muted">Nada programado para hoje.</p>
      ) : (
        <ul className="space-y-1">
          {optimistic.map((step) => (
            <li key={step.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-surface">
                <input type="checkbox" checked={step.done} onChange={(e) => toggle(step.id, e.target.checked)} className="size-5 accent-accent" />
                <span className={clsx("min-w-0 flex-1", step.done && "text-muted line-through decoration-border-input")}>
                  <span className="block truncate text-sm font-semibold">{step.name}</span>
                  <span className="text-xs text-muted">{step.brand}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
