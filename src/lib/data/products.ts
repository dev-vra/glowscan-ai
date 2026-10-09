import "server-only";
import { extractLabel, type LabelExtraction } from "@/lib/ai/extract-label";
import { db } from "@/lib/db";
import { normalizeInci } from "@/lib/routine/catalog";
import { PM_FAMILIES, planRoutine, type EngineProduct, type RoutinePlan } from "@/lib/routine/engine";
import { signedPhotoUrl, uploadPhoto } from "@/lib/supabase";
import type { Period, ProductCategory } from "@/generated/prisma/enums";
import { decodeJpegDataUrl, hasActiveSubscription } from "./index";

const DAILY_LABEL_LIMIT = 40;
const DAY_MS = 86_400_000;

export type ProductDraft = {
  brand: string;
  name: string;
  category: ProductCategory;
  period: Period;
  inci: string[];
  imagePath: string | null;
};

export async function extractProductFromLabel(userId: string, imageDataUrl: string): Promise<{ draft: ProductDraft; extraction: LabelExtraction }> {
  if (!(await hasActiveSubscription(userId))) throw new Error("SUBSCRIPTION_REQUIRED");
  const recent = await db().product.count({ where: { userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } } });
  if (recent >= DAILY_LABEL_LIMIT) throw new Error("RATE_LIMITED");
  const bytes = decodeJpegDataUrl(imageDataUrl);
  const imagePath = `${userId}/label-${crypto.randomUUID()}.jpg`;
  await uploadPhoto(imagePath, bytes, "image/jpeg");
  const extraction = await extractLabel(bytes);
  return {
    extraction,
    draft: { brand: extraction.brand, name: extraction.name, category: extraction.category, period: "both", inci: extraction.inci, imagePath },
  };
}

async function resolveIngredientIds(inci: string[]) {
  const names = [...new Set(inci.map(normalizeInci).filter(Boolean))];
  const known = await db().ingredient.findMany({ where: { OR: [{ inciName: { in: names } }, { aliases: { hasSome: names } }] } });
  const byName = new Map<string, string>();
  for (const ing of known) {
    byName.set(ing.inciName, ing.id);
    ing.aliases.forEach((alias) => byName.set(alias, ing.id));
  }
  const ids: string[] = [];
  for (const name of names) {
    const id =
      byName.get(name) ??
      (await db().ingredient.upsert({ where: { inciName: name }, create: { inciName: name, aliases: [] }, update: {} })).id;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

export async function saveProduct(userId: string, draft: ProductDraft, productId?: string) {
  if (draft.imagePath && !draft.imagePath.startsWith(`${userId}/`)) throw new Error("FORBIDDEN");
  const ingredientIds = await resolveIngredientIds(draft.inci);
  const data = {
    brand: draft.brand,
    name: draft.name,
    category: draft.category,
    period: draft.period,
    inciRaw: draft.inci.join(", "),
    ingredients: { create: ingredientIds.map((ingredientId, position) => ({ ingredientId, position })) },
  };
  return db().$transaction(async (tx) => {
    if (productId) {
      const owned = await tx.product.findFirst({ where: { id: productId, userId } });
      if (!owned) throw new Error("NOT_FOUND");
      await tx.productIngredient.deleteMany({ where: { productId } });
      return tx.product.update({ where: { id: productId }, data });
    }
    return tx.product.create({ data: { ...data, userId, imagePath: draft.imagePath } });
  });
}

export async function deleteProduct(userId: string, productId: string) {
  await db().product.deleteMany({ where: { id: productId, userId } });
}

const productInclude = { ingredients: { include: { ingredient: true }, orderBy: { position: "asc" as const } } };

export async function listProducts(userId: string) {
  return db().product.findMany({ where: { userId }, include: productInclude, orderBy: [{ category: "asc" }, { name: "asc" }] });
}

export async function getProduct(userId: string, productId: string) {
  const product = await db().product.findFirst({ where: { id: productId, userId }, include: productInclude });
  if (!product) return null;
  return { ...product, imageUrl: product.imagePath ? await signedPhotoUrl(product.imagePath) : null };
}

export type ProductWithIngredients = Awaited<ReturnType<typeof listProducts>>[number];

function toEngineProduct(p: ProductWithIngredients): EngineProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    period: p.period,
    ingredients: p.ingredients.map(({ ingredient }) => ({
      inciName: ingredient.inciName,
      family: ingredient.family,
      photosensitizing: ingredient.photosensitizing,
      pregnancyCaution: ingredient.pregnancyCaution,
    })),
  };
}

export async function getRoutinePlan(userId: string): Promise<{ plan: RoutinePlan; products: ProductWithIngredients[] }> {
  const [products, profile] = await Promise.all([listProducts(userId), db().skinProfile.findUnique({ where: { userId } })]);
  const plan = planRoutine(products.map(toEngineProduct), { pregnantOrNursing: profile?.pregnantOrNursing ?? false });
  return { plan, products };
}

// Persiste o plano (Routine/RoutineStep) para o checklist diário referenciar steps estáveis.
export async function saveRoutinePlan(userId: string) {
  const { plan } = await getRoutinePlan(userId);
  await db().$transaction(async (tx) => {
    for (const period of ["am", "pm"] as const) {
      const routine = await tx.routine.upsert({
        where: { userId_period: { userId, period } },
        create: { userId, period },
        update: { version: { increment: 1 }, generatedAt: new Date() },
      });
      await tx.routineStep.deleteMany({ where: { routineId: routine.id } });
      await tx.routineStep.createMany({ data: plan[period].map((s) => ({ routineId: routine.id, productId: s.productId, order: s.order, daysOfWeek: s.daysOfWeek })) });
    }
  });
  return plan;
}

// "Aplicar na rotina": tira do período o produto que não deveria estar ali e recalcula o plano.
// Manhã → leva para a noite o que tem ativo noturno; noite → leva para a manhã o outro.
export async function applyConflictSuggestion(userId: string, productIds: [string, string], period: "am" | "pm") {
  const products = await db().product.findMany({ where: { userId, id: { in: productIds } }, include: productInclude });
  if (products.length !== 2) throw new Error("NOT_FOUND");
  const hasNightActive = (p: ProductWithIngredients) => p.ingredients.some(({ ingredient }) => PM_FAMILIES.has(ingredient.family));
  const target = period === "am" ? (products.find(hasNightActive) ?? products[1]) : (products.find((p) => !hasNightActive(p)) ?? products[0]);
  await db().product.update({ where: { id: target.id }, data: { period: period === "am" ? "pm" : "am" } });
  return saveRoutinePlan(userId);
}
