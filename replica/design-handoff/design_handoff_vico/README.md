# Handoff: Viço (ex-GlowScan AI) — rebrand + redesign completo

## Overview
Rebrand e redesign do app `dev-vra/glowscan-ai` (Next.js 16 + Tailwind v4 + Supabase + Stripe). O produto não muda: selfie → análise da pele (Skin Score + 7 métricas) → armário por foto do rótulo → rotina AM/PM com detector de conflitos → acompanhamento e evolução.
Nova marca: **Viço** ("pele com viço"). Personalidade: amiga que entende de pele — confiável como farmácia, gostosa como app de beleza.

## About the Design Files
Os arquivos em `design/` são **referências de design em HTML** (abrir no navegador; `support.js` precisa estar na mesma pasta). Não são código de produção. A tarefa é **recriar estas telas no repositório existente** usando os padrões dele: App Router, server components + Suspense, server actions, componentes em `src/components/ui` e `src/components/app`, ícones Lucide, Tailwind v4 com tokens `@theme`.
Os arquivos em `code/` **são** para usar direto: `tokens.css`, `motion.css`, `copy.ts`, `manifest.webmanifest`.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos, raios, copy e estados são finais. Os glifos de ícone nos mocks (⌂ ☰ ↗ ○ ☀ ☾ ! ✓) são marcadores: troque por Lucide — `Home`, `CalendarCheck`, `LineChart`, `User`, `Sun`, `Moon`, `AlertTriangle`/`OctagonAlert`, `Check`, `Info`, `Plus`, `X`, `ArrowLeft`, `ChevronRight`, `Lock`, `CameraOff`, `ArrowLeftRight`. Use strokeWidth 2 e size 20 na nav, 24 nos alertas. Placeholders listrados = fotos reais (ver Assets).

## Ordem de implementação sugerida
1. `code/tokens.css` → substitui `src/app/tokens.css`. Em `layout.tsx`, troque Cormorant/Manrope por `next/font/google` **Bricolage_Grotesque** (`variable: "--font-bricolage"`, `axes: ["opsz"]`, pesos 500/700/800) e **Figtree** (`variable: "--font-figtree"`, 400–700).
2. `code/motion.css` → importar em `globals.css` depois de tokens.
3. Componentes de UI (seção Componentes abaixo).
4. Telas, na ordem: Scan → Resultado → Hoje → Rotina → Armário → Evolução → Perfil → Onboarding/Paywall/Consentimento.
5. Trocar todo texto por `code/copy.ts`.
6. Renomear a marca: metadata, `manifest`, favicon, OG, e-mails do link mágico, Stripe product name.

---

## Design Tokens (resumo — fonte da verdade é `code/tokens.css`)
**Claro**
- bg `#FFFBF8` · surface `#F6EEE7` · surface-raised `#FFFFFF` · border `#EADFD6` · border-input `#8F8176`
- text `#2A1B14` · muted `#6E5C51`
- accent (terracota) `#B8462F` · accent-soft `#F9E6DE` · on-accent `#FFFFFF`
- gold (sol) `#F2B66D` · gold-soft `#FBEDD6`
- Status (texto / fundo / borda):
  - danger: `#A3271B` / `#FDE7E3` / `#F4B8AE`
  - warning: `#7A4A00` / `#FDF0D2` / `#EBC67A`
  - info: `#1F5F86` / `#E3F0F8` / `#A9CDE3`
  - success: `#1F6B45` / `#E1F1E7` / `#A8D4B9`
- Barra de métrica em foco: `#D98A2B`. Câmera ok: `#8FD6A8`. Linhas internas de card: `#F1E7DE`. Trilha do anel: `#EFE5DC`.

**Escuro** (`[data-theme=dark]` e `prefers-color-scheme`)
- bg `#1A1310` · surface `#221915` · raised `#2C211C` · border `#3E3029` · text `#F6EDE6` · muted `#BFAEA2`
- accent `#F08A6E` com on-accent `#1A1310`
- danger `#FF9C8F`/`#3A1714` · warning `#F5C46B`/`#33240B` · info `#8CC6EA`/`#10283A` · success `#7FD3A2`/`#10301F`

**Tipografia**
- Display/números: Bricolage Grotesque, sempre `font-variant-numeric: tabular-nums` em scores.
  - Score lg 76/68 800, letter-spacing −0.05em
  - Display 44 800, −0.035em
  - Título de tela 26–30 700, −0.02em
  - Título de card 20 700
