// Viço — microcopy oficial (PT-BR). Voz: "você", frases curtas, porquê em 1 linha, sem diagnóstico, sem promessa clínica.
// Substitui textos atuais em face-camera.tsx, labels.ts, page.tsx etc.

export const SCAN_COPY = {
  starting: "Abrindo a câmera…",
  ready: "Tudo certo. Fica parada 3 segundos.",
  lowLight: { title: "Tá escuro aqui.", body: "Vira de frente pra uma janela — luz natural lê melhor a pele." },
  highLight: { title: "Luz forte demais.", body: "Sai do sol direto e desliga o flash." },
  makeup: { title: "Parece ter base ou filtro.", body: "Sem eles, a leitura fica fiel à sua pele.", override: "Tô sem maquiagem, analisar" },
  outOfFrame: { title: "Encaixa o rosto no oval.", body: "Chega um pouco mais perto e olha reto." },
  chips: { light: "Luz boa", lightBad: "Pouca luz", frame: "Rosto no oval", frameBad: "Fora do oval", filter: "Sem filtro", filterBad: "Base ou filtro" },
  cta: "Analisar agora", ctaWaitingLight: "Esperando a luz…", ctaFraming: "Enquadrando…", gallery: "Enviar da galeria",
  reading: { title: "Lendo sua pele…", sub: "Leva uns 10 segundos.", steps: ["Textura e poros", "Oleosidade e hidratação", "Manchas e vermelhidão", "Montando seu resumo"] },
  rejected: { title: "Essa foto não deu pra ler.", body: "Não contou como análise — tenta de novo agora.", tipsTitle: "Pra acertar de primeira", tips: ["De frente pra janela, sem sol direto", "Cabelo preso, rosto inteiro no oval", "Sem base e sem filtro"], cta: "Tentar de novo" },
  denied: { title: "A câmera está bloqueada.", body: "Libere nas configurações do navegador, ou envie uma selfie da galeria." },
  unavailable: { title: "Câmera indisponível neste aparelho.", body: "Envie uma selfie da galeria." },
};

export const RESULT_COPY = {
  of100: "de 100",
  deltaUp: (n: number, date: string) => `▲ ${n} pontos desde ${date}`,
  deltaDown: (n: number, date: string) => `▼ ${n} pontos desde ${date}`,
  firstTitle: "Seu ponto de partida",
  firstCompare: "Daqui a 7 dias a gente compara. É aí que fica bom.",
  focus: "foco",
  professional: { title: "Vale um olhar profissional", body: "Isso não é diagnóstico — só um dermatologista avalia.", cta: "Encontrar dermatologista", after: "O resto da análise segue normal. Sua rotina continua valendo." },
  disclaimer: "Análise cosmética, não é diagnóstico médico.",
  share: "Compartilhar",
};

export const SEVERITY_LABELS = { info: "Dica", warn: "Atenção", critical: "Importante" } as const;
export const RESOLVED_LABEL = "Resolvido na agenda";

export const ROUTINE_COPY = {
  title: "Rotina", closet: (n: number) => `Meu armário (${n})`, am: "Manhã", pm: "Noite", restNight: "noite de descanso",
  empty: { title: "Sem rotina ainda", body: "Fotografe os rótulos do seu armário. A gente monta a ordem da manhã e da noite.", cta: "Adicionar produto" },
  suggestion: "Nossa sugestão", apply: "Aplicar na rotina", keep: "Manter como está",
  noSpf: "Sua rotina da manhã fica completa com um protetor solar como último passo.",
};

export const TODAY_COPY = {
  greeting: (h: number, name: string) => `${h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"}, ${name}`,
  streak: (n: number) => `${n} dias`,
  nextScan: (d: number) => (d === 0 ? "Dia de análise" : `Próxima análise em ${d} dia${d > 1 ? "s" : ""}`),
  done: (period: "am" | "pm") => (period === "am" ? "Manhã feita" : "Noite feita"),
  streakLong: (n: number) => `${n} dias seguidos`,
  best: "Sua melhor sequência até agora.",
  checkIn: "Como a pele tá hoje?", feelings: ["Irritada", "Incômoda", "Ok", "Bem", "Radiante"], noticed: "Notou algo? (opcional)", register: "Registrar",
  firstTitle: "Vamos conhecer sua pele", firstBody: "Menos de um minuto. Luz natural, rosto sem maquiagem.", firstCta: "Fazer primeira análise",
};

export const NOTIFICATIONS = {
  am: "Manhã: {n} passos. Protetor é obrigatório hoje — ontem teve retinol.",
  scanDay: "Dia de análise. Mesma janela da semana passada deixa a comparação justa.",
  uv: "UV {uv} em {city} hoje. Reaplica o protetor depois do almoço.",
  pmRetinol: "Hoje à noite tem retinol. Ervilha pro rosto todo, nada mais.",
};

export const BILLING_COPY = {
  trialHeadline: "7 dias grátis pra ver sua pele mudar.", trialSub: "Cancele quando quiser. Avisamos 2 dias antes de cobrar.",
  annual: { label: "Anual", price: "R$ 199", perMonth: "R$ 16,58/mês", badge: "Economize 33%" },
  monthly: { label: "Mensal", price: "R$ 24,90" },
  cta: "Começar teste grátis",
  trialEnding: (d: number, price: string) => `Seu teste acaba em ${d} dias`,
  paymentFailed: "O pagamento não passou",
  cancelTitle: "Cancelar é simples.",
};

// Proibido em qualquer texto: "diagnóstico" (exceto negando), "doença", "tratamento", "grau", "cura", "elimina", prazos de resultado ("em 7 dias").
