"use server";

import { redirect } from "next/navigation";
import { createCheckoutUrl, createPortalUrl, type Plan } from "@/lib/billing";
import { requireUser } from "@/lib/data";

export async function checkoutAction(formData: FormData) {
  const user = await requireUser();
  const plan: Plan = formData.get("plan") === "yearly" ? "yearly" : "monthly";
  redirect(await createCheckoutUrl(user.id, user.email, plan));
}

export async function portalAction() {
  const user = await requireUser();
  const url = await createPortalUrl(user.id);
  redirect(url ?? "/assinar");
}
