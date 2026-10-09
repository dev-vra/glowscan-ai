import Link from "next/link";
import { Camera, Check, Download, ListOrdered, ScanFace, Share2, Smartphone, Sun, TrendingUp, Zap } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { MetricBar } from "@/components/ui/metric-bar";
import { ScoreRing } from "@/components/ui/score-ring";
import { BILLING_COPY } from "@/lib/copy";

const PROBLEMS = [
  { title: "App de selfie não sabe o que você passa no rosto.", text: "Dá uma nota e para por aí." },
  { title: "App de rótulo não vê a sua pele.", text: "Diz o que tem no frasco, não se está funcionando em você." },
  { title: "Cada foto, um resultado diferente.", text: "Com luz ruim, a leitura não serve pra comparar nada." },
];

const STEPS = [
  { icon: ScanFace, title: "Selfie", text: "Skin Score de 0 a 100 e 7 métricas, com luz guiada pela câmera." },
  { icon: Camera, title: "Rótulos", text: "Foto do verso do frasco. A gente lê cada ingrediente, inclusive de farmácia brasileira." },
  { icon: ListOrdered, title: "Rotina", text: "Manhã e noite na ordem certa, com aviso do que não combina." },
];

const FEATURES = [
  { icon: Sun, title: "Câmera com guia de luz", text: "Só tira a foto quando luz e enquadramento estão bons. Menos foto perdida, comparação mais justa." },
  { icon: Zap, title: "Conflito corrigido em um toque", text: "Retinol e ácido na mesma noite? A gente mostra e aplica a troca na sua rotina." },
  { icon: TrendingUp, title: "Evolução de verdade", text: "Gráfico por métrica e antes/depois arrastável, semana a semana." },
  { icon: Share2, title: "Card pra compartilhar", text: "Seu resultado em um card pros stories, sem mostrar seu rosto." },
];

const FAQ = [
  { q: "É diagnóstico?", a: "Não. O Viço faz análise cosmética da aparência da pele. Pra qualquer condição, procure um dermatologista — e o app avisa quando vale um olhar profissional." },
  { q: "O que acontece com as minhas fotos?", a: "Ficam em armazenamento privado, só você acessa, servem só pra sua análise e nunca treinam IA. Você apaga tudo em Perfil." },
  { q: "Funciona com produto brasileiro?", a: "Sim. A leitura é feita pela lista de ingredientes (INCI) do rótulo, então vale pra qualquer marca." },
  { q: "Como eu cancelo?", a: "Em Perfil → Gerenciar assinatura, em um toque. A gente avisa antes do fim do teste." },
  { q: "Serve pra todo tipo de pele?", a: "É pra isso que existe o beta: estamos testando com todos os fototipos. Se a leitura parecer estranha, conta pra gente." },
];

const EXAMPLE_METRICS = [
  { label: "Textura", score: 78, delta: 4 },
  { label: "Hidratação", score: 71, delta: 6 },
  { label: "Manchas", score: 58, delta: 2 },
];

const APK_URL = "/download/vico.apk";

function AppDownload({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={APK_URL} download className={buttonClasses(tone === "dark" ? "dark" : "secondary", "lg", "sm:w-auto")}>
        <Download className="size-5" aria-hidden /> Baixar para Android
      </a>
      <Link href="/entrar" className={buttonClasses("ghost", "lg", tone === "dark" ? "text-on-accent hover:bg-white/10 sm:w-auto" : "sm:w-auto")}>
        <Smartphone className="size-5" aria-hidden /> iPhone: use pelo navegador
      </Link>
    </div>
  );
}

