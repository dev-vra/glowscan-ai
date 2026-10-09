// Base curada de ingredientes e regras de conflito. Fonte única: o seed grava no banco a partir daqui.
import type { IngredientFamily, Severity } from "@/generated/prisma/enums";

export type IngredientSeed = {
  inciName: string;
  aliases?: string[];
  family: IngredientFamily;
  photosensitizing?: boolean;
  pregnancyCaution?: boolean;
};

export const INGREDIENTS: IngredientSeed[] = [
  // Retinoides
  { inciName: "retinol", aliases: ["vitamin a", "vitamina a"], family: "retinoid", photosensitizing: true, pregnancyCaution: true },
  { inciName: "retinal", aliases: ["retinaldehyde", "retinaldeído"], family: "retinoid", photosensitizing: true, pregnancyCaution: true },
  { inciName: "retinyl palmitate", family: "retinoid", pregnancyCaution: true },
  { inciName: "retinyl retinoate", family: "retinoid", photosensitizing: true, pregnancyCaution: true },
  { inciName: "hydroxypinacolone retinoate", aliases: ["granactive retinoid"], family: "retinoid", pregnancyCaution: true },
  { inciName: "bakuchiol", family: "other" },
  // AHA / BHA / PHA
  { inciName: "glycolic acid", aliases: ["ácido glicólico"], family: "aha", photosensitizing: true },
  { inciName: "lactic acid", aliases: ["ácido lático"], family: "aha", photosensitizing: true },
  { inciName: "mandelic acid", aliases: ["ácido mandélico"], family: "aha", photosensitizing: true },
  { inciName: "malic acid", family: "aha" },
  { inciName: "tartaric acid", family: "aha" },
  { inciName: "salicylic acid", aliases: ["ácido salicílico", "beta hydroxy acid"], family: "bha", pregnancyCaution: true },
  { inciName: "betaine salicylate", family: "bha" },
  { inciName: "capryloyl salicylic acid", aliases: ["lha"], family: "bha" },
  { inciName: "gluconolactone", family: "pha" },
  { inciName: "lactobionic acid", family: "pha" },
  // Vitamina C
  { inciName: "ascorbic acid", aliases: ["l-ascorbic acid", "vitamin c", "vitamina c", "ácido ascórbico"], family: "vitamin_c" },
  { inciName: "ascorbyl glucoside", family: "vitamin_c" },
  { inciName: "sodium ascorbyl phosphate", family: "vitamin_c" },
  { inciName: "magnesium ascorbyl phosphate", family: "vitamin_c" },
  { inciName: "ascorbyl tetraisopalmitate", aliases: ["tetrahexyldecyl ascorbate"], family: "vitamin_c" },
  { inciName: "3-o-ethyl ascorbic acid", aliases: ["ethyl ascorbic acid"], family: "vitamin_c" },
  // Outros ativos
  { inciName: "niacinamide", aliases: ["vitamin b3", "nicotinamide", "niacinamida"], family: "niacinamide" },
  { inciName: "benzoyl peroxide", aliases: ["peróxido de benzoíla"], family: "benzoyl_peroxide" },
  { inciName: "azelaic acid", aliases: ["ácido azelaico"], family: "azelaic_acid" },
  { inciName: "potassium azeloyl diglycinate", family: "azelaic_acid" },
  { inciName: "copper tripeptide-1", aliases: ["ghk-cu"], family: "copper_peptide" },
  { inciName: "palmitoyl tripeptide-1", family: "peptide" },
  { inciName: "palmitoyl tetrapeptide-7", family: "peptide" },
  { inciName: "palmitoyl pentapeptide-4", aliases: ["matrixyl"], family: "peptide" },
  { inciName: "acetyl hexapeptide-8", aliases: ["argireline", "acetyl hexapeptide-3"], family: "peptide" },
  { inciName: "ceramide np", aliases: ["ceramide 3"], family: "ceramide" },
  { inciName: "ceramide ap", family: "ceramide" },
  { inciName: "ceramide eop", family: "ceramide" },
  { inciName: "sodium hyaluronate", aliases: ["hyaluronic acid", "ácido hialurônico"], family: "hyaluronic" },
  { inciName: "hydrolyzed hyaluronic acid", family: "hyaluronic" },
  { inciName: "hydroquinone", aliases: ["hidroquinona"], family: "other", photosensitizing: true, pregnancyCaution: true },
  { inciName: "tranexamic acid", aliases: ["ácido tranexâmico"], family: "other" },
  { inciName: "alpha-arbutin", aliases: ["arbutin"], family: "other" },
  { inciName: "kojic acid", family: "other" },
  { inciName: "panthenol", aliases: ["pro-vitamin b5"], family: "other" },
  { inciName: "centella asiatica extract", aliases: ["cica"], family: "other" },
  { inciName: "allantoin", family: "other" },
  { inciName: "squalane", family: "other" },
  { inciName: "glycerin", aliases: ["glicerina"], family: "other" },
  { inciName: "tocopherol", aliases: ["vitamin e"], family: "other" },
  // Filtros solares
  { inciName: "zinc oxide", family: "sunscreen_filter" },
  { inciName: "titanium dioxide", family: "sunscreen_filter" },
  { inciName: "ethylhexyl methoxycinnamate", aliases: ["octinoxate"], family: "sunscreen_filter" },
  { inciName: "bis-ethylhexyloxyphenol methoxyphenyl triazine", aliases: ["tinosorb s", "bemotrizinol"], family: "sunscreen_filter" },
  { inciName: "methylene bis-benzotriazolyl tetramethylbutylphenol", aliases: ["tinosorb m"], family: "sunscreen_filter" },
  { inciName: "butyl methoxydibenzoylmethane", aliases: ["avobenzone"], family: "sunscreen_filter" },
  { inciName: "ethylhexyl triazone", family: "sunscreen_filter" },
  { inciName: "diethylamino hydroxybenzoyl hexyl benzoate", aliases: ["uvinul a plus"], family: "sunscreen_filter" },
  { inciName: "octocrylene", family: "sunscreen_filter" },
  // Irritantes potenciais
  { inciName: "parfum", aliases: ["fragrance", "perfume", "fragrância"], family: "fragrance" },
  { inciName: "linalool", family: "fragrance" },
  { inciName: "limonene", family: "fragrance" },
  { inciName: "alcohol denat.", aliases: ["alcohol denat", "sd alcohol", "álcool"], family: "alcohol_drying" },
];

