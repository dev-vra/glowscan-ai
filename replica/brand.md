# Marca — Viço

Fonte da verdade: `replica/design-handoff/design_handoff_vico/` (naming, 3 direções, voz, tokens). Este arquivo registra só o estado da varredura e as checagens.

## Nome
**Viço** ("pele com viço"). Escolhido no handoff (direção 1a). Wordmark "viço" minúsculo, Bricolage 800. Domínio sem cedilha.

| checagem | status |
| --- | --- |
| INPI (classes 9, 42, 44) | **a rodar** — busca.inpi.gov.br |
| EUIPO / WIPO Global Brand DB | a rodar |
| domínio vico.app / usevico.com.br | a rodar (registro.br / registrar) |
| App Store e Play ("Viço", "Vico") | a rodar |
| handles @vico.app / @usevico (IG, TikTok, X) | a rodar |

Checagens de triagem, não liberação jurídica. Antes de gastar com a marca, busca formal com advogado.

## Paleta
Terracota `#B8462F` + sol `#F2B66D` sobre creme `#FFFBF8` (claro) e `#1A1310` (escuro). Família diferente do original (Cal AI: preto/branco) e da marca antiga GlowScan (marrom `#7A5A3C`). Contraste AA verificado no handoff.

## Varredura (2026-10-09)
`python ~/.claude/skills/replica-brand/sweep.py . --config replica/brand.json`
- Corrigido: `package.json` name, comentário do `schema.prisma`, landing, página `/design`, metadata, manifest, favicon, apple-icon, card de compartilhamento, OG image (nova), e-mail do link mágico (`supabase/templates/magic-link.html`).
- Restante: só `.remember/` (logs locais do plugin, fora do git) com o caminho da pasta `glowscan-ai`. O nome do repositório/pasta continua `glowscan-ai` — renomear no GitHub é opcional.

## Pendente fora do código
- Colar o template de e-mail no Supabase (Auth → Email Templates → Magic Link).
- Rodar `node --env-file=.env.local scripts/stripe-setup-vico.mjs` e colar os price IDs no `.env.local`.