- Texto: Figtree.
  - Corpo 16/24 400–500
  - Item de lista 15 600
  - Apoio 14 · legenda 12–13 (mínimo 12)
  - Botão 17 700
- Eyebrow: Figtree 13 700, uppercase, letter-spacing .04em, cor accent.

**Espaço:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48.
- Margem lateral de tela: 16 (cards) / 20–24 (texto).
- Gap entre cards: 12.

**Raio:** 14 (input, chip quadrado) · 18–20 (alerta, card pequeno) · 24 (card) · 28 (card hero) · 32 (topo de sheet) · 999 (botão, chip).

**Sombra:** cards sem sombra no claro (contraste via fundo `#FFFFFF` sobre `#FFFBF8`). FAB "+": `0 10px 24px -8px rgba(184,70,47,.6)`.

**Alvos:**
- Mínimo 44×44.
- Botão primário com altura 56 e pill.
- Linha de lista com 48–56 de altura.

---

## Componentes (refs em `design/Vico Sistema.dc.html` § 01)

- **ScoreRing** (`score-ring.tsx`):
  - Tamanhos: lg 184px (anel 13px, número 76), md 140 (56), sm 72 (anel 7px, número 26).
  - `conic-gradient(accent 0 X%, #EFE5DC X% 100%)`, miolo na cor da superfície.
  - Anel sempre terracota — nunca verde/vermelho por faixa de nota.
  - Vazio: trilha cheia + "–" em `#C9B6A8`.
  - Animação em motion.css §4.
- **MetricBar** (`metric-bar.tsx`):
  - Grid `104–110px | 1fr | 58–70px`, altura 44–48, separador `#F1E7DE`.
  - Barra com 8px de altura, raio 4.
  - Delta: ▲n verde `#1F6B45`, ▼n vermelho `#A3271B`, "=" muted. Sempre seta + número.
  - A métrica mais baixa vira **foco**: label em negrito, barra `#D98A2B`, texto "foco".
  - Carregando: barra cheia `#F1E7DE` + "lendo…".
- **Chip de ingrediente:**
  - Altura 36, pill, nome INCI em 600 + tradução em 500 muted ("Retinol · vitamina A").
  - Fundos: ativo principal gold-soft, retinoide accent-soft, neutro `#F1E7DE`.
  - Gestação: danger-soft + borda + ícone.
- **Chip de seleção:** 44px.
  - Selecionado: fundo text `#2A1B14` + texto branco + "✓".
  - Padrão: borda 1.5 `#E2D5CA`.
- **ConflictAlert** (substitui `Finding` em `rotina/page.tsx`):
  - Cartão sempre aberto (não `<details>`), raio 18, padding 16, borda 1.5.
  - Estrutura: ícone 24 + título (nível, bold, cor do nível) + texto + ação opcional.
  - Ícones por nível — a forma muda, não só a cor:
    - critical: octógono `OctagonAlert`
    - warn: círculo cheio com "!"
    - info: círculo "i"
    - resolved: círculo verde "✓", com rótulo "Resolvido na agenda"
  - Conflito crítico **não resolvido** abre bottom sheet com: os dois produtos lado a lado (✕ entre eles), "Nossa sugestão", e os botões "Aplicar na rotina" / "Manter como está".
- **RoutineStep** (`routine-checklist.tsx`):
  - Linha de 56px de altura com círculo de 28px.
  - Estados:
    - a fazer: borda 2 `#8F8176`
    - feito: accent + ✓ branco, texto muted riscado
    - ordenado: número Bricolage 20 accent
    - folga: borda tracejada `#C9B6A8` + "volta na sexta"
- **Button:**
  - Primário: accent/branco.
  - Secundário escuro: `#2A1B14`/branco.
  - Contorno: branco + borda 1.5 `#E2D5CA`.
  - Ghost: 44px, sem fundo.
  - Bloqueado (câmera): `#4A3A31`/`#BFAEA2`.
  - Destrutivo: `#A3271B`/branco.
  - Pressed: scale .97.
- **BottomNav** (`bottom-nav.tsx`):
  - Altura 84 (inclui safe-area), fundo bg, borda topo `#EADFD6`.
  - Rótulo 12/600, ícone 20.
  - Item ativo em accent, inativo em muted.
  - FAB central de 56px, accent, margin-top −22, sombra terracota.
  - Itens: Hoje, Rotina, [+ Nova análise], Evolução, Perfil.
