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
    return { error: "Não conseguimos analisar esta foto. Tente de novo com mais luz." };
  }
  redirect(`/app/scan/${scanId}`);
}
