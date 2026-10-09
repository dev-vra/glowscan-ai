"use server";

import { redirect } from "next/navigation";
import { deleteAccount, grantConsent, requireUser, revokeConsent, revokeFacialConsent, signOut } from "@/lib/data";

export async function signOutAction() {
  await signOut();
  redirect("/");
}

export async function revokeConsentAction() {
  const user = await requireUser();
  await revokeFacialConsent(user.id);
  redirect("/app/perfil?consentimento=revogado");
}

export async function toggleResearchConsentAction(formData: FormData) {
  const user = await requireUser();
  if (formData.get("enable") === "1") await grantConsent(user.id, "research_data");
  else await revokeConsent(user.id, "research_data");
  redirect("/app/perfil");
}

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser();
  if (formData.get("confirm") !== "EXCLUIR") redirect("/app/perfil?erro=confirmacao");
  await deleteAccount(user.id);
  await signOut();
  redirect("/?conta=excluida");
}
