# Recon — Cal AI → GlowScan AI

> Clean-room: mecânica e padrões de UX do Cal AI (foto → IA de visão → dashboard/histórico), reaplicados a skincare. Nada de código, copy, logo ou assets do original.

## 1. Escopo
| item | decisão |
| --- | --- |
| Original | Cal AI (calai.app) — iOS/Android, signup web |
| Clone | **GlowScan AI** — web app mobile-first (PWA); app nativo depois |
| Fatia | Core loop: **scan do rosto + scan de rótulos → análise → rotina ordenada + conflitos → diário de evolução** |
| Público | BR, alto padrão, consumidor de dermocosmético importado; assinatura ~R$ 29/mês |

## 2. Fontes
| fonte | URL | o que deu |
| --- | --- | --- |
| site marketing + FAQ | https://www.calai.app/ | features (foto/código de barras/texto), trial 3 dias, paywall no "+", sync Health, ~80% acurácia declarada |
| App Store / Play | listings públicos do Cal AI | telas-chave (onboarding longo tipo quiz, paywall, home com anel, scanner) — conferir manualmente |
| vídeos públicos | TikTok/YouTube "Cal AI review" | fluxo click-a-click |

Não usar: conta de terceiros, bundles JS, endpoints privados.

## 3. Mecânica do Cal AI (padrões a reaproveitar)
1. **Onboarding-quiz longo** (meta, dados pessoais) → "plano personalizado" gerado → **paywall com trial 3 dias** antes do uso.
2. **Home = anel de progresso diário** + cards de macros + lista "recentemente registrado".
3. **Botão "+" central** → câmera / código de barras / descrição em texto.
4. **Resultado da IA editável** (usuário corrige porções/itens) → salva no dia.
5. **Progresso**: gráficos de peso/streak; fotos de evolução.
6. Integrações de saúde (Apple Health / Google Fit).

## 4. Inventário de telas (GlowScan)
| ID | tela | acesso | propósito | componentes | estados |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing | `/` | pitch + CTA trial | hero, prova social, FAQ | — |
| S02 | Onboarding quiz | `/onboarding/[step]` | tipo de pele, preocupações, idade, clima/cidade, orçamento, gestante/lactante | stepper, option cards, progress bar | voltar, validação |
| S03 | Plano gerado | `/onboarding/plano` | "seu perfil de pele" (efeito wow pré-paywall) | loading animado, resumo | loading, pronto |
| S04 | Auth | `/entrar` | magic link / Google / Apple | form, botões OAuth | erro, link enviado |
| S05 | Paywall | `/assinar` | trial 3 dias, mensal/anual | plan cards, toggle, CTA | carregando, falha pagamento |
| S06 | Home / Hoje | `/app` | **Skin Score** (anel), rotina AM/PM com checks, alertas | score ring, routine list, alert card, FAB "+" | vazio (sem scan), preenchido, sem rotina |
| S07 | Scan do rosto | `/app/scan/rosto` | câmera com guia de enquadramento + checagem de luz | camera overlay, dicas, shutter | sem permissão, luz ruim, rosto não detectado |
| S08 | Resultado da pele | `/app/scan/[id]` | métricas: textura, vermelhidão, poros, linhas, manchas, oleosidade, hidratação aparente; mapa de zonas | metric bars, face zone map, disclaimer | analisando, erro IA, foto rejeitada |
| S09 | Scan de produto | `/app/produtos/novo` | foto do rótulo/INCI ou código de barras ou busca | camera, barcode, search | não reconhecido → digitar INCI |
| S10 | Produto (detalhe) | `/app/produtos/[id]` | ativos extraídos, função, pH/categoria, editar | ingredient chips, edit form | editável, IA incerta |
| S11 | Armário | `/app/produtos` | lista de produtos do usuário, filtro AM/PM/categoria | product cards, filtros | vazio, preenchido |
| S12 | Rotina | `/app/rotina` | ordem AM/PM gerada, frequência (ex.: retinoide 3x/sem), **conflitos** | ordered steps, drag reorder, conflict badge | sem produtos, conflito crítico |
| S13 | Conflito (sheet) | modal | explica par conflitante e sugestão (alternar noites, separar AM/PM) | bottom sheet | — |
| S14 | Diário / Evolução | `/app/evolucao` | gráficos por métrica, fotos lado a lado, timeline | line chart, before/after slider, calendar | <2 scans (vazio), preenchido |
| S15 | Check-in diário | modal | como a pele está hoje, reações, sono/água opcional | emoji scale, chips | — |
| S16 | Perfil / Config | `/app/perfil` | dados do quiz, assinatura, privacidade, exportar/excluir dados | lista settings | — |
| S17 | Privacidade/Consentimento | no onboarding + `/app/perfil/privacidade` | consentimento LGPD p/ foto facial (dado sensível) | checkbox, texto | recusado → bloqueia scan |

