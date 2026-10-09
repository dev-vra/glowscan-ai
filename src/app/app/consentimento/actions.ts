"use server";

import { redirect } from "next/navigation";
import { grantFacialConsent, requireUser } from "@/lib/data";

export async function grantConsentAction(formData: FormData) {
  const user = await requireUser();
  if (formData.get("accept") !== "on") return;
  await grantFacialConsent(user.id);
  redirect("/app/scan/rosto");
}