export type ConflictSeed = { a: IngredientFamily; b: IngredientFamily; severity: Severity; advice: string };

export const CONFLICTS: ConflictSeed[] = [
  { a: "retinoid", b: "benzoyl_peroxide", severity: "critical", advice: "O peróxido de benzoíla pode degradar o retinoide e somar irritação. Use em noites diferentes ou um de manhã e outro à noite." },
  { a: "retinoid", b: "aha", severity: "warn", advice: "Retinoide e AHA na mesma noite aumentam o risco de irritação e de comprometer a barreira. Alterne as noites." },
  { a: "retinoid", b: "bha", severity: "warn", advice: "Retinoide e ácido salicílico juntos tendem a ressecar e irritar. Alterne as noites." },
  { a: "retinoid", b: "vitamin_c", severity: "info", advice: "Funcionam melhor separados: vitamina C de manhã, retinoide à noite." },
  { a: "aha", b: "bha", severity: "info", advice: "Dois esfoliantes químicos no mesmo momento podem sensibilizar. Prefira um por vez." },
  { a: "aha", b: "vitamin_c", severity: "info", advice: "Ácidos podem alterar a estabilidade da vitamina C e somar ardência. Separe manhã e noite." },
  { a: "bha", b: "vitamin_c", severity: "info", advice: "Separe a vitamina C (manhã) do ácido salicílico (noite) para menos irritação." },
  { a: "benzoyl_peroxide", b: "vitamin_c", severity: "warn", advice: "O peróxido de benzoíla oxida a vitamina C. Use em momentos diferentes do dia." },
  { a: "copper_peptide", b: "vitamin_c", severity: "warn", advice: "Peptídeo de cobre e vitamina C se anulam parcialmente. Use em períodos diferentes." },
  { a: "copper_peptide", b: "aha", severity: "warn", advice: "O pH baixo dos AHAs pode desestabilizar o peptídeo de cobre. Use em noites diferentes." },
  { a: "copper_peptide", b: "bha", severity: "warn", advice: "O pH baixo do BHA pode desestabilizar o peptídeo de cobre. Use em noites diferentes." },
  { a: "copper_peptide", b: "retinoid", severity: "info", advice: "Podem irritar juntos em peles sensíveis. Comece alternando as noites." },
];

export function orderedPair(a: IngredientFamily, b: IngredientFamily): [IngredientFamily, IngredientFamily] {
  return a <= b ? [a, b] : [b, a];
}

export function normalizeInci(raw: string) {
  return raw
    .toLowerCase()
    .replace(/\(and\)|\[\+\/-\]|\+\/-|may contain.*$/g, "")
    .replace(/\d+([.,]\d+)?\s*%/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[*•\-\s]+|[*.\s]+$/g, "");
}

const lookup = new Map<string, IngredientSeed>();
for (const ingredient of INGREDIENTS) {
  lookup.set(ingredient.inciName, ingredient);
  ingredient.aliases?.forEach((alias) => lookup.set(alias, ingredient));
}

export function findCatalogIngredient(raw: string) {
  return lookup.get(normalizeInci(raw)) ?? null;
}
