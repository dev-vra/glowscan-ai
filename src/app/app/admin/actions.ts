"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { createTester, isAdmin, resetTesterPassword, setBetaAccess } from "@/lib/data/admin";

export type CredentialState = { error: string | null; credential: { email: string; password: string } | null };

async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.email)) throw new Error("FORBIDDEN");
  return user;
}

export async function createTesterAction(_prev: CredentialState, formData: FormData): Promise<CredentialState> {
  await requireAdmin();
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { error: "E-mail inválido.", credential: null };
  try {
    const credential = await createTester(parsed.data);
    revalidatePath("/app/admin");
    return { error: null, credential };
  } catch (e) {
    const already = e instanceof Error && /already|registered|exists/i.test(e.message);
    return { error: already ? "Esse e-mail já tem conta. Use 'Nova senha' na lista." : "Não deu pra criar o acesso.", credential: null };
  }
}

export async function resetPasswordAction(_prev: CredentialState, formData: FormData): Promise<CredentialState> {
  await requireAdmin();
  const userId = z.uuid().parse(formData.get("userId"));
  return { error: null, credential: await resetTesterPassword(userId) };
}

export async function toggleBetaAction(formData: FormData) {
  await requireAdmin();
  const userId = z.uuid().parse(formData.get("userId"));
  await setBetaAccess(userId, formData.get("enable") === "1");
  revalidatePath("/app/admin");
}
