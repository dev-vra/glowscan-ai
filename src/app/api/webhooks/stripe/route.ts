import { handleStripeWebhook } from "@/lib/billing";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });
  try {
    await handleStripeWebhook(await request.text(), signature);
  } catch (error) {
    const isSignature = error instanceof Error && error.name === "StripeSignatureVerificationError";
    return new Response(isSignature ? "invalid signature" : "handler error", { status: isSignature ? 400 : 500 });
  }
  return new Response("ok");
}
