"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { saveSkinProfile } from "@/lib/data/profile";

const schema = z.object({
  skinType: z.enum(["dry", "oily", "combination", "normal", "sensitive"]),
  concerns: z.array(z.enum(["lines", "spots", "pores", "blemishes", "redness", "dullness", "dehydration"])).max(7),
  ageRange: z.enum(["18-24", "25-34", "35-44", "45-54", "55+"]),
  pregnantOrNursing: z.enum(["yes", "no"]).transform((v) => v === "yes"),
});

export async function saveOnboardingAction(answers: Record<string, string[]>) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    skinType: answers.skinType?.[0],
    concerns: answers.concerns ?? [],
    ageRange: answers.ageRange?.[0],
    pregnantOrNursing: answers.pregnantOrNursing?.[0],
  });
  if (!parsed.success) return { error: "Responda todas as perguntas." };
  await saveSkinProfile(user.id, { ...parsed.data, city: null });
  redirect("/onboarding/plano");
}
