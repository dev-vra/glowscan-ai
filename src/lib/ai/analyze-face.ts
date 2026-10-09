import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";
import { FACE_ZONES } from "@/lib/data/types";

// Prompt versionado: mudar o texto exige subir a versão (métricas só são comparáveis na mesma versão).
export const FACE_PROMPT_VERSION = "face-v1";

const score = z.number().int().min(0).max(100);
const zones = z.object(Object.fromEntries(FACE_ZONES.map((zone) => [zone, score])) as Record<(typeof FACE_ZONES)[number], typeof score>);
const metric = z.object({ score, zones });

const faceAnalysisSchema = z.object({
  usable: z.boolean().describe("false se não houver um rosto humano frontal nítido e bem iluminado"),
  rejectReason: z.string().nullable().describe("motivo curto em PT-BR quando usable=false"),
  lightingQuality: score,
  makeupDetected: z.boolean(),
  metrics: z.object({
    texture: metric,
    redness: metric,
    pores: metric,
    fine_lines: metric,
    spots: metric,
    oiliness: metric,
    hydration: metric,
  }),
  summary: z.string().describe("2 frases em PT-BR, tom cosmético, sem diagnóstico, sem citar doenças ou medicamentos"),
});

export type FaceAnalysis = z.infer<typeof faceAnalysisSchema>;

const SYSTEM = `Você é um analisador estético de pele para um app de skincare. Avalie APENAS aparência visível, nunca diagnostique condições médicas (acne grau, rosácea, melasma, dermatite, lesões) e nunca recomende medicamentos.
Pontue cada métrica de 0 a 100, onde 100 = melhor aparência (ex.: redness 100 = sem vermelhidão; pores 100 = poros pouco visíveis; oiliness 100 = oleosidade equilibrada; hydration 100 = aspecto bem hidratado).
Pontue também por zona: ${FACE_ZONES.join(", ")}.
Seja consistente: mesma pele em condições similares deve ter notas similares. Se a foto não servir (sem rosto, desfocada, escura, de perfil, filtro pesado), marque usable=false.`;

export async function analyzeFaceImage(image: Buffer): Promise<FaceAnalysis> {
  const { output } = await generateText({
    model: env().AI_VISION_MODEL,
    system: SYSTEM,
    output: Output.object({ schema: faceAnalysisSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analise a pele desta foto." },
          { type: "file", mediaType: "image/jpeg", data: image.toString("base64") },
        ],
      },
    ],
  });
  return output;
}
