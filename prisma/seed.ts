// Seed idempotente: catálogo de ingredientes e regras de conflito. Re-executável (upsert).
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CONFLICTS, INGREDIENTS, orderedPair } from "../src/lib/routine/catalog";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL ou DATABASE_URL não definida");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  for (const ingredient of INGREDIENTS) {
    const data = {
      aliases: ingredient.aliases ?? [],
      family: ingredient.family,
      photosensitizing: ingredient.photosensitizing ?? false,
      pregnancyCaution: ingredient.pregnancyCaution ?? false,
    };
    await prisma.ingredient.upsert({ where: { inciName: ingredient.inciName }, create: { inciName: ingredient.inciName, ...data }, update: data });
  }
  for (const rule of CONFLICTS) {
    const [familyA, familyB] = orderedPair(rule.a, rule.b);
    await prisma.conflictRule.upsert({
      where: { familyA_familyB: { familyA, familyB } },
      create: { familyA, familyB, severity: rule.severity, advice: rule.advice },
      update: { severity: rule.severity, advice: rule.advice },
    });
  }
  console.log(`seed ok: ${INGREDIENTS.length} ingredientes, ${CONFLICTS.length} regras`);
}

main().finally(() => prisma.$disconnect());
