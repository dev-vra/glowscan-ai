# Plano de lançamento — Viço

## Antes (2–3 semanas)
- Lista de espera na landing (hoje o CTA leva ao cadastro; trocar por waitlist se o lançamento for fechado).
- Analytics (Vercel Analytics) e erros (Sentry ou logs do Vercel) ligados antes do 1º usuário.
- 10 beta testers à mão: amigas/conhecidos que já compram skincare, cobrindo fototipos I–VI. Conversa de 15 min após 7 dias de uso.
- Checagens de marca (INPI 9/42/44, domínio, handles) — `replica/brand.md`.
- Revisão jurídica: consentimento LGPD (dado biométrico) e copy sem linguagem de diagnóstico (ANVISA).

## Canais (B2C primeiro)
- TikTok/Reels: "minha pele em 30 dias" com o card compartilhável (sem rosto) e o antes/depois.
- Micro-influencers de skincare BR (5–20k), pagamento por permuta + afiliado.
- SEO de ingredientes: páginas "retinol e ácido pode junto?", geradas a partir de `catalog.ts`.
- Comunidades: r/SkincareAddiction e r/brasil (thread de feedback, não propaganda), grupos de skincare no Facebook/Telegram.
- Product Hunt: liderar com o fix — "o app que liga sua selfie aos produtos do seu armário".

## Lojas
- Listing em `replica/launch/listing.json` (passa no `listing.py`).
- Preparar: screenshots (tamanhos atuais do App Store Connect/Play Console), rótulos de privacidade/Data safety (fotos do rosto = dado sensível, não usado para rastreamento), URLs de privacidade e suporte, classificação etária, conta demo para o revisor com assinatura de teste.
- Hoje o app é web/PWA: loja exige empacotar (Capacitor/TWA) — decidir antes de submeter.

## Depois (B2B, fase 2)
Ligar `FEATURE_FLAGS` quando houver base: `researchConsent` → painel de tendências anonimizado; `studyInvites` → estudos de eficácia patrocinados; `sponsoredSlots` → slots marcados.