- **LineChart** (`line-chart.tsx`):
  - Grade horizontal `#F1E7DE`; linha 3.5px accent com cantos arredondados; pontos de 5px.
  - Último ponto: círculo branco com borda accent e rótulo escuro (`#2A1B14`, raio 8) com o valor.
  - Série comparada em gold tracejada `2 7`.
  - Eixo X em JetBrains Mono 12 muted (ou Figtree 12 tabular, se não quiser uma 3ª fonte).
- **BeforeAfter:**
  - Duas fotos lado a lado, divisor branco de 3px e puxador branco de 44px (⇔).
  - Datas em selos brancos **no topo**.
  - Arraste por pointer events; teclado ← →.
- **CameraFrame** (`face-camera.tsx`):
  - Oval 270×360, máscara `rgba(26,19,16,.6)`.
  - Estado da borda (4px):
    - ok: sólida `#8FD6A8`
    - ajuste (luz/maquiagem): tracejada gold
    - fora do quadro: tracejada branca
  - 3 chips de checagem abaixo do oval: luz, enquadramento, filtro.
  - O CTA fica bloqueado até as 3 checagens darem ok.
- **Selos:** PATROCINADO (11/700, uppercase, fundo text, raio 6) · delta ▲ (success-soft) · streak ● (gold-soft/warning) · Estudo (info-soft).

---

## Telas (refs em `design/Vico App.dc.html`; frames 390×844)

### Entrada
- **S01–S04 Quiz** (`/onboarding`):
  - Barra de progresso de 6px (accent sobre `#EFE5DC`) + "n/5" em mono.
  - Título 30/700, uma pergunta por tela.
  - S01 preocupações: chips multi, até 3.
  - S02 tipo de pele: cartões 64px com título + rótulo técnico; seleção = accent-soft + borda 2 accent. Link "Não sei — a análise descobre".
  - S03 idade (grid 3×2) + gestação (Sim/Não/Prefiro não) + aviso info para menor de 18.
  - S04 orçamento (4 linhas) + cidade (usada para UV/umidade).
  - Escolha única avança sozinha após 250ms.
  - S05b é o loading "Montando seu plano…".
- **S05 Plano** (`/onboarding/plano`): eyebrow "Seu plano, {nome}", headline do perfil e 3 cartões numerados. CTA "Quero esse plano".
- **S06 Entrar:** wordmark, e-mail (input 52, borda 1.5 `#8F8176`), "Receber link", divisor "ou", "Continuar com Google".
- **Paywall** (`/assinar`):
  - Preços R$ 24,90/mês · R$ 199/ano.
  - Anual pré-selecionado: borda 2.5 accent + selo "Economize 33%".
  - Mostrar "R$ 16,58/mês".
  - 4 benefícios com ✓.
  - Rodapé: "Pagamento seguro · Restaurar compra".
- **Consentimento** (`/app/consentimento`):
  - Ícone de cadeado + "Sua foto é sua." + 3 garantias.
  - Checkbox obrigatório para a análise.
  - Checkbox opcional para pesquisa anônima (fase 2), desmarcado por padrão.

### Scan (`/app/scan/rosto`)
- Estados: S07a pronto · b luz ruim · c maquiagem · d fora do quadro · e lendo · f rejeitado · g câmera bloqueada.
- **Topo:** ✕ (44, fundo `rgba(0,0,0,.45)`), título, "?" de ajuda. Com luz ruim, o título vira um medidor de 5 barras.
- **Lógica:** manter `averageLuminance` (70–215).
- **Maquiagem/filtro:** detecção vem da IA após a captura OU heurística. Se detectado, mostra o estado c com override "Tô sem maquiagem, analisar".
- **Captura automática:** após 3s estável em ok (anel de contagem no oval). O botão manual também funciona.
- **Lendo:** tela clara com anel de progresso + foto, e checklist de 4 itens que marca conforme a resposta progride (stream ou timer).
- **Rejeitado:** não conta como análise; 3 dicas; "Tentar de novo".

### Resultado (`/app/scan/[id]`)
- **S08a sucesso — ordem de leitura:**
  1. Data
  2. Anel lg
  3. Selo delta
  4. Resumo em 1 frase (18/600)
  5. 7 métricas
  6. CTA ligado ao foco ("Ver minha rotina pra zona T")
  7. Disclaimer 12px
