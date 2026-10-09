import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";

const CATEGORIES = ["cleanser", "toner", "essence", "serum", "treatment", "eye", "moisturizer", "oil", "spf", "mask", "exfoliant", "other"] as const;

const labelSchema = z.object({
  readable: z.boolean().describe("false se não for um rótulo de cosmético legível"),
  brand: z.string(),
  name: z.string(),
  category: z.enum(CATEGORIES),
  inci: z.array(z.string()).describe("lista INCI na ordem do rótulo, um ingrediente por item, sem porcentagens"),
  confidence: z.number().min(0).max(1),
});

export type LabelExtraction = z.infer<typeof labelSchema>;

const SYSTEM = `Você lê rótulos de cosméticos (frente ou verso, em qualquer idioma). Extraia marca, nome do produto, categoria e a lista INCI exatamente na ordem impressa.
Não invente ingredientes: se a lista não estiver visível, retorne inci vazio e confidence baixa. Nomes INCI em inglês padrão.`;

export async function extractLabel(image: Buffer): Promise<LabelExtraction> {
  const { output } = await generateText({
    model: env().AI_VISION_MODEL,
    system: SYSTEM,
    output: Output.object({ schema: labelSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Leia este rótulo." },
          { type: "file", mediaType: "image/jpeg", data: image.toString("base64") },
        ],
      },
    ],
  });
  return output;
}
