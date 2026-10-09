# Fixes & ângulo — GlowScan AI

**Amostra:** 216 reviews, 9 apps, só App Store (feed RSS oficial da Apple), coletados 2026-10-09. Apps: Skan, Mary Kay Skin Analyzer, Yuka, Skin Bliss, FeelinMySkin, Puffin, Glow AI, SkinSAFE, Scanner Alimentos e Cosméticos.
**Limites:** Reddit bloqueou a API (403); Google Play sem API oficial; muitos feeds da Apple vieram vazios (OnSkin, INCI Beauty, BasicBeauty). Amostra majoritariamente EUA — temas BR são **thin**. Relatório completo: `feedback.md`.

## 1. O que odeiam
| # | Problema | Reviews | Fontes | Evidência |
|---|---|---|---|---|
| 1 | Paywall/preço sem valor percebido | 16 | 4 | "App costs money just to log your skin care products." (FeelinMySkin, 1★) https://apps.apple.com/us/app/id1526044677?see-all=reviews |
| 2 | Câmera/foto falha no scan | 20 | 8 | "Na hora de avaliar o selfie o app buga" (Glow AI, 1★) https://apps.apple.com/br/app/id6529520298?see-all=reviews |
| 3 | Cobrança/cancelamento ("scam") | 8 | 3 | "SCAM." (Puffin, 1★) https://apps.apple.com/us/app/id6757452275?see-all=reviews |
| 4 | Resultado inconsistente | 9 | 4 | "different results every time you use it." (Mary Kay, 1★) https://apps.apple.com/us/app/id1417941279?see-all=reviews |
| 5 | Produto não encontrado / base fraca fora dos EUA | 10 | 5 | "Countries like South Korea, Japan, and Brazil." (Skin Bliss, 3★) https://apps.apple.com/br/app/id1385561364?see-all=reviews |
| 6 | Recomendação que empurra produto da marca (thin-ish) | 3 | 3 | ver feedback.md |

## 2. O que falta
| # | Pedido | Reviews | Fontes | Evidência |
|---|---|---|---|---|
| 1 | Rotina flexível (frequência, mover passo esquecido) | 13 | 4 | "I would love to be able to roll steps into the next day if they're forgotten" (FeelinMySkin, 4★) https://apps.apple.com/us/app/id1526044677?see-all=reviews |
| 2 | Acompanhar evolução ligada aos produtos | 16 | 3 | "Amazing app to track your product use and correlate to metrics!" (FeelinMySkin, 4★) mesmo link |
| 3 | Saber quais ativos combinam / não exagerar | 5 | 3 | "...so as to not over do it with retinol or a chem..." (FeelinMySkin, 4★) mesmo link |
| 4 | Compartilhar resultado | 4 | 2 | "It does not share the skin summary." (Mary Kay, 4★) https://apps.apple.com/us/app/id1417941279?see-all=reviews |

## 3. O que ninguém resolve (posicionamento)
- **Brasil**: base de produtos e ingredientes de farmácia brasileira (thin na amostra, mas forte como hipótese — validar com reviews Play BR).
- **Ligar análise + produtos + resultado**: apps são ou scanner de rosto (Skan, Mary Kay), ou scanner de rótulo (Yuka, SkinSAFE), ou diário (FeelinMySkin). Nenhum fecha o ciclo.

## 4. Plano de fixes
| Fix | Tamanho | Skill | Evidência |
|---|---|---|---|
| Valor antes do paywall: 1º scan com resultado parcial grátis | M | replica-build | Preço 16/4 |
| Cancelamento em 1 toque + lembrete antes do fim do trial | S | replica-backend | Billing 8/3 |
| Scan robusto: guia de luz em tempo real, mensagens de rejeição gentis, retry | M | replica-build | Câmera 20/8 |
| Consistência: 2 fotos e média, mostrar faixa de confiança | M | replica-backend | Imprecisão 9/4 |
| Rotina: "passo esquecido → mover para amanhã" + ciclos (ex.: a cada 4 semanas) | S | replica-build | Rotina 13/4 |
| Evolução por produto (antes/depois de começar produto X) | M | replica-build | Evolução 16/3 |
| Card compartilhável do resultado / 30 dias | S | replica-build | Compartilhar 4/2 |
| Recomendações neutras + "Patrocinado" sempre marcado | S | replica-build | Empurra produto 3/3 |

## 5. Ângulo
**A (recomendado).** Para quem compra skincare mas não sabe se está funcionando, o GlowScan liga sua pele, seus produtos e seu resultado num só lugar — e mostra a evolução. *Evidência: evolução 16/3 + rotina 13/4 + imprecisão 9/4.*
**B.** Para quem cansou de app que cobra caro e não entrega, o GlowScan mostra valor de graça no 1º scan e cancela em 1 toque. *Evidência: preço 16/4 + billing 8/3.*
**C.** Para o brasileiro que não acha seus produtos em app gringo, o GlowScan entende rótulo de farmácia brasileira. *Evidência: base 10/5 (BR thin).*
