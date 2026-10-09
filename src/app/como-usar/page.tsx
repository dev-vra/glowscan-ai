import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { APK_URL, PageHero, SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Como usar · Viço",
  description: "Manual rápido do Viço: instalar, fazer a primeira análise, cadastrar produtos e seguir a rotina.",
};

type Step = { id: string; title: string; body: ReactNode };

const STEPS: Step[] = [
  {
    id: "instalar",
    title: "Instale ou abra o app",
    body: (
      <>
        <p><strong>Android:</strong> baixe o app em <a href={APK_URL} download className="font-semibold text-accent underline">Baixar para Android</a>. Na primeira vez, o celular pede para permitir &quot;instalar apps desconhecidos&quot; — é só autorizar para o navegador que você usou.</p>
        <p><strong>iPhone:</strong> abra <strong>vico.bitrilha.com.br</strong> no Safari, toque em <strong>Compartilhar → Adicionar à Tela de Início</strong>. O Viço vira um ícone e abre em tela cheia, como um app.</p>
        <p><strong>Computador:</strong> funciona direto no navegador. A análise do rosto fica melhor no celular, com a câmera frontal.</p>
      </>
    ),
  },
  {
    id: "entrar",
    title: "Entre na sua conta",
    body: (
      <>
        <p>Toque em <strong>Entrar</strong>. Durante o beta, use <strong>Entrar com senha</strong> com o e-mail e a senha do seu convite.</p>
        <p>Também dá para receber um link de acesso por e-mail ou entrar com Google (no site; dentro do app Android o Google não permite).</p>
      </>
    ),
  },
  {
    id: "perfil",
    title: "Responda 4 perguntas rápidas",
    body: (
      <p>Tipo de pele, o que você quer melhorar (até 3 opções), idade e se está gestante ou amamentando. Isso ajusta a rotina — por exemplo, ativos que pedem cautela na gestação são sinalizados. Não sabe seu tipo de pele? Tudo bem: a análise ajuda a descobrir.</p>
    ),
  },
  {
    id: "consentimento",
    title: "Autorize o uso da foto",
    body: (
      <p>Antes da primeira análise, o Viço pede sua autorização para processar a foto do rosto. As fotos ficam em armazenamento privado, servem só para a sua análise e nunca treinam IA. Você pode revogar e apagar tudo em <strong>Perfil</strong>.</p>
    ),
  },
  {
    id: "analise",
    title: "Faça a primeira análise",
    body: (
      <>
        <p>Toque no botão <strong>+</strong> no centro da barra de baixo. Encaixe o rosto no oval e espere os três sinais ficarem verdes: <strong>luz boa</strong>, <strong>rosto no oval</strong> e <strong>sem filtro</strong>. Com tudo certo, a foto é tirada sozinha depois de 3 segundos.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Fique de frente para uma janela, sem sol direto.</li>
          <li>Cabelo preso, rosto inteiro no oval, sem base e sem filtro.</li>
          <li>Repita sempre na mesma luz e no mesmo horário: assim a comparação semanal é justa.</li>
        </ul>
        <p>Se a foto não servir, ela <strong>não conta</strong> como análise — o app explica o motivo e você tenta de novo.</p>
      </>
    ),
  },
  {
    id: "resultado",
    title: "Entenda o resultado",
    body: (
      <>
        <p>O <strong>Skin Score</strong> vai de 0 a 100 e resume 7 métricas: textura, vermelhidão, poros, linhas finas, manchas, oleosidade e hidratação aparente. A métrica mais baixa aparece como <strong>foco</strong>.</p>
        <p>Toque em qualquer métrica para ver o mapa por zona do rosto (testa, zona T, bochechas, queixo) e quais produtos do seu armário ajudam nela.</p>
        <p>A partir da segunda análise, aparece quanto cada número subiu ou caiu. É uma análise cosmética, não um diagnóstico: quando algo foge do comum, o app sugere procurar um dermatologista.</p>
      </>
    ),
  },
  {
    id: "produtos",
    title: "Cadastre seus produtos",
    body: (
      <>
        <p>Em <strong>Rotina → Meu armário → +</strong>, fotografe o <strong>verso</strong> da embalagem, onde fica a lista de ingredientes. O Viço lê marca, categoria e cada ingrediente; confira e salve.</p>
        <p>Rótulo difícil de ler? Dá para cadastrar à mão, digitando os ingredientes separados por vírgula.</p>
      </>
    ),
  },
  {
    id: "rotina",
    title: "Siga a rotina na ordem certa",
    body: (
      <>
        <p>Em <strong>Rotina</strong>, alterne entre <strong>Manhã</strong> e <strong>Noite</strong>. Cada produto aparece numerado, com os dias da semana e uma dica de quantidade. Na faixa da semana, o ponto terracota marca dias de retinoide e o dourado, de esfoliante.</p>
        <p>Se dois produtos não combinam (por exemplo, retinol e ácido na mesma noite), aparece um alerta. Nos casos importantes, o Viço sugere a troca e aplica com um toque em <strong>Aplicar na rotina</strong>.</p>
      </>
    ),
  },
  {
    id: "hoje",
    title: "Marque o dia em Hoje",
    body: (
      <p>A tela <strong>Hoje</strong> mostra o período atual (manhã até as 15h, depois noite). Marque cada passo conforme aplica. Ao completar, sua sequência de dias sobe e você registra como a pele está — leva 5 segundos e ajuda a entender reações.</p>
    ),
  },
  {
    id: "evolucao",
    title: "Acompanhe a evolução",
    body: (
      <p>Faça uma análise por semana. Em <strong>Evolução</strong> você vê o gráfico do Skin Score e de cada métrica, e um antes/depois que você arrasta com o dedo. Para compartilhar, use o card do resultado: ele mostra os números, nunca o seu rosto.</p>
    ),
  },
  {
    id: "privacidade",
    title: "Controle seus dados",
    body: (
      <p>Em <strong>Perfil</strong>: ligue ou desligue gestante/amamentando, revogue a autorização da análise facial, veja quantas fotos estão guardadas e exclua a conta com tudo dentro. Mais detalhes em <Link href="/privacidade" className="font-semibold text-accent underline">Privacidade e dados</Link>.</p>
    ),
  },
];

