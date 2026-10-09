"use server";

import { redirect } from "next/navigation";
import { createAndAnalyzeFaceScan, requireUser } from "@/lib/data";

export type ScanState = { error: string | null };

export async function submitFaceScanAction(imageDataUrl: string): Promise<ScanState> {
  const user = await requireUser();
  let scanId: string;
  try {
    scanId = (await createAndAnalyzeFaceScan(user.id, imageDataUrl)).id;
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "CONSENT_REQUIRED") redirect("/app/consentimento");
    if (code === "SUBSCRIPTION_REQUIRED") redirect("/assinar");
    if (code === "RATE_LIMITED") return { error: "Você atingiu o limite de análises de hoje. Volte amanhã." };
    return { error: "Não conseguimos analisar esta foto. Tente de novo com mais luz." };
  }
  redirect(`/app/scan/${scanId}`);
}
