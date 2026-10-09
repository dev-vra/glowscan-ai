"use server";

import { redirect } from "next/navigation";
import { signInWithEmail } from "@/lib/data";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignInState = { error: string | null };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  if (!EMAIL_PATTERN.test(email)) return { error: "Digite um e-mail válido." };
  await signInWithEmail(email);
  redirect("/app");
}
