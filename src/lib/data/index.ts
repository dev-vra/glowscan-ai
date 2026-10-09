import "server-only";
import { analyzeFaceImage, FACE_PROMPT_VERSION } from "@/lib/ai/analyze-face";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { deleteAuthUser, deleteUserPhotos, signedPhotoUrl, supabaseAuth, uploadPhoto } from "@/lib/supabase";
import type { FaceScan as FaceScanRow, ScanMetric as ScanMetricRow } from "@/generated/prisma/client";
import type { ConsentKind } from "@/generated/prisma/enums";
import type { FaceScan, MetricResult, SkinMetric, User } from "./types";

const MAX_IMAGE_BYTES = 3_500_000;
const DAILY_SCAN_LIMIT = 10;
const DAY_MS = 86_400_000;
const ACTIVE_SUBSCRIPTION: readonly string[] = ["trialing", "active"];

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await supabaseAuth();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;
  const { id, email } = data.user;
  await db().user.upsert({ where: { id }, create: { id, email }, update: {} });
  return { id, email };
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function sendMagicLink(email: string, redirectTo: string) {
  const supabase = await supabaseAuth();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) throw new Error(`MAGIC_LINK_FAILED: ${error.message}`);
}

export async function startGoogleSignIn(redirectTo: string) {
  const supabase = await supabaseAuth();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error || !data.url) throw new Error("OAUTH_FAILED");
  return data.url;
}

export async function exchangeAuthCode(code: string) {
  const supabase = await supabaseAuth();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return !error;
}

export async function signOut() {
  const supabase = await supabaseAuth();
  await supabase.auth.signOut({ scope: "global" });
}

export async function deleteAccount(userId: string) {
  await deleteUserPhotos(userId);
  await deleteAuthUser(userId); // FK com cascade apaga todas as linhas do usuário
}

export async function hasConsent(userId: string, kind: ConsentKind) {
  const consent = await db().consent.findFirst({ where: { userId, kind, revokedAt: null } });
  return consent !== null;
}

export async function grantConsent(userId: string, kind: ConsentKind) {
  if (await hasConsent(userId, kind)) return;
  await db().consent.create({ data: { userId, kind } });
}

export async function revokeConsent(userId: string, kind: ConsentKind) {
  await db().consent.updateMany({ where: { userId, kind, revokedAt: null }, data: { revokedAt: new Date() } });
}

export const hasFacialConsent = (userId: string) => hasConsent(userId, "facial_photo");
export const grantFacialConsent = (userId: string) => grantConsent(userId, "facial_photo");
export const revokeFacialConsent = (userId: string) => revokeConsent(userId, "facial_photo");

export async function hasActiveSubscription(userId: string) {
  // Atalho só para desenvolvimento local sem Stripe; ignorado em produção.
  if (env().BILLING_BYPASS && process.env.NODE_ENV !== "production") return true;
  const sub = await db().subscription.findUnique({ where: { userId } });
  return sub !== null && ACTIVE_SUBSCRIPTION.includes(sub.status);
}

export function decodeJpegDataUrl(dataUrl: string) {
  const match = /^data:image\/jpeg;base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("INVALID_IMAGE");
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("INVALID_IMAGE");
  return bytes;
}

export async function createAndAnalyzeFaceScan(userId: string, imageDataUrl: string): Promise<FaceScan> {
  if (!(await hasFacialConsent(userId))) throw new Error("CONSENT_REQUIRED");
  if (!(await hasActiveSubscription(userId))) throw new Error("SUBSCRIPTION_REQUIRED");
  const recent = await db().faceScan.count({ where: { userId, takenAt: { gte: new Date(Date.now() - DAY_MS) } } });
  if (recent >= DAILY_SCAN_LIMIT) throw new Error("RATE_LIMITED");

  const bytes = decodeJpegDataUrl(imageDataUrl);
  const scanId = crypto.randomUUID();
  const imagePath = `${userId}/face-${scanId}.jpg`;
  await uploadPhoto(imagePath, bytes, "image/jpeg");
  await db().faceScan.create({ data: { id: scanId, userId, imagePath, status: "pending", modelVersion: FACE_PROMPT_VERSION } });

  const analysis = await analyzeFaceImage(bytes);
  if (!analysis.usable) {
    await db().faceScan.update({
      where: { id: scanId },
      data: { status: "rejected", rejectReason: analysis.rejectReason, lightingQuality: analysis.lightingQuality },
    });
  } else {
    const entries = Object.entries(analysis.metrics) as [SkinMetric, { score: number; zones: Record<string, number> }][];
    const overallScore = Math.round(entries.reduce((sum, [, m]) => sum + m.score, 0) / entries.length);
    await db().faceScan.update({
      where: { id: scanId },
      data: {
        status: "done",
        lightingQuality: analysis.lightingQuality,
        makeupDetected: analysis.makeupDetected,
        overallScore,
        summary: analysis.summary,
        metrics: { create: entries.map(([metric, m]) => ({ metric, score: m.score, zones: m.zones })) },
      },
    });
  }
  const scan = await getFaceScan(userId, scanId);
  if (!scan) throw new Error("SCAN_NOT_FOUND");
  return scan;
}

async function toFaceScan(row: FaceScanRow & { metrics: ScanMetricRow[] }): Promise<FaceScan> {
  return {
    id: row.id,
    userId: row.userId,
    imageUrl: await signedPhotoUrl(row.imagePath),
    takenAt: row.takenAt,
    status: row.status,
    rejectReason: row.rejectReason,
    lightingQuality: row.lightingQuality,
    makeupDetected: row.makeupDetected,
    overallScore: row.overallScore,
    summary: row.summary,
    metrics: row.metrics.map<MetricResult>((m) => ({ metric: m.metric, score: m.score, zones: m.zones as Record<string, number> })),
  };
}

export async function getFaceScan(userId: string, scanId: string) {
  const row = await db().faceScan.findFirst({ where: { id: scanId, userId }, include: { metrics: true } });
  return row ? toFaceScan(row) : null;
}

export async function listFaceScans(userId: string) {
  const rows = await db().faceScan.findMany({ where: { userId }, include: { metrics: true }, orderBy: { takenAt: "desc" } });
  return Promise.all(rows.map(toFaceScan));
}

export async function getPreviousScan(userId: string, scan: FaceScan) {
  const row = await db().faceScan.findFirst({
    where: { userId, status: "done", takenAt: { lt: scan.takenAt } },
    include: { metrics: true },
    orderBy: { takenAt: "desc" },
  });
  return row ? toFaceScan(row) : null;
}
