# Pricing — Viço

## Modelo
- **Um plano, dois ciclos**: R$ 24,90/mês ou R$ 199/ano (= R$ 16,58/mês, 33% de desconto, ~4 meses grátis).
- **Teste de 7 dias** com cartão (`TRIAL_DAYS = 7` em `src/lib/billing.ts`). Um teste por cliente (Stripe customer reaproveitado).
- Sem plano grátis permanente. Valor antes do paywall vem do onboarding + plano personalizado (fix "preço sem valor", 16 reviews / 4 apps).
- Sem tiers: o público é B2C individual; tier extra só confunde. Quem é: "quem compra skincare e quer saber se funciona".

## Concorrentes (preço público)
Preços mudam — preencher lendo a página/listing na data. **Não lido nesta sessão**, então nenhum número abaixo é afirmado.

| app | onde ler | preço | data lida |
| --- | --- | --- | --- |
| Cal AI (referência de mecânica) | App Store, "Compras dentro do app" | a ler | — |
| Skan | apps.apple.com/br — Compras dentro do app | a ler | — |
| FeelinMySkin | apps.apple.com/us/app/id1526044677 | a ler | — |
| Yuka | apps.apple.com/br/app/id1092799236 | a ler | — |

## O que reviewers disseram (feedback.md)
- Preço/paywall sem valor percebido: **16 reviews, 4 apps**.
- Cobrança/cancelamento ("scam"): **8 reviews, 3 apps**.

## Fixes de cobrança no produto
- [x] Cancelar em 1 toque: Perfil → Gerenciar assinatura (portal Stripe).
- [x] Aviso in-app 2 dias antes do fim do teste e quando o pagamento falha (`getBillingBanner`).
- [ ] **E-mail** de fim de teste: ligar em Stripe → Settings → Billing → Subscriptions and emails → "Send emails about upcoming trial endings" (o listing promete "avisamos 2 dias antes").
- [x] Paywall mostra o preço lido do Stripe (nunca diverge do cobrado).

## Stripe (você cria)
Rodar `node --env-file=.env.local scripts/stripe-setup-vico.mjs` → renomeia o produto para "Viço Premium" e cria `vico_monthly` (2490 BRL/mês) e `vico_yearly` (19900 BRL/ano); colar os `STRIPE_PRICE_*` impressos no `.env.local` e no Vercel. Em produção, repetir com a chave live.
