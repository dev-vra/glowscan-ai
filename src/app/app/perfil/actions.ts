"use server";

import { redirect } from "next/navigation";
import { deleteAccount, requireUser, revokeFacialConsent, signOut } from "@/lib/data";

export async function signOutAction() {
  await signOut();
  redirect("/");
}

export async function revokeConsentAction() {
  const user = await requireUser();
  await revokeFacialConsent(user.id);
  redirect("/app/perfil?consentimento=revogado");
}

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser();
  if (formData.get("confirm") !== "EXCLUIR") redirect("/app/perfil?erro=confirmacao");
  await deleteAccount(user.id);
  await signOut();
  redirect("/?conta=excluida");
}
