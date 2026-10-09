# Componentes — GlowScan AI

Base: Radix primitives (via shadcn/ui) + Tailwind com tokens (`bg-surface text-muted`, nunca hex). Ícones: Lucide (stroke 1.5). Fontes: Cormorant Garamond (títulos) + Manrope (UI), Google Fonts/`next/font`. Copy 100% própria.

Linguagem visual: muito respiro, cantos generosos, sombras quase invisíveis, títulos serifados, eyebrow em caixa alta `xs` tracking 0.08em, números em `tabular-nums`. Motion lento e suave (`ease-lux`).

```
Button
  variants  primary (bg accent / on-accent), secondary (surface-raised + border), ghost, danger
  sizes     sm 36, md 44, lg 52 (CTA mobile, full width)
  states    default, hover (brilho -4%), active (scale .98), focus-visible (ring 2px accent), disabled (50%), loading (spinner + label mantida p/ leitor)
  tokens    radius pill, font sm/600
  a11y      <button> real; aria-busy no loading
  used on   todas

OptionCard (quiz)
  variants  single (radio), multi (checkbox)
  states    default, hover, selected (border accent 1.5px + bg accent-soft + check), focus-visible, disabled
  tokens    surface-raised, radius md, padding 16
  a11y      role radiogroup/group, setas navegam, Espaço seleciona
  used on   S02

Stepper
  barra fina 2px gold sobre border; "3 de 8" em xs muted; botão voltar ghost
  a11y      aria-valuenow/max (progressbar)
  used on   S02

ScoreRing
  variants  lg 200px (S06/S08), sm 56px (listas)
  states    loading (anel pulsando), animando 0→valor (600ms), vazio ("—" + CTA scan)
  tokens    trilho border, arco gold, número display serif, rótulo xs muted
  a11y      role img + aria-label "Skin Score 78 de 100"
  used on   S06, S08, S14

MetricBar
  label + valor 0–100 + delta (↑ success / ↓ danger, texto além da cor)
  states    bom (≥70), médio (40–69), atenção (<40) — ícone + palavra, não só cor
  used on   S08, S14

FaceZoneMap
  SVG próprio de rosto em traço fino; zonas testa/T/bochechas/queixo; zona ativa preenchida accent-soft
  a11y      lista textual equivalente abaixo
  used on   S08

CameraOverlay
  variants  face (oval guia), label (retângulo), barcode (linha)
  states    sem permissão (tela explicativa + botão abrir config), luz ruim (aviso warning), alinhado (contorno success + haptic), capturando
  tokens    escurecimento rgba(21,17,14,.55) fora da guia
  a11y      instruções em texto e aria-live; botão disparo 72px
  used on   S07, S09

ProductCard
  variants  compacto (lista), detalhe
  conteúdo  foto/placeholder, marca xs eyebrow, nome base/600, tags AM/PM, badge conflito
  states    default, pressionado, conflito, IA incerta (borda warning tracejada)
  used on   S10, S11, S12

IngredientChip
  variants  ativo (accent-soft), neutro (surface), alerta (warning/danger + ícone)
  a11y      botão se abre explicação
  used on   S10, S13

RoutineStep
  número de ordem serif, produto, dias da semana
  states    pendente, feito (check + texto riscado sutil), conflito, arrastando
  a11y      checkbox real; reordenar também por botões ↑↓ (não só drag)
  used on   S06, S12

ConflictBadge / ConflictSheet
  severity  info (muted), warn (warning), critical (danger)
  sheet     par de ingredientes, por quê, sugestão, CTA "Aplicar sugestão"
  a11y      Radix Dialog, foco preso, Esc fecha
  used on   S12, S13

LineChart
  Recharts; linha gold 2px, pontos só em scans, grade horizontal border, sem grid vertical
  states    vazio (<2 scans: ilustração + CTA), tooltip
  a11y      tabela oculta visualmente com os dados
  used on   S14

BeforeAfterSlider
  divisor arrastável; teclado ←→; legenda com datas
  used on   S14

PlanCard (paywall)
  variants  mensal, anual (selo "melhor valor", borda gold)
  states    selecionado, default
  a11y      radiogroup
  used on   S05

Disclaimer
  texto xs muted com ícone info: "Análise estética, não substitui avaliação dermatológica."
  used on   S08, S12, S13

BottomSheet, Toast, BottomNav (Hoje · Rotina · [+] · Evolução · Perfil)
  BottomNav 72px, FAB central accent 56px; ativo = accent, inativo = muted; aria-current
  Toast aria-live polite; sucesso/erro com ícone
  global

EmptyState
  ícone Lucide em círculo accent-soft, título serif, 1 linha muted, CTA primário
  S06 (sem scan), S11 (sem produtos), S12 (sem rotina), S14 (<2 scans)
```

Primitivos em código: construídos na rota `/design` como primeiro passo do `/replica-build` (o app ainda não foi gerado).
