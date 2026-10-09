import "server-only";
import { env } from "@/lib/env";

// Recursos da fase 2: prontos no código, desligados até entrarem em FEATURE_FLAGS.
export type Flag = "sponsoredSlots" | "studyInvites" | "researchConsent";

export function isEnabled(flag: Flag) {
  return env().FEATURE_FLAGS.split(",").map((f) => f.trim()).includes(flag);
}
