"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { deleteProduct, extractProductFromLabel, saveProduct, saveRoutinePlan, type ProductDraft } from "@/lib/data/products";

export type ExtractState = { draft: ProductDraft | null; lowConfidence: boolean; error: string | null };

export async function extractLabelAction(imageDataUrl: string): Promise<ExtractState> {
  const user = await requireUser();
  try {
    const { draft, extraction } = await extractProductFromLabel(user.id, imageDataUrl);
    if (!extraction.readable) return { draft: null, lowConfidence: false, error: "Não conseguimos ler este rótulo. Fotografe a lista de ingredientes de perto, sem reflexo." };
    return { draft, lowConfidence: extraction.confidence < 0.7 || extraction.inci.length === 0, error: null };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "SUBSCRIPTION_REQUIRED") redirect("/assinar");
    if (code === "RATE_LIMITED") return { draft: null, lowConfidence: false, error: "Limite diário de leituras atingido. Volte amanhã ou cadastre manualmente." };
    return { draft: null, lowConfidence: false, error: "Falha ao ler o rótulo. Tente de novo." };
  }
}

const draftSchema = z.object({
  brand: z.string().trim().min(1, "Informe a marca").max(80),
  name: z.string().trim().min(1, "Informe o nome").max(120),
  category: z.enum(["cleanser", "toner", "essence", "serum", "treatment", "eye", "moisturizer", "oil", "spf", "mask", "exfoliant", "other"]),
  period: z.enum(["am", "pm", "both"]),
  inci: z.string().max(5000).transform((s) => s.split(/[,\n;]/).map((i) => i.trim()).filter(Boolean)),
  imagePath: z.string().max(300).nullable(),
  productId: z.uuid().nullable(),
});

export type SaveState = { error: string | null };

export async function saveProductAction(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  const parsed = draftSchema.safeParse({
    brand: formData.get("brand"),
    name: formData.get("name"),
    category: formData.get("category"),
    period: formData.get("period"),
    inci: formData.get("inci") ?? "",
    imagePath: formData.get("imagePath") || null,
    productId: formData.get("productId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const { productId, ...draft } = parsed.data;
  await saveProduct(user.id, draft, productId ?? undefined);
  await saveRoutinePlan(user.id);
  redirect("/app/produtos");
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireUser();
  const id = z.uuid().parse(formData.get("productId"));
  await deleteProduct(user.id, id);
  await saveRoutinePlan(user.id);
  redirect("/app/produtos");
}
