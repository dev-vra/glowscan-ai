// Configura o Stripe para a marca Viço: renomeia o produto e garante os preços R$ 24,90/mês e R$ 199/ano.
// Idempotente: reaproveita preços pelos lookup_keys. Imprime as linhas para colar no .env.local.
// Uso: node --env-file=.env.local scripts/stripe-setup-vico.mjs
import Stripe from "stripe";

const PRICES = [
  { lookupKey: "vico_monthly", env: "STRIPE_PRICE_MONTHLY", amount: 2490, interval: "month", nickname: "Mensal R$ 24,90" },
  { lookupKey: "vico_yearly", env: "STRIPE_PRICE_YEARLY", amount: 19900, interval: "year", nickname: "Anual R$ 199" },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY ausente (rode com --env-file=.env.local)");
const stripe = new Stripe(key);

// Produto atual = o do preço mensal configurado hoje.
const current = await stripe.prices.retrieve(process.env.STRIPE_PRICE_MONTHLY);
const productId = typeof current.product === "string" ? current.product : current.product.id;
await stripe.products.update(productId, { name: "Viço Premium", description: "Análise da pele, rotina na ordem certa e evolução." });
console.log(`Produto ${productId} → "Viço Premium" (${key.startsWith("sk_live") ? "LIVE" : "teste"})`);

const existing = await stripe.prices.list({ lookup_keys: PRICES.map((p) => p.lookupKey), limit: 10 });
for (const p of PRICES) {
  let price = existing.data.find((x) => x.lookup_key === p.lookupKey && x.unit_amount === p.amount && x.active);
  price ??= await stripe.prices.create({
    product: productId,
    currency: "brl",
    unit_amount: p.amount,
    recurring: { interval: p.interval },
    lookup_key: p.lookupKey,
    transfer_lookup_key: true,
    nickname: p.nickname,
  });
  console.log(`${p.env}=${price.id}`);
}
