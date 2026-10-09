# Arquitetura — GlowScan AI

## 1. Stack
| camada | escolha | por quê |
| --- | --- | --- |
| web | Next.js App Router + TS (PWA mobile-first) | stack do usuário; PWA dá câmera + push sem loja |
| estilo | Tailwind + tokens (replica-design) | padrão |
| banco | PostgreSQL (Supabase gerenciado) | 1 banco; Storage + Auth no mesmo lugar |
| ORM | Prisma 7 | stack do usuário; schema = fonte de verdade |
| auth | Supabase Auth (magic link, Google, Apple) | pronto, barato |
| arquivos | Supabase Storage, **bucket privado**, URL assinada 5 min | foto facial = dado sensível |
| IA visão | Claude (`claude-sonnet-5-5`) via Vercel AI Gateway + AI SDK, saída estruturada (zod) | multimodal, JSON tipado, fallback de modelo |
| pagamentos | Stripe Checkout + Billing (cartão; Pix p/ anual) | trial nativo, portal do cliente, webhooks |
| e-mail | Resend | magic link custom + lembretes |
| jobs | Vercel Cron | lembretes de re-scan, limpeza |
| hosting | Vercel | zero-config Next |

**Autorização:** Prisma conecta como role de serviço (ignora RLS) → **check `userId` em toda query na camada `lib/data/*`** (helper `requireUser()`). RLS ligada mesmo assim em todas as tabelas sem policies públicas (defesa em profundidade contra o client anon).

## 2. Schema
Fonte de verdade: `replica/schema.prisma` (vira `prisma/schema.prisma` no build). 14 tabelas:
`User, SkinProfile, Consent, FaceScan, ScanMetric, Product, Ingredient, ProductIngredient, ConflictRule, Routine, RoutineStep, RoutineLog, CheckIn, Subscription` + `StripeEvent` (idempotência webhook).

Restrições duras:
- `RoutineLog` unique `(userId, date, period)` → upsert idempotente do checklist.
- `CheckIn` unique `(userId, date)`.
- `ScanMetric` unique `(scanId, metric)`.
- `ConflictRule` unique `(familyA, familyB)` com `familyA < familyB` (check SQL cru).
- `StripeEvent.id` PK = id do evento Stripe → webhook duplicado vira no-op.
- Seed de `Ingredient`/`ConflictRule` via `upsert` (re-executável).
- `FaceScan` só pode ser criado com `Consent(facial_photo)` ativo (checado no server action).

## 3. API (server actions / route handlers)
**F01 onboarding/auth/pagamento**
| rota | faz | quem | in → out |
| --- | --- | --- | --- |
| action `saveOnboarding` | upsert SkinProfile | user | quiz → profile |
| action `grantConsent` / `revokeConsent` | grava Consent | user | kind → ok |
| POST `/api/billing/checkout` | cria Checkout Session (trial 3d) | user | plan → url |
| POST `/api/billing/portal` | portal Stripe | user | → url |
| POST `/api/webhooks/stripe` | sync Subscription | Stripe (assinatura verificada) | event → 200 |

**F05 scan do rosto**
| rota | faz | quem | in → out |
| --- | --- | --- | --- |
| action `createFaceUploadUrl` | URL assinada de upload | assinante + consent | → path,url |
| action `analyzeFace` | IA visão → métricas (0–100, zonas), qualidade de luz, maquiagem? rejeita se inválida | assinante | scanId → FaceScan+metrics |
| GET `/app/scan/[id]` | resultado + delta vs anterior | dono | — |

**F02 produtos**
| rota | faz | quem | in → out |
| --- | --- | --- | --- |
| action `extractLabel` | IA lê rótulo → marca, nome, categoria, INCI[] | assinante | imagePath → draft |
| action `saveProduct` | normaliza INCI → Ingredient (match por nome/alias), grava | dono | draft → product |
| action `updateProduct` / `deleteProduct` | — | dono | — |

**F03/F04 rotina**
| rota | faz | quem | in → out |
| --- | --- | --- | --- |
| action `generateRoutine` | **motor determinístico**: ordena por categoria/textura, aplica frequência, detecta conflitos (ConflictRule), alerta gestante/fotossensível | dono | → Routine+steps+conflicts |
| action `reorderRoutine` | ordem manual | dono | stepIds → ok |
| action `toggleStep` | upsert RoutineLog | dono | date,period,stepId |
| action `saveCheckIn` | upsert CheckIn | dono | — |

**F06 evolução** — leitura server component: séries de ScanMetric por métrica.

**Jobs (Vercel Cron)**
- diário 09:00 BRT: lembrete de re-scan (7 dias desde último) — e-mail/push.
- diário 03:00: apaga scans `rejected` > 24h e arquivos de contas excluídas.

## 4. Pontos que mordem
- **Fuso:** datas de log/check-in em `date` local do usuário (`America/Sao_Paulo` default, salvo no profile); timestamps em UTC.
- **Idempotência:** webhook Stripe (tabela StripeEvent), upserts em logs, seed re-executável.
- **Comparabilidade do scan:** prompt fixo + guia de enquadramento + score de luz; métricas guardam `modelVersion`; avisar quando luz difere muito.
- **Custo/abuso IA:** rate limit por usuário (ex.: 10 scans/dia), redimensionar imagem no client (≤1600px, JPEG) — também evita limite de 4,5 MB do body (upload direto ao Storage).
- **Alucinação:** IA nunca decide conflito/ordem; só extrai. Ingrediente não reconhecido → `unknown`, usuário revisa.
- **Saúde/regulatório:** linguagem cosmética, sem diagnóstico; disclaimer fixo em S08/S12.
- **LGPD:** consentimento explícito, exclusão total (DB cascade + Storage), exportar JSON, não usar fotos p/ treino.
- **Rótulo multilíngue:** INCI é padrão internacional (ajuda); tabela de aliases PT/EN/FR.

## 5. Ordem de build
| marco | entrega | telas | tabelas | rotas |
| --- | --- | --- | --- | --- |
| M1 fatia vertical | login → consentimento → foto do rosto → resultado feio | S04,S17,S07,S08 | User,Consent,FaceScan,ScanMetric | analyzeFace, upload |
| M2 produtos + motor | rótulo → INCI → armário → rotina com conflitos | S09–S13 | Product,Ingredient,ProductIngredient,ConflictRule,Routine,RoutineStep | extractLabel, saveProduct, generateRoutine + seed |
| M3 onboarding + paywall | quiz, plano gerado, Stripe trial | S01–S05 | SkinProfile,Subscription,StripeEvent | checkout, portal, webhook |
| M4 dia a dia + evolução | home score ring, checklist, check-in, gráficos | S06,S14,S15 | RoutineLog,CheckIn | toggleStep, saveCheckIn |
| M5 should/could | push, antes/depois, perfil/exportar/excluir, dark mode | S16 | — | export, deleteAccount, cron |
| M6 | correções do replica-entrepreneur | — | — | — |