function Cta({ className }: { className?: string }) {
  return (
    <Link href="/entrar" className={buttonClasses("primary", "lg", className)}>Começar 7 dias grátis</Link>
  );
}

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-content px-5 pb-16 lg:max-w-wide">
      <nav className="flex items-center justify-between py-6">
        <span className="font-display text-[32px] font-extrabold tracking-[-0.05em] text-accent">viço</span>
        <Link href="/entrar" className={buttonClasses("ghost", "sm")}>Entrar</Link>
      </nav>

      <section className="grid items-center gap-10 py-8 lg:grid-cols-2 lg:py-16">
        <div className="space-y-5">
          <h1 className="font-display text-[44px] leading-[46px] font-extrabold tracking-[-0.035em] lg:text-[60px] lg:leading-[60px]">
            Descubra se o seu skincare está funcionando.
          </h1>
          <p className="text-lg text-muted">
            Uma selfie lê sua pele. Uma foto do rótulo lê seus produtos. O Viço junta os dois e mostra a evolução.
          </p>
          <Cta className="lg:w-auto" />
          <AppDownload />
          <p className="text-sm text-muted">{BILLING_COPY.trialSub} App para iPhone em breve na App Store.</p>
        </div>
        <figure className="space-y-4 rounded-[28px] bg-surface-raised p-6" aria-label="Exemplo de resultado">
          <div className="flex items-center gap-5">
            <ScoreRing score={72} size="md" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.04em] text-muted">Exemplo</p>
              <p className="font-bold">▲ 8 pontos em 30 dias</p>
              <p className="text-sm text-muted">Rotina com vitamina C de manhã e retinol 3x por semana.</p>
            </div>
          </div>
          <div>
            {EXAMPLE_METRICS.map((m, i) => <MetricBar key={m.label} index={i} {...m} />)}
          </div>
        </figure>
      </section>

      <section aria-labelledby="problema" className="space-y-5 py-12">
        <Eyebrow id="problema">O problema</Eyebrow>
        <h2 className="font-display text-[30px] leading-9">Você compra, passa, e não sabe se está adiantando.</h2>
        <ul className="grid gap-3 lg:grid-cols-3">
          {PROBLEMS.map((p) => (
            <li key={p.title} className="space-y-1 rounded-[24px] bg-surface p-5">
              <p className="font-bold">{p.title}</p>
              <p className="text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como" className="space-y-5 py-12">
        <Eyebrow id="como">Como funciona</Eyebrow>
        <ol className="grid gap-3 lg:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4 rounded-[24px] bg-surface-raised p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-accent-soft text-accent"><Icon className="size-5" strokeWidth={2} aria-hidden /></span>
              <span>
                <span className="block font-bold">{i + 1}. {title}</span>
                <span className="text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="recursos" className="space-y-5 py-12">
        <Eyebrow id="recursos">O que muda</Eyebrow>
        <ul className="grid gap-3 lg:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="space-y-2 rounded-[24px] bg-surface-raised p-5">
              <Icon className="size-6 text-accent" strokeWidth={2} aria-hidden />
              <p className="font-bold">{title}</p>
              <p className="text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="preco" className="space-y-5 py-12">
        <Eyebrow id="preco">Preço</Eyebrow>
        <h2 className="font-display text-[30px] leading-9">{BILLING_COPY.trialHeadline}</h2>
        <div className="grid gap-3 lg:max-w-2xl lg:grid-cols-2">
          <div className="relative space-y-1 rounded-[20px] border-[2.5px] border-accent bg-surface-raised p-5">
            <span className="absolute -top-3 right-4 rounded-pill bg-accent px-3 py-1 text-xs font-bold text-on-accent">{BILLING_COPY.annual.badge}</span>
            <p className="font-bold">{BILLING_COPY.annual.label}</p>
            <p className="font-display text-[32px]">{BILLING_COPY.annual.price}</p>
            <p className="text-sm text-muted">{BILLING_COPY.annual.perMonth}</p>
          </div>
          <div className="space-y-1 rounded-[20px] border-[1.5px] border-[#E2D5CA] bg-surface-raised p-5">
            <p className="font-bold">{BILLING_COPY.monthly.label}</p>
            <p className="font-display text-[32px]">{BILLING_COPY.monthly.price}</p>
            <p className="text-sm text-muted">por mês</p>
          </div>
        </div>
        <ul className="space-y-2">
          {["7 dias grátis", "Cancelamento em um toque", "Aviso antes de cobrar"].map((t) => (
            <li key={t} className="flex items-center gap-2"><Check className="size-5 text-success" strokeWidth={2.5} aria-hidden /> {t}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="space-y-5 py-12">
        <Eyebrow id="faq">Perguntas</Eyebrow>
        <div className="divide-y divide-[#F1E7DE] rounded-[24px] bg-surface-raised px-5">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center font-bold">{q}</summary>
              <p className="pb-4 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[28px] bg-accent p-8 text-on-accent lg:p-12">
        <h2 className="font-display text-[34px] leading-10">Sua pele em 30 dias, em gráfico.</h2>
        <Link href="/entrar" className={buttonClasses("dark", "lg", "lg:w-auto")}>Começar 7 dias grátis</Link>
        <AppDownload tone="dark" />
        <p className="text-sm opacity-85">
          No Android, permita &quot;instalar apps desconhecidos&quot; quando o celular pedir. No iPhone, abra o site no Safari e toque em
          Compartilhar → Adicionar à Tela de Início.
        </p>
      </section>

      <footer className="pt-10 text-sm text-muted">
        Viço · Análise cosmética, não é diagnóstico médico.
      </footer>
    </main>
  );
}