## 5. Fluxos
```
F01 Primeiro uso → valor
    S01 → S02 (≈8 passos) → S03 → S04 → S05 (trial) → S17 → S07 → S08 → S06
    edge: recusa câmera, recusa consentimento, abandona no paywall
    meta: ≤ 12 toques até o 1º resultado

F02 Montar armário
    S06 FAB → S09 → (IA extrai INCI) → S10 confirmar → S11
    edge: rótulo em outra língua, foto borrada, produto duplicado, sem INCI visível

F03 Gerar rotina e ver conflitos
    S11 → S12 (auto-ordenação) → S13 em conflito → aceitar sugestão
    edge: 0 produtos, só produtos AM, gestante + retinoide (alerta forte)

F04 Rotina diária
    S06 → marcar passos AM/PM → S15 check-in
    edge: pulou dia (streak), lembrete push

F05 Re-scan semanal / evolução
    S06 lembrete → S07 → S08 (delta vs. último) → S14
    edge: luz diferente (normalizar/avisar), maquiagem detectada

F06 Assinatura
    S05 → checkout → ativo; S16 → cancelar/portal
    edge: trial expira, pagamento falha
```

## 6. Componentes
| componente | variantes | estados | telas |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, destructive | default, loading, disabled | todas |
| Option card (quiz) | single, multi | selected | S02 |
| Stepper/progress | — | — | S02 |
| Score ring | grande, mini | animando | S06, S08 |
| Metric bar | com delta ↑↓ | bom/médio/atenção | S08, S14 |
| Face zone map | — | zona destacada | S08 |
| Camera overlay | rosto (oval), rótulo (retângulo), barcode | luz ok/ruim, alinhado | S07, S09 |
| Product card | compacto, detalhe | AM/PM tag, conflito | S10–S12 |
| Ingredient chip | ativo, neutro, alerta | — | S10, S13 |
| Routine step | check, drag | feito, pendente, conflito | S06, S12 |
| Conflict badge / sheet | aviso, crítico | — | S12, S13 |
| Line chart | multi-série | vazio | S14 |
| Before/after slider | — | — | S14 |
| Plan card (paywall) | mensal, anual (destaque) | selecionado | S05 |
| Bottom sheet, Toast, Bottom nav (Hoje/Rotina/+/Evolução/Perfil) | — | — | global |

## 7. Modelo de dados inferido
```
User          id, email, created_at                                  conf: alta
SkinProfile   user_id, skin_type (seca|oleosa|mista|normal|sensível), concerns[],
              age_range, city/climate, pregnant_or_nursing, budget     evid: S02  conf: alta
Consent       user_id, kind (facial_photo|marketing), granted_at, revoked_at   evid: LGPD  conf: alta
FaceScan      id, user_id, image_path (bucket privado), taken_at, lighting_quality,
              status (pending|done|rejected), overall_score            evid: S07/S08  conf: alta
ScanMetric    scan_id, metric (texture|redness|pores|fine_lines|spots|oiliness|hydration),
              score 0–100, zones (json)                                  conf: média (definição nossa)
Product       id, user_id, brand, name, category (cleanser|toner|serum|moisturizer|spf|...),
              image_path, barcode?, inci_raw, period (am|pm|both), frequency, opened_at?   evid: S09/S10
Ingredient    id, inci_name, family (retinoid|aha|bha|vit_c|niacinamide|bpo|peptide|...),
              flags (photosensitizing, pregnancy_caution)               base curada nossa
ProductIngredient product_id, ingredient_id, position
ConflictRule  family_a, family_b, severity (info|warn|critical), advice   base curada (determinística, não IA)
Routine       id, user_id, period (am|pm), generated_at, version
RoutineStep   routine_id, product_id, order, days_of_week[]
RoutineLog    user_id, date, period, step_ids_done[]
CheckIn       user_id, date, feeling (1–5), reactions[], notes
Subscription  user_id, provider, status (trialing|active|past_due|canceled), plan, period_end
```
Decisão-chave: **ordem e conflitos = motor de regras determinístico** sobre `Ingredient.family`; IA só extrai INCI e analisa foto. Reduz alucinação e risco.

## 8. O que NÃO clonar / limites
| item | motivo |
| --- | --- |
| Base de alimentos / depth sensor do Cal AI | irrelevante p/ skincare; depth só nativo |
| Diagnóstico dermatológico (acne grau X, rosácea, melasma, "lesão") | ato médico — app é **cosmético/bem-estar**, sempre com disclaimer "não substitui dermatologista" |
| Recomendar medicamento (tretinoína, ácidos >% de venda livre) | regulado (ANVISA/CFM) |
| Base INCI de terceiros licenciada (ex.: INCIDecoder, CosDNA) | não raspar; montar base própria (~300 ingredientes cobrem a maioria) |
| Marca/logo/copy Cal AI | clean-room |
| Fotos faciais | dado biométrico/sensível (LGPD art. 11): consentimento explícito, bucket privado, exclusão sob demanda, não treinar modelo sem opt-in |

## 9. Tamanho
- 17 telas, 6 fluxos, 13 entidades.
- Difíceis: (1) **qualidade/consistência do scan** (luz, ângulo → métricas comparáveis no tempo); (2) **extração confiável de INCI** de rótulo (curvo, multilíngue); (3) **base de ingredientes + regras de conflito** curada; (+) LGPD de foto facial; pagamentos (Stripe/Mercado Pago, Pix).
- **Tamanho: M** (algumas semanas p/ MVP web).
