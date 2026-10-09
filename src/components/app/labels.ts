import type { Period, ProductCategory, Severity } from "@/generated/prisma/enums";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cleanser: "Limpeza",
  toner: "Tônico",
  essence: "Essência",
  serum: "Sérum",
  treatment: "Tratamento",
  eye: "Área dos olhos",
  moisturizer: "Hidratante",
  oil: "Óleo",
  spf: "Protetor solar",
  mask: "Máscara",
  exfoliant: "Esfoliante",
  other: "Outro",
};

export const PERIOD_LABELS: Record<Period, string> = { am: "Manhã", pm: "Noite", both: "Manhã e noite" };

export const SEVERITY_LABELS: Record<Severity, string> = { info: "Dica", warn: "Atenção", critical: "Importante" };

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const ALL_DAYS = 7;

export function formatDays(days: number[]) {
  if (days.length === ALL_DAYS) return "todos os dias";
  return days.map((d) => WEEKDAYS[d]).join(", ");
}
