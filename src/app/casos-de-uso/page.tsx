import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { PageHero, SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Casos de uso · Viço",
  description: "Para quem o Viço foi feito: rotina nova, armário cheio, ativos fortes, gestação, pele sensível, resultado de tratamento.",
};

// Situações ilustrativas (não são depoimentos reais).
const CASES = [
  {
    who: "Começando do zero",
    situation: "Quer cuidar da pele, mas não sabe nem o tipo de pele nem por onde começar.",
    how: ["Responde 4 perguntas e faz a primeira análise", "Recebe o ponto de partida: métrica mais forte e o foco", "Monta uma rotina básica de 3 passos com o que já tem"],
    result: "Sabe o que usar, em que ordem, e tem uma linha de base para comparar.",
  },
  {
    who: "Armário cheio, sem método",
    situation: "Tem 10 produtos, usa tudo junto e não sabe o que está funcionando.",
    how: ["Fotografa os rótulos de todos os produtos", "O Viço ordena manhã e noite e distribui ativos na semana", "Alertas mostram o que não deveria estar junto"],
    result: "Rotina enxuta, sem desperdício e sem combinação que irrita.",
  },
  {
    who: "Retinol e ácidos",
    situation: "Começou um ativo forte e tem medo de exagerar.",
    how: ["O motor intercala retinoide e esfoliante em dias diferentes", "Lembra o protetor solar na manhã seguinte", "Check-in diário registra ardor ou descamação"],
    result: "Introduz o ativo com segurança e vê o efeito nas métricas de textura e linhas.",
  },
  {
    who: "Gestação e amamentação",
    situation: "Precisa saber o que pode continuar usando.",
    how: ["Liga a opção em Perfil", "Ingredientes que pedem cautela aparecem marcados no produto e na rotina", "A recomendação nunca substitui a orientação médica"],
    result: "Clareza sobre o próprio armário, com o alerta no lugar certo.",
  },
  {
    who: "Pele sensível",
    situation: "Tudo arde ou avermelha, e é difícil achar o culpado.",
    how: ["Acompanha vermelhidão semana a semana", "Check-in diário com reações", "Relaciona a piora ao produto que entrou na rotina"],
    result: "Descobre o que tirar — com dados, não no chute.",
  },
  {
    who: "Saber se o investimento vale",
    situation: "Comprou um sérum caro e quer saber se faz diferença.",
    how: ["Faz análise semanal sempre na mesma luz", "Compara antes/depois e o gráfico da métrica-alvo", "Compartilha o card de 30 dias, sem mostrar o rosto"],
    result: "Decide recomprar (ou não) olhando para a própria evolução.",
  },
];

export default function UseCasesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Casos de uso"
        title="Feito para quem quer saber se está funcionando"
        intro="Seis situações comuns e como o Viço ajuda em cada uma. São exemplos ilustrativos, não depoimentos."
      />
      <div className="mx-auto grid max-w-wide gap-4 px-5 md:grid-cols-2 lg:grid-cols-3">
        {CASES.map((c, i) => (
          <article key={c.who} className="rise flex flex-col gap-4 rounded-[24px] bg-surface-raised p-6" style={{ ["--i" as string]: i }}>
            <h2 className="font-display text-[24px] leading-7">{c.who}</h2>
            <p className="text-muted">{c.situation}</p>
            <ol className="space-y-2">
              {c.how.map((h, j) => (
                <li key={h} className="flex gap-3 text-[15px]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-accent-soft text-xs font-bold text-accent">{j + 1}</span>
                  {h}
                </li>
              ))}
            </ol>
            <p className="mt-auto rounded-[18px] bg-success-soft p-4 text-[15px] font-semibold text-success">{c.result}</p>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-wide flex-col gap-3 px-5 sm:flex-row">
        <Link href="/app" className={buttonClasses("primary", "lg", "sm:w-auto")}>Abrir o app <ArrowRight className="size-5" aria-hidden /></Link>
        <Link href="/como-usar" className={buttonClasses("secondary", "lg", "sm:w-auto")}>Ver o manual de uso</Link>
      </div>
    </SiteShell>
  );
}
