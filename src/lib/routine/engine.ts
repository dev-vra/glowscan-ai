// Motor determinístico de rotina: ordem, período, frequência e conflitos. Sem IA, sem I/O.
import type { IngredientFamily, Period, ProductCategory, Severity } from "@/generated/prisma/enums";
import { CONFLICTS, orderedPair } from "./catalog";

export type EngineIngredient = { family: IngredientFamily; photosensitizing: boolean; pregnancyCaution: boolean; inciName: string };
export type EngineProduct = { id: string; name: string; category: ProductCategory; period: Period; ingredients: EngineIngredient[] };
export type EngineProfile = { pregnantOrNursing: boolean };

export type PlannedStep = { productId: string; order: number; daysOfWeek: number[] };
export type Conflict = {
  productIds: [string, string];
  families: [IngredientFamily, IngredientFamily];
  severity: Severity;
  advice: string;
  period: "am" | "pm";
  resolvedBySchedule: boolean;
};
export type Alert = { productId: string; severity: Severity; message: string };
export type RoutinePlan = { am: PlannedStep[]; pm: PlannedStep[]; conflicts: Conflict[]; alerts: Alert[] };

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const RETINOID_DAYS = [1, 3, 5]; // seg, qua, sex
const EXFOLIANT_DAYS = [2, 6]; // ter, sáb — nunca coincide com retinoide

const CATEGORY_ORDER: Record<ProductCategory, number> = {
  cleanser: 1, exfoliant: 2, toner: 3, mask: 4, essence: 5, treatment: 6, serum: 7, eye: 8, moisturizer: 9, oil: 10, spf: 11, other: 7,
};

const PM_FAMILIES = new Set<IngredientFamily>(["retinoid", "aha", "bha", "benzoyl_peroxide", "copper_peptide"]);
const AM_FAMILIES = new Set<IngredientFamily>(["vitamin_c"]);
const EXFOLIANT_FAMILIES = new Set<IngredientFamily>(["aha", "bha"]);

const families = (p: EngineProduct) => new Set(p.ingredients.map((i) => i.family));

function decidePeriods(product: EngineProduct): ("am" | "pm")[] {
  if (product.category === "spf") return ["am"];
  if (product.period === "am") return ["am"];
  if (product.period === "pm") return ["pm"];
  const fams = families(product);
  if ([...fams].some((f) => PM_FAMILIES.has(f))) return ["pm"];
  if ([...fams].some((f) => AM_FAMILIES.has(f))) return ["am"];
  return ["am", "pm"];
}

function decideDays(product: EngineProduct, period: "am" | "pm"): number[] {
  if (period === "am") return EVERY_DAY;
  const fams = families(product);
  if (fams.has("retinoid")) return RETINOID_DAYS;
  if ([...fams].some((f) => EXFOLIANT_FAMILIES.has(f)) || product.category === "exfoliant") return EXFOLIANT_DAYS;
  return EVERY_DAY;
}

const shareDay = (a: number[], b: number[]) => a.some((d) => b.includes(d));

function findConflicts(products: EngineProduct[], steps: PlannedStep[], period: "am" | "pm"): Conflict[] {
  const conflicts: Conflict[] = [];
  const byId = new Map(products.map((p) => [p.id, p]));
  for (let i = 0; i < steps.length; i++) {
    for (let j = i + 1; j < steps.length; j++) {
      const a = byId.get(steps[i].productId)!;
      const b = byId.get(steps[j].productId)!;
      for (const rule of CONFLICTS) {
        const fa = families(a);
        const fb = families(b);
        const hit = (fa.has(rule.a) && fb.has(rule.b)) || (fa.has(rule.b) && fb.has(rule.a));
        if (!hit) continue;
        conflicts.push({
          productIds: [a.id, b.id],
          families: orderedPair(rule.a, rule.b),
          severity: rule.severity,
          advice: rule.advice,
          period,
          resolvedBySchedule: !shareDay(steps[i].daysOfWeek, steps[j].daysOfWeek),
        });
      }
    }
  }
  return conflicts;
}

function buildAlerts(products: EngineProduct[], profile: EngineProfile, amSteps: PlannedStep[]): Alert[] {
  const alerts: Alert[] = [];
  const hasSpf = products.some((p) => p.category === "spf" || families(p).has("sunscreen_filter"));
  for (const product of products) {
    const caution = product.ingredients.filter((i) => i.pregnancyCaution);
    if (profile.pregnantOrNursing && caution.length) {
      alerts.push({
        productId: product.id,
        severity: "critical",
        message: `Contém ${caution.map((i) => i.inciName).join(", ")}, que pede cautela na gestação e amamentação. Converse com seu médico antes de usar.`,
      });
    }
    if (!hasSpf && product.ingredients.some((i) => i.photosensitizing)) {
      alerts.push({ productId: product.id, severity: "warn", message: "Este produto deixa a pele mais sensível ao sol e não há protetor solar no seu armário." });
    }
  }
  if (!hasSpf && amSteps.length) {
    alerts.push({ productId: amSteps[amSteps.length - 1].productId, severity: "info", message: "Sua rotina da manhã fica completa com um protetor solar como último passo." });
  }
  return alerts;
}

export function planRoutine(products: EngineProduct[], profile: EngineProfile): RoutinePlan {
  const am: PlannedStep[] = [];
  const pm: PlannedStep[] = [];
  const sorted = [...products].sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] || a.name.localeCompare(b.name));
  for (const product of sorted) {
    for (const period of decidePeriods(product)) {
      const target = period === "am" ? am : pm;
      target.push({ productId: product.id, order: target.length + 1, daysOfWeek: decideDays(product, period) });
    }
  }
  return {
    am,
    pm,
    conflicts: [...findConflicts(products, am, "am"), ...findConflicts(products, pm, "pm")],
    alerts: buildAlerts(products, profile, am),
  };
}
