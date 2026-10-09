import { describe, expect, it } from "vitest";
import { findCatalogIngredient, normalizeInci } from "./catalog";
import { planRoutine, type EngineIngredient, type EngineProduct } from "./engine";

const ing = (inciName: string): EngineIngredient => {
  const found = findCatalogIngredient(inciName);
  return { inciName, family: found?.family ?? "other", photosensitizing: !!found?.photosensitizing, pregnancyCaution: !!found?.pregnancyCaution };
};

const product = (id: string, category: EngineProduct["category"], inci: string[], period: EngineProduct["period"] = "both"): EngineProduct => ({
  id, name: id, category, period, ingredients: inci.map(ing),
});

describe("catalog", () => {
  it("normaliza INCI com porcentagem e aliases", () => {
    expect(normalizeInci("  Niacinamide 10% ")).toBe("niacinamide");
    expect(findCatalogIngredient("Vitamin C")?.family).toBe("vitamin_c");
    expect(findCatalogIngredient("Tinosorb S")?.family).toBe("sunscreen_filter");
  });
});

describe("planRoutine", () => {
  const cleanser = product("cleanser", "cleanser", ["glycerin"]);
  const vitC = product("vitc", "serum", ["ascorbic acid"]);
  const retinol = product("retinol", "serum", ["retinol"]);
  const glycolic = product("glycolic", "exfoliant", ["glycolic acid"]);
  const spf = product("spf", "spf", ["zinc oxide"]);
  const moist = product("moist", "moisturizer", ["ceramide np"]);

  it("ordena por categoria e põe SPF por último só de manhã", () => {
    const plan = planRoutine([spf, moist, vitC, cleanser], { pregnantOrNursing: false });
    expect(plan.am.map((s) => s.productId)).toEqual(["cleanser", "vitc", "moist", "spf"]);
    expect(plan.pm.map((s) => s.productId)).toEqual(["cleanser", "moist"]);
  });

  it("separa retinoide e AHA em noites diferentes e marca conflito como resolvido", () => {
    const plan = planRoutine([retinol, glycolic, spf], { pregnantOrNursing: false });
    const conflict = plan.conflicts.find((c) => c.families.includes("retinoid") && c.families.includes("aha"));
    expect(conflict?.resolvedBySchedule).toBe(true);
    const days = (id: string) => plan.pm.find((s) => s.productId === id)!.daysOfWeek;
    expect(days("retinol").some((d) => days("glycolic").includes(d))).toBe(false);
  });

  it("detecta conflito não resolvido quando o usuário força o mesmo período", () => {
    const bpo = product("bpo", "treatment", ["benzoyl peroxide"]);
    const plan = planRoutine([bpo, product("vitc-pm", "serum", ["ascorbic acid"], "pm")], { pregnantOrNursing: false });
    expect(plan.conflicts).toContainEqual(expect.objectContaining({ severity: "warn", resolvedBySchedule: false }));
  });

  it("alerta gestante sobre retinoide e falta de SPF com fotossensibilizante", () => {
    const plan = planRoutine([retinol], { pregnantOrNursing: true });
    expect(plan.alerts.map((a) => a.severity)).toEqual(expect.arrayContaining(["critical", "warn"]));
  });
});