- **S08b primeira análise:** sem delta; cartões "Mais forte" e "Foco"; promessa de comparar em 7 dias.
- **S08c sinal para profissional:** cartão info **no topo** — nunca vermelho, nunca diagnóstico — com "Encontrar dermatologista".
- **S08d card 9:16:** fundo accent, para a rota `/app/scan/[id]/card`. 1:1 em `Vico Sistema` §03.
- **S08e detalhe da métrica:** número grande, frase, mapa de zonas (testa, nariz, bochechas, queixo — usa `FACE_ZONES`), âmbar abaixo de 50, "O que ajuda" com produto do armário.

### Hoje (`/app`)
- **H1:**
  - Saudação por horário + selo de streak.
  - Mini anel (72) com delta e próxima análise.
  - Checklist do período atual expandido.
  - Outro período colapsado numa linha, com contador e destaque do ativo ("· retinol hoje").
- **H2:** ao completar o período, card terracota "{n} dias seguidos" + check-in (5 opções de 64px de altura + chips de reação + "Registrar"). Já registrado → uma linha de texto.
- **H3 vazio:** CTA de primeira análise + passo 2 (produtos).
- **H4:** skeleton.
- **Avisos de assinatura** (A1) entram como card entre a saudação e o score.

### Rotina (`/app/rotina`)
- **S12a:**
  - Segmented Manhã/Noite.
  - Faixa da semana (7 dias, hoje invertido), com pontos: accent = retinoide, gold = esfoliante.
  - Alertas.
  - Lista numerada com frequência e dica de quantidade.
- **S12b:** sheet de conflito crítico.
- **S12c:** alerta de gestação, falta de SPF e dica.
- **S12d:** vazio.
- **Regras:** manter `planRoutine` como está. Novidade: a ação "Aplicar na rotina" move o produto de período (sugestão vinda de `catalog.ts`).

### Armário (`/app/produtos…`)
- **S09:** grid 2 colunas, card com foto 110, marca, nome e pílula de período. Item processando = borda tracejada + skeleton.
- **S10a:** câmera de rótulo (retângulo 310×380, raio 24) + galeria/digitar.
- **S10b:** confirmar leitura (campos editáveis + chips de ativos + "Ver lista completa (INCI)").
- **S10c:** rótulo ilegível.
- **S11 detalhe:**
  - Quando, passo e "não mistura com".
  - Alerta de sol.
  - Bloco "Quando acabar" com selo PATROCINADO + "Comprar" (afiliado, `lib/affiliate.ts`).
  - Rodapé de transparência.

### Evolução (`/app/evolucao`)
- **E1:** card do score (64 → 72 + delta), gráfico de 30 dias, chips por métrica (scroll horizontal), antes/depois e "Compartilhar meus 30 dias".
- **E2 vazio:** "Falta 1 análise pro primeiro gráfico" + lembrete.

### Perfil (`/app/perfil`)
- **P1:**
  - Avatar com inicial, plano e renovação.
  - Pele, toggle de gestante, lembretes e assinatura.
  - Privacidade: toggle de pesquisa, exportar dados, apagar fotos (n).
  - "Excluir conta" em danger.
- **P2:** sheet de confirmação.
- **A2:** cancelar assinatura: o que perde, motivo opcional; "Cancelar" com contorno danger e "Manter" escuro (sem dark patterns).

### Fase 2 (deixar pronto, atrás de flag)
- **F2:** convite para estudo patrocinado.
- **Selo PATROCINADO:** no detalhe do produto.
- **Consentimento opcional de pesquisa:** no consentimento e no perfil.

### Desktop (≥1024px)
- Sidebar de 240px: wordmark, 5 itens de 44px, ativo com accent-soft + accent, e "+ Nova análise" no rodapé.
- Conteúdo em 2 colunas: score + gráfico | checklist + alerta + QR "Análise é melhor no celular".
- O scan no desktop mostra QR para abrir no celular, mas permite upload.
- Telas de formulário: `max-width: 480px` centralizado.

---

