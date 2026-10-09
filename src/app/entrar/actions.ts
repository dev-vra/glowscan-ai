"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendMagicLink, startGoogleSignIn } from "@/lib/data";
import { env } from "@/lib/env";

export type SignInState = { error: string | null; sentTo: string | null };

const emailSchema = z.email();

function callbackUrl() {
  return `${env().NEXT_PUBLIC_SITE_URL}/auth/callback`;
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { error: "Digite um e-mail válido.", sentTo: null };
  try {
    await sendMagicLink(parsed.data, callbackUrl());
  } catch {
    return { error: "Não conseguimos enviar o link agora. Tente em alguns minutos.", sentTo: null };
  }
  return { error: null, sentTo: parsed.data };
}

export async function googleSignInAction() {
  redirect(await startGoogleSignIn(callbackUrl()));
}
