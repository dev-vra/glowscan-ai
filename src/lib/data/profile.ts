import "server-only";
import { db } from "@/lib/db";
import type { SkinType } from "@/generated/prisma/enums";

export type ProfileInput = {
  skinType: SkinType;
  concerns: string[];
  ageRange: string;
  pregnantOrNursing: boolean;
  city: string | null;
};

export async function getSkinProfile(userId: string) {
  return db().skinProfile.findUnique({ where: { userId } });
}

export async function saveSkinProfile(userId: string, input: ProfileInput) {
  await db().skinProfile.upsert({ where: { userId }, create: { userId, ...input }, update: input });
}