const PROBLEMS = [
  { q: "A câmera não abre", a: "Libere a câmera nas configurações do navegador (ou do app, no Android). Enquanto isso, dá para enviar uma selfie da galeria." },
  { q: "O botão de análise fica bloqueado", a: "Algum dos três sinais não está verde. O mais comum é pouca luz: vire de frente para uma janela." },
  { q: "A análise foi recusada", a: "A foto estava escura, desfocada, de lado ou com filtro. Ela não contou como análise; siga as dicas e tente de novo." },
  { q: "O rótulo veio errado", a: "Corrija os campos antes de salvar ou edite depois, em Armário → produto → Editar." },
  { q: "Esqueci a senha do beta", a: "Fale com quem te convidou: uma senha nova é gerada na hora." },
];

export default function HowToPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Manual de uso" title="Do download à primeira evolução" intro="Onze passos curtos. Leva uns 5 minutos para começar e 1 minuto por dia depois." />
      <div className="mx-auto grid max-w-wide gap-10 px-5 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Passos" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {STEPS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.id}`} className="flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface hover:text-text">
                  <span className="tabular-nums text-accent">{i + 1}</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-4">
          {STEPS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 rounded-[24px] bg-surface-raised p-6">
              <div className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-accent-soft font-display text-xl font-bold text-accent">{i + 1}</span>
                <div className="space-y-3">
                  <h2 className="font-display text-[24px] leading-8">{s.title}</h2>
                  <div className="space-y-3 text-[16px] leading-7 text-text">{s.body}</div>
                </div>
              </div>
            </section>
          ))}

          <section id="problemas" className="scroll-mt-24 space-y-3 pt-6">
            <h2 className="font-display text-[28px]">Deu algum problema?</h2>
            <div className="divide-y divide-border rounded-[24px] bg-surface-raised px-5">
              {PROBLEMS.map(({ q, a }) => (
                <details key={q} className="py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center font-bold">{q}</summary>
                  <p className="pb-4 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-6 sm:flex-row">
            <Link href="/app" className={buttonClasses("primary", "lg", "sm:w-auto")}>Abrir o app</Link>
            <a href={APK_URL} download className={buttonClasses("secondary", "lg", "sm:w-auto")}>Baixar para Android</a>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
