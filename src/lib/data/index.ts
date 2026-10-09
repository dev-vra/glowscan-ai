import "server-only";
import { cookies } from "next/headers";
import { fakeAnalyze } from "./fake-analysis";
import { store } from "./fake-store";
import { METRIC_LABELS, type FaceScan, type User } from "./types";

const SESSION_COOKIE = "gs_uid";
const MAX_IMAGE_CHARS = 4_000_000;

export async function getCurrentUser(): Promise<User | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? (store.users.get(id) ?? null) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function signInWithEmail(email: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = [...store.users.values()].find((u) => u.email === normalized);
  const user = existing ?? { id: crypto.randomUUID(), email: normalized };
  store.users.set(user.id, user);
  (await cookies()).set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return user;
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function hasFacialConsent(userId: string) {
  return store.consents.has(userId);
}

export async function grantFacialConsent(userId: string) {
  store.consents.set(userId, new Date());
}

export async function revokeFacialConsent(userId: string) {
  store.consents.delete(userId);
}

export async function createAndAnalyzeFaceScan(userId: string, imageDataUrl: string): Promise<FaceScan> {
  if (!(await hasFacialConsent(userId))) throw new Error("CONSENT_REQUIRED");
  if (!imageDataUrl.startsWith("data:image/") || imageDataUrl.length > MAX_IMAGE_CHARS) throw new Error("INVALID_IMAGE");

  const analysis = fakeAnalyze(imageDataUrl.slice(-2000));
  const scan: FaceScan = {
    id: crypto.randomUUID(),
    userId,
    imageUrl: imageDataUrl,
    takenAt: new Date(),
    status: "done",
    rejectReason: null,
    lightingQuality: analysis.lightingQuality,
    makeupDetected: false,
    overallScore: analysis.overallScore,
    summary: `Seu ponto de maior atenção hoje é ${METRIC_LABELS[analysis.weakestMetric].toLowerCase()}. Mantenha a consistência da rotina e refaça o scan em 7 dias com a mesma luz.`,
    metrics: analysis.metrics,
  };
  store.scans.set(scan.id, scan);
  return scan;
}

export async function getFaceScan(userId: string, scanId: string) {
  const scan = store.scans.get(scanId);
  return scan && scan.userId === userId ? scan : null;
}

export async function listFaceScans(userId: string) {
  return [...store.scans.values()]
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
}

export async function getPreviousScan(userId: string, scan: FaceScan) {
  return (await listFaceScans(userId)).find((s) => s.takenAt < scan.takenAt && s.status === "done") ?? null;
}
