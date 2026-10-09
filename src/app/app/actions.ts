"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { saveCheckIn, toggleRoutineStep } from "@/lib/data/daily";

const toggleSchema = z.object({ period: z.enum(["am", "pm"]), stepId: z.uuid(), done: z.boolean() });

export async function toggleStepAction(input: { period: "am" | "pm"; stepId: string; done: boolean }) {
  const user = await requireUser();
  const { period, stepId, done } = toggleSchema.parse(input);
  await toggleRoutineStep(user.id, period, stepId, done);
  revalidatePath("/app");
}

const checkInSchema = z.object({
  feeling: z.coerce.number().int().min(1).max(5),
  reactions: z.array(z.enum(["ardor", "vermelhidao", "descamacao", "espinhas", "oleosidade", "repuxando"])).max(6),
});

export async function checkInAction(formData: FormData) {
  const user = await requireUser();
  const parsed = checkInSchema.safeParse({ feeling: formData.get("feeling"), reactions: formData.getAll("reactions") });
  if (!parsed.success) return;
  await saveCheckIn(user.id, parsed.data.feeling, parsed.data.reactions, null);
  revalidatePath("/app");
}
