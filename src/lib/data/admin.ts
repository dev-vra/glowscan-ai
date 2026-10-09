import "server-only";
import { randomBytes } from "node:crypto";
import { BETA_CUSTOMER_PREFIX } from "@/lib/billing";
import type { SubscriptionStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { createAuthUser, setAuthPassword } from "@/lib/supabase";

const PASSWORD_BYTES = 9; // 12 caracteres base64url
const BETA_PLAN = "beta";
const PAID: SubscriptionStatus[] = ["active", "trialing"];

export function isAdmin(email: string) {
  return env().ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}

const newPassword = () => randomBytes(PASSWORD_BYTES).toString("base64url");

export async function listTesters() {
  const users = await db().user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, createdAt: true,
      subscription: { select: { status: true, plan: true, stripeCustomerId: true } },
      _count: { select: { scans: true, products: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    createdAt: u.createdAt,
    scans: u._count.scans,
    products: u._count.products,
    access: !u.subscription ? "none"
      : u.subscription.plan === BETA_PLAN ? (u.subscription.status === "active" ? "beta" : "beta_off")
      : PAID.includes(u.subscription.status) ? "paid" : "none",
  }));
}

export type Tester = Awaited<ReturnType<typeof listTesters>>[number];

// Liga/desliga acesso grátis (plano "beta"). Nunca mexe em assinatura paga ativa;
// ex-cliente Stripe mantém o customer, então pode assinar de verdade depois.
export async function setBetaAccess(userId: string, on: boolean) {
  const sub = await db().subscription.findUnique({ where: { userId } });
  if (sub && sub.plan !== BETA_PLAN && PAID.includes(sub.status)) throw new Error("PAID_SUBSCRIPTION");
  await db().subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: `${BETA_CUSTOMER_PREFIX}${userId}`, status: on ? "active" : "canceled", plan: BETA_PLAN },
    update: { status: on ? "active" : "canceled", plan: BETA_PLAN },
  });
}

// Cria login com senha (sem e-mail de confirmação) e já libera o acesso beta. Senha volta uma vez só.
export async function createTester(email: string) {
  const password = newPassword();
  const id = await createAuthUser(email, password);
  await db().user.upsert({ where: { id }, create: { id, email }, update: {} });
  await setBetaAccess(id, true);
  return { email, password };
}

export async function resetTesterPassword(userId: string) {
  const user = await db().user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
  const password = newPassword();
  await setAuthPassword(userId, password);
  return { email: user.email, password };
}
