"use client";

import { useOptimistic, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { toggleStepAction } from "@/app/app/actions";
import { TODAY_COPY } from "@/lib/copy";

type Step = { id: string; order: number; name: string; brand: string; done: boolean };
type ChecklistProps = { period: "am" | "pm"; steps: Step[]; collapsed?: boolean };

export function RoutineChecklist({ period, steps, collapsed = false }: ChecklistProps) {
  const [optimistic, setOptimistic] = useOptimistic(steps, (state, { id, done }: { id: string; done: boolean }) =>
    state.map((s) => (s.id === id ? { ...s, done } : s)),
  );
  const [, startTransition] = useTransition();
  const doneCount = optimistic.filter((s) => s.done).length;
  const allDone = optimistic.length > 0 && doneCount === optimistic.length;
  const Icon = period === "am" ? Sun : Moon;
  const title = period === "am" ? "Manhã" : "Noite";

  const toggle = (id: string, done: boolean) =>
    startTransition(async () => {
      setOptimistic({ id, done });
      await toggleStepAction({ period, stepId: id, done });
    });

  const heading = (
    <span className="flex flex-1 items-center justify-between">
      <span className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.02em]">
        <Icon className="size-5 text-accent" strokeWidth={2} aria-hidden /> {allDone ? TODAY_COPY.done(period) : title}
      </span>
      <span className="text-sm font-semibold tabular-nums text-muted">{doneCount}/{optimistic.length}</span>
    </span>
  );

  const list = optimistic.length === 0 ? (
    <p className="text-muted">Nada programado para hoje.</p>
  ) : (
    <ul>
      {optimistic.map((step, i) => (
        <li key={step.id} className="rise border-b border-[#F1E7DE] last:border-b-0" style={{ ["--i" as string]: Math.min(i, 5) }}>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
            <input type="checkbox" checked={step.done} onChange={(e) => toggle(step.id, e.target.checked)} className="peer sr-only" />
            <span
              data-done={step.done}
              className="step-check grid size-7 shrink-0 place-items-center rounded-pill border-2 border-border-input peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent data-[done=true]:border-accent"
              aria-hidden
            >
              {step.done && (
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span data-done={step.done} className="step-label block truncate text-[15px] font-semibold">{step.name}</span>
              <span className="text-[13px] text-muted">{step.brand}</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );

  if (collapsed) {
    return (
      <details className="group rounded-[24px] bg-surface-raised px-5">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2">{heading}</summary>
        <div className="pb-3">{list}</div>
      </details>
    );
  }

  return (
    <section aria-labelledby={`routine-${period}`} className="space-y-1 rounded-[24px] bg-surface-raised px-5 pt-4 pb-2">
      <h2 id={`routine-${period}`} className="flex">{heading}</h2>
      {list}
    </section>
  );
}
