"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { saveOnboardingAction } from "./actions";
import { QUESTIONS } from "./questions";

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const question = QUESTIONS[step];
  const selected = answers[question.id] ?? [];
  const isLast = step === QUESTIONS.length - 1;

  const toggle = (value: string) => {
    const next = question.multi
      ? selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
      : [value];
    setAnswers({ ...answers, [question.id]: next });
  };

  const advance = () => {
    if (!isLast) return setStep(step + 1);
    startTransition(async () => {
      const result = await saveOnboardingAction(answers);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="flex items-center gap-1 text-sm text-muted disabled:invisible">
            <ArrowLeft className="size-4" aria-hidden /> Voltar
          </button>
          <Eyebrow>{step + 1} de {QUESTIONS.length}</Eyebrow>
        </div>
        <div className="h-0.5 rounded-pill bg-border" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={QUESTIONS.length} aria-label="Progresso do questionário">
          <div className="h-full rounded-pill bg-gold transition-all duration-300 ease-lux" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="space-y-2">
          <span className="block font-display text-xl">{question.title}</span>
          <span className="block text-sm text-muted">{question.subtitle}</span>
        </legend>
        <div className="space-y-3 pt-2">
          {question.options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className={clsx(
                  "flex cursor-pointer items-center gap-4 rounded-md border bg-surface-raised p-4 transition has-focus-visible:outline-2 has-focus-visible:outline-accent",
                  isSelected ? "border-gold bg-accent-soft" : "border-border hover:bg-surface",
                )}
              >
                <input
                  type={question.multi ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => toggle(option.value)}
                  className="sr-only"
                />
                <span className="flex-1">
                  <span className="block font-semibold">{option.label}</span>
                  {option.hint && <span className="text-sm text-muted">{option.hint}</span>}
                </span>
                {isSelected && <Check className="size-5 text-accent" aria-hidden />}
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button size="lg" onClick={advance} disabled={selected.length === 0} loading={pending}>
        {isLast ? "Ver meu perfil" : "Continuar"}
      </Button>
    </div>
  );
}
