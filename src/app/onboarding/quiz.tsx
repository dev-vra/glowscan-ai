"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectChip } from "@/components/ui/chip";
import { saveOnboardingAction } from "./actions";
import { QUESTIONS } from "./questions";

const MAX_MULTI = 3;
const AUTO_ADVANCE_MS = 250;

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const question = QUESTIONS[step];
  const selected = answers[question.id] ?? [];
  const isLast = step === QUESTIONS.length - 1;

  const finish = (all: Record<string, string[]>) =>
    startTransition(async () => {
      const result = await saveOnboardingAction(all);
      if (result?.error) setError(result.error);
    });

  const advance = (all = answers) => (isLast ? finish(all) : setStep((s) => s + 1));

  const choose = (value: string) => {
    if (question.multi) {
      const next = selected.includes(value) ? selected.filter((v) => v !== value) : selected.length < MAX_MULTI ? [...selected, value] : selected;
      setAnswers({ ...answers, [question.id]: next });
      return;
    }
    const next = { ...answers, [question.id]: [value] };
    setAnswers(next);
    window.setTimeout(() => advance(next), AUTO_ADVANCE_MS); // escolha única avança sozinha
  };

  if (pending) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center">
        <div className="reading-ring size-20 rounded-pill border-[6px] border-[#EFE5DC] border-t-accent" />
        <p className="font-display text-[26px]">Montando seu plano…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button
          type="button" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Voltar"
          className="press -ml-2 grid size-11 place-items-center rounded-pill disabled:invisible"
        >
          <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
        </button>
        <div
          className="h-1.5 flex-1 rounded-pill bg-[#EFE5DC]" role="progressbar" aria-label="Progresso do questionário"
          aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={QUESTIONS.length}
        >
          <div className="h-full rounded-pill bg-accent transition-[width] duration-300 ease-lux" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="font-mono text-sm tabular-nums text-muted">{step + 1}/{QUESTIONS.length}</span>
      </div>

      <fieldset className="space-y-6">
        <legend className="space-y-2">
          <span className="block font-display text-[30px] leading-9">{question.title}</span>
          <span className="block text-muted">{question.subtitle}</span>
        </legend>
        {question.multi ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {question.options.map((option) => (
              <SelectChip key={option.value} selected={selected.includes(option.value)} onClick={() => choose(option.value)}>
                {option.label}
              </SelectChip>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={clsx(
                    "press flex min-h-16 cursor-pointer items-center rounded-[18px] bg-surface-raised px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-accent",
                    isSelected ? "border-2 border-accent bg-accent-soft" : "border-[1.5px] border-[#E2D5CA]",
                  )}
                >
                  <input type="radio" name={question.id} value={option.value} checked={isSelected} onChange={() => choose(option.value)} className="sr-only" />
                  <span className="flex-1">
                    <span className="block font-bold">{option.label}</span>
                    {option.hint && <span className="text-sm text-muted">{option.hint}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {question.multi && (
        <Button size="lg" onClick={() => advance()} disabled={selected.length === 0}>
          {isLast ? "Ver meu plano" : "Continuar"}
        </Button>
      )}
    </div>
  );
}
