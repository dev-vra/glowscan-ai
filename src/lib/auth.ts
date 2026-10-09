import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveSubscription, hasFacialConsent } from "@/lib/data";

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireSubscriber() {
  const user = await requirePageUser();
  if (!(await hasActiveSubscription(user.id))) redirect("/assinar");
  return user;
}

export async function requireConsentedUser() {
  const user = await requireSubscriber();
  if (!(await hasFacialConsent(user.id))) redirect("/app/consentimento");
  return user;
}
