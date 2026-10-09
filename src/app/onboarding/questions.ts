export type Option = { value: string; label: string; hint?: string };
export type Question = { id: "skinType" | "concerns" | "ageRange" | "pregnantOrNursing"; title: string; subtitle: string; multi: boolean; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "skinType",
    title: "Como sua pele costuma ficar no fim do dia?",
    subtitle: "Pense em um dia comum, sem produtos novos.",
    multi: false,
    options: [
      { value: "dry", label: "Repuxando", hint: "Seca, às vezes descamando" },
      { value: "oily", label: "Brilhando por inteiro", hint: "Oleosa" },
      { value: "combination", label: "Brilho só na zona T", hint: "Mista" },
      { value: "normal", label: "Confortável", hint: "Normal" },
      { value: "sensitive", label: "Arde ou avermelha fácil", hint: "Sensível" },
    ],
  },
  {
    id: "concerns",
    title: "O que você mais quer melhorar?",
    subtitle: "Escolha até 3.",
    multi: true,
    options: [
      { value: "lines", label: "Linhas finas e firmeza" },
      { value: "spots", label: "Manchas e tom irregular" },
      { value: "pores", label: "Poros e textura" },
      { value: "blemishes", label: "Cravos e espinhas" },
      { value: "redness", label: "Vermelhidão" },
      { value: "dullness", label: "Viço e luminosidade" },
      { value: "dehydration", label: "Hidratação" },
    ],
  },
  {
    id: "ageRange",
    title: "Qual a sua faixa de idade?",
    subtitle: "A pele muda de necessidade com o tempo.",
    multi: false,
    options: ["18-24", "25-34", "35-44", "45-54", "55+"].map((v) => ({ value: v, label: v.replace("-", " a ") })),
  },
  {
    id: "pregnantOrNursing",
    title: "Você está gestante ou amamentando?",
    subtitle: "Alguns ativos pedem cautela nessa fase. Vamos sinalizar.",
    multi: false,
    options: [
      { value: "no", label: "Não" },
      { value: "yes", label: "Sim" },
    ],
  },
];