## Interações & Animações (detalhe em `code/motion.css`)
- **Durações:** 120 (press) · 200 (check/toggle) · 320 (cards/sheet) · 600 (anel) · 1200 (contagem).
- **Easings:** out `cubic-bezier(.22,.8,.24,1)` · in-out `(.65,0,.35,1)` · spring `(.34,1.56,.64,1)`.
- **Revelação do resultado:**
  - Anel preenche em 600ms enquanto o número conta 0→score em 1200ms.
  - Barras crescem a partir de 600ms, com 60ms de stagger.
  - Selo ▲ pop aos 1100ms.
  - Haptic leve aos 1200ms.
- **Check de rotina:**
  - Círculo pop (spring 200ms), ✓ desenha (stroke-dashoffset) e o texto é riscado da esquerda para a direita (320ms).
  - Update otimista (já existe, `useOptimistic`).
  - Último passo do período → card de streak entra com rise + dígito sobe.
- **Scan:**
  - A moldura "respira" (1.6s) em ok.
  - Contorno faz contagem de 3s.
  - Flash branco de 240ms + `navigator.vibrate(12)`.
  - Mensagens via `aria-live="polite"`.
- **Sheets:** sobem em 320ms com scrim fade; fecham por arraste > 30% ou toque no scrim.
- **Rotas:** View Transitions (fade-out 120ms + rise 320ms). Sem slide lateral.
- **Entrada de listas:** rise com 40ms de stagger, máx. 6 itens animados.
- **`prefers-reduced-motion`:** tudo instantâneo; contagem do score mostra o valor final direto.

## State (além do que já existe)
- `scanGuard: { light: "ok"|"low"|"high", frame: "ok"|"out", filter: "ok"|"suspect"|"overridden", stableMs }` → deriva `canCapture` e o texto.
- `resultReveal: "idle"|"ring"|"bars"|"done"` — anima uma vez por scan (guardar em sessionStorage).
- `routineView: { period: "am"|"pm", day: 0–6 }`; o período padrão é pelo horário (antes das 15h = am).
- `conflictSheet: Conflict | null`; `applySuggestion(conflictId)` → server action que move o período e recalcula `planRoutine`.
- `billingBanner: "trial_ending"|"payment_failed"|null`, vindo de `lib/billing.ts`.
- Flags da fase 2: `sponsoredSlots`, `studyInvites`, `researchConsent`.

## Acessibilidade
- Contraste AA verificado em todos os pares de texto e fundo.
- Status nunca só por cor: ícone com forma própria + rótulo textual.
- Alvos ≥ 44.
- Oval da câmera com `aria-hidden`; estado anunciado em texto.
- Gráficos com `<title>`/resumo textual ("Skin Score subiu de 64 para 72 em 30 dias").
- Fotos de antes/depois com alt "Sua foto de {data}".

## Assets
- `assets/vico-symbol.svg`: símbolo (círculo terracota, arco de "brilho", ponto-sol).
- `assets/app-icon-1024.svg` (claro) e `app-icon-1024-dark.svg`: gerar PNG 180/192/512/1024 + maskable (área segura de 80%).
- `assets/favicon.svg`: abaixo de 60px o ponto-sol some.
- **Wordmark:** "viço" em Bricolage Grotesque 800, minúsculo, letter-spacing −0.05em, cor text (no claro) ou accent (no fundo creme). Domínio sem cedilha (vico.app / usevico.com.br, a confirmar).
- **Fotos:** todas são placeholders. Precisam de rostos reais e sem retoque, cobrindo Fitzpatrick I–VI, homens e mulheres, com autorização de uso.
- Nenhum asset do Cal AI ou de terceiros foi usado.

## Pendências fora do design
- Busca INPI (classes 9, 42, 44) e checagem de domínio para "Viço".
- Revisão jurídica da copy de consentimento LGPD e do estudo patrocinado.
- Validar o preço R$ 24,90 / R$ 199 (Stripe price IDs novos).

## Files
- `design/Vico App.dc.html`: todas as telas e estados (abrir no navegador).
- `design/Vico Sistema.dc.html`: componentes, dark mode, loja (3 screenshots 430×932 → exportar 3×), card 1:1 e ícones.
- `design/Vico Marca e Voz.dc.html`: nomes avaliados, 3 direções de marca (escolhida: 1a Viço) e guia de voz com 10 microcopies.
- `design/support.js`: runtime dos arquivos acima.
- `code/tokens.css`: substitui `src/app/tokens.css`.
- `code/motion.css`: animações.
- `code/copy.ts`: textos.
- `code/manifest.webmanifest`: PWA.
- `assets/`: SVGs de marca.
