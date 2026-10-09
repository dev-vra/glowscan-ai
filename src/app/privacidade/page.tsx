import type { Metadata } from "next";
import { PageHero, SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Privacidade e dados · Viço",
  description: "Quais dados o Viço guarda, por quê, onde, e como você apaga tudo.",
};

// Resumo em linguagem simples. A política jurídica completa (LGPD) está em revisão.
const SECTIONS = [
  {
    title: "O que guardamos",
    items: [
      "E-mail e dados da conta.",
      "Respostas do perfil (tipo de pele, preocupações, faixa de idade, gestação).",
      "Fotos do rosto que você envia para análise, e os resultados de cada análise.",
      "Produtos do seu armário, rotina, passos marcados e check-ins.",
      "Status da assinatura (os dados do cartão ficam com o processador de pagamento, nunca com a gente).",
    ],
  },
  {
    title: "Por que usamos",
    items: [
      "A foto do rosto é dado pessoal sensível (LGPD). Só é processada com sua autorização explícita, e só para gerar a sua análise.",
      "Nunca usamos suas fotos para treinar modelos de IA.",
      "Os demais dados servem para montar sua rotina e mostrar sua evolução.",
      "Pesquisa anônima (quando disponível) é opcional, desligada por padrão, e usa só números agregados — nunca fotos, nome ou e-mail.",
    ],
  },
  {
    title: "Onde fica",
    items: [
      "Fotos em armazenamento privado; cada acesso usa um link temporário que expira em minutos.",
      "Banco de dados com acesso restrito por usuário.",
      "A análise da imagem é feita por um provedor de IA contratado, que não pode usar as imagens para treinamento.",
    ],
  },
  {
    title: "Seus controles",
    items: [
      "Revogar a autorização da análise facial a qualquer momento, em Perfil.",
      "Excluir a conta em Perfil: apaga fotos, análises, produtos e rotina de forma definitiva.",
      "Dúvidas ou pedidos sobre seus dados: fale com a gente pelo contato do app.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Privacidade e dados" title="Sua foto é sua." intro="Um resumo honesto do que acontece com seus dados no Viço." />
      <div className="mx-auto max-w-3xl space-y-4 px-5">
        {SECTIONS.map((s) => (
          <section key={s.title} className="space-y-3 rounded-[24px] bg-surface-raised p-6">
            <h2 className="font-display text-[24px]">{s.title}</h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              {s.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </section>
        ))}
        <p className="pt-2 text-sm text-muted">Este é um resumo. A política de privacidade completa está em revisão jurídica e será publicada antes do lançamento ao público.</p>
      </div>
    </SiteShell>
  );
}
