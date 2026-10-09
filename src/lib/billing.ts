import "server-only";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export type Plan = "monthly" | "yearly";
const TRIAL_DAYS = 3;

let client: Stripe | undefined;
export function stripe() {
  client ??= new Stripe(env().STRIPE_SECRET_KEY);
  return client;
}

function priceFor(plan: Plan) {
  return plan === "yearly" ? env().STRIPE_PRICE_YEARLY : env().STRIPE_PRICE_MONTHLY;
}

async function ensureCustomer(userId: string, email: string) {
  const existing = await db().subscription.findUnique({ where: { userId } });
  if (existing) return existing.stripeCustomerId;
  const customer = await stripe().customers.create({ email, metadata: { userId } });
  await db().subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id, status: "canceled", plan: "monthly" },
    update: {},
  });
  return customer.id;
}

export async function createCheckoutUrl(userId: string, email: string, plan: Plan) {
  const customer = await ensureCustomer(userId, email);
  const hadTrial = (await db().subscription.findUnique({ where: { userId } }))?.stripeSubscriptionId != null;
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: userId,
    line_items: [{ price: priceFor(plan), quantity: 1 }],
    subscription_data: { metadata: { userId, plan }, ...(hadTrial ? {} : { trial_period_days: TRIAL_DAYS }) },
    payment_method_collection: "always",
    allow_promotion_codes: true,
    locale: "pt-BR",
    success_url: `${env().NEXT_PUBLIC_SITE_URL}/app?assinatura=ok`,
    cancel_url: `${env().NEXT_PUBLIC_SITE_URL}/assinar`,
  });
  if (!session.url) throw new Error("CHECKOUT_FAILED");
  return session.url;
}

export async function createPortalUrl(userId: string) {
  const sub = await db().subscription.findUnique({ where: { userId } });
  if (!sub) return null;
  const portal = await stripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${env().NEXT_PUBLIC_SITE_URL}/app/perfil`,
  });
  return portal.url;
}

const STATUS_MAP: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete_expired: "canceled",
};

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const status = STATUS_MAP[subscription.status];
  if (!status) return;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  await db().subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription.id,
      status,
      plan: subscription.metadata.plan === "yearly" ? "yearly" : "monthly",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

const HANDLED = new Set(["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.payment_failed"]);

export async function handleStripeWebhook(rawBody: string, signature: string) {
  const event = stripe().webhooks.constructEvent(rawBody, signature, env().STRIPE_WEBHOOK_SECRET);
  if (!HANDLED.has(event.type)) return;

  // Idempotência: Stripe reenvia eventos; o id vira PK e a segunda inserção falha.
  const inserted = await db().stripeEvent.createMany({ data: [{ id: event.id, type: event.type }], skipDuplicates: true });
  if (inserted.count === 0) return;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (typeof session.subscription === "string") await syncSubscription(await stripe().subscriptions.retrieve(session.subscription));
    } else if (event.type === "invoice.payment_failed") {
      const subRef = event.data.object.parent?.subscription_details?.subscription;
      const subId = typeof subRef === "string" ? subRef : subRef?.id;
      if (subId) await syncSubscription(await stripe().subscriptions.retrieve(subId));
    } else {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    await db().stripeEvent.delete({ where: { id: event.id } }); // libera retry do Stripe
    throw error;
  }
}
