import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { env } from "@/lib/env";

const GOOGLE_PREFIX = "google/";

// Com chave própria do Google, modelos "google/..." vão direto na API do Gemini; o resto segue pelo AI Gateway.
export function visionModel(): LanguageModel {
  const { AI_VISION_MODEL: model, GOOGLE_GENERATIVE_AI_API_KEY: apiKey } = env();
  if (apiKey && model.startsWith(GOOGLE_PREFIX)) {
    return createGoogleGenerativeAI({ apiKey })(model.slice(GOOGLE_PREFIX.length));
  }
  return model;
}
