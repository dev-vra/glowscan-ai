import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  AI_VISION_MODEL: z.string().default("anthropic/claude-sonnet-5.5"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_YEARLY: z.string().optional(),
  AFFILIATE_AMAZON_TAG: z.string().optional(),
  BILLING_BYPASS: z.stringbool().default(false),
  FEATURE_FLAGS: z.string().default(""), // lista separada por vírgula: sponsoredSlots,studyInvites,researchConsent
});

let cached: z.infer<typeof schema> | undefined;

// Validação preguiçosa: o build não exige segredos; a primeira requisição sim.
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}
