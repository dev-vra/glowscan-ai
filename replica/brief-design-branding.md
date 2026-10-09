# Brief — GlowScan AI (nome provisório) · UI/UX + Branding

> Documento de handoff para designer. Versão 1 — 2026-10-09.
> O app já existe e funciona (web mobile-first). O pedido é **redesenhar a experiência e criar a marca**, não inventar o produto.

---

## 1. O app em uma frase
**Um dermatologista de bolso:** você tira uma selfie, a IA lê sua pele, você fotografa os rótulos dos produtos que já tem, e o app monta sua rotina de manhã e de noite — na ordem certa, avisando o que não pode misturar — e mostra sua pele melhorando semana a semana.

## 2. O problema
- Brasileira(o) compra muito cosmético (o Brasil é um dos maiores mercados de beleza do mundo) e **não sabe usar junto**: "posso passar retinol com vitamina C?", "qual vai primeiro?", "esse ácido pode de dia?".
- Dermatologista é caro e a consulta é rara; TikTok dá conselho contraditório.
- Ninguém acompanha o resultado: a pessoa troca de produto sem saber se o anterior funcionava.

## 3. Como funciona (fluxo principal)
1. **Onboarding-quiz** — tipo de pele, preocupações (manchas, acne, poros, linhas, oleosidade…), faixa etária, gestante/lactante, orçamento mensal, cidade.
2. **"Seu plano" gerado** — sensação de personalização antes de pedir pagamento.
3. **Paywall** com teste grátis.
4. **Consentimento LGPD** explícito para foto do rosto (dado biométrico).
5. **Scan do rosto** — câmera com guia de enquadramento + checagem de luz e maquiagem.
6. **Resultado** — Skin Score (0–100) + 7 métricas: textura, vermelhidão, poros, linhas finas, manchas, oleosidade, hidratação; resumo em linguagem simples.
7. **Armário de produtos** — fotografa o rótulo → IA lê a lista de ingredientes (INCI) → produto cadastrado.
8. **Rotina AM/PM gerada** — ordem correta de aplicação, frequência por ativo (ex.: retinol 3x/semana), **alertas de conflito** (crítico / atenção / dica), alerta gestante e fotossensibilizante.
9. **Dia a dia** — checklist da rotina com sequência de dias (streak), check-in de como a pele está, re-scan semanal.
10. **Evolução** — gráficos por métrica e **antes/depois lado a lado**.

## 4. Telas existentes (para redesenhar)
| Código | Tela | Rota |
|---|---|---|
| S01–S05 | Onboarding-quiz + plano | `/onboarding`, `/onboarding/plano` |
| S06 | Entrar (link mágico / Google) | `/entrar` |
| — | Paywall / assinatura | `/assinar` |
| — | Consentimento | `/app/consentimento` |
| S07 | Câmera do scan | `/app/scan/rosto` |
| S08 | Resultado do scan | `/app/scan/[id]` |
| — | Home (Skin Score em anel + rotina do dia) | `/app` |
| S09–S11 | Armário, novo produto (rótulo), detalhe | `/app/produtos…` |
| S12 | Rotina AM/PM + conflitos | `/app/rotina` |
| — | Evolução | `/app/evolucao` |
| — | Perfil, exportar/excluir dados | `/app/perfil` |
| — | Design system atual (referência) | `/design` |

**Estados obrigatórios por tela:** vazio, carregando, erro, sucesso; scan rejeitado (luz ruim, maquiagem, rosto fora do quadro); conflito crítico.

## 5. Público
**Primário — "a curiosa organizada"**
- Mulher, 22–38, classes A/B/C+, capitais e grandes cidades.
- Tem de 5 a 15 produtos, compra em farmácia (Raia, Drogasil, Pague Menos) e e-commerce (Beleza na Web, Época, Sephora).
- Consome skincare no TikTok/Instagram; conhece "niacinamida", "retinol", mas não sabe combinar.
- Quer resultado visível e sentir que está fazendo certo.

**Secundário**
- Homens 25–40 começando skincare (querem algo simples, sem "frescura").
- Gestantes/lactantes (precisam saber o que evitar — o app avisa).
- Pele acneica adolescente/jovem adulta (com responsável para menores).

**Tom de quem usa:** "quero entender, não quero aula".

## 6. Diferenciais (o que a marca precisa comunicar)
1. **Neutro e honesto** — a IA não é paga por marca; patrocinado sempre marcado.
2. **Feito para o Brasil** — português, reais, produtos de farmácia brasileira, clima/sol daqui.
3. **Detector de conflitos** — o "posso misturar?" respondido na hora.
4. **Prova visual** — evolução e antes/depois, não só promessa.
5. **Privacidade séria** — fotos em armazenamento privado, exclusão em um toque (LGPD).

## 7. Limites (importante para copy e visual)
- **Não é diagnóstico médico.** Nada de "detectamos acne grau 3", "doença", "tratamento". Usar "análise", "cuidado", "rotina". Sinal grave → "procure um dermatologista".
- Não prometer resultado clínico ("elimina manchas em 7 dias").
- Não usar logos, cores, ícones ou textos do app que inspirou a mecânica (Cal AI). Tudo original.
- Diversidade real de tons de pele (Fitzpatrick I–VI) nas imagens e ilustrações — a IA precisa parecer feita para todo brasileiro.

## 8. Modelo de faturamento
**Fase 1 — consumidor (agora)**
- Assinatura com teste grátis. Preço de teste atual: **R$ 10/mês ou R$ 100/ano** (a validar; referência de mercado: R$ 20–30/mês).
- Paywall depois do quiz/primeiro scan (momento de maior desejo).
- Afiliados: link de compra nos produtos recomendados (Amazon, Mercado Livre, Beleza na Web, Época).

**Fase 2 — empresas (com base de usuários)**
- **Painel de tendências** anonimizado (o que preocupa a pele do brasileiro por região/idade) — para marcas como Natura, Boticário, L'Oréal/La Roche-Posay, Eucerin, Sallve, Principia, Creamy.
- **Estudos de eficácia com consumidores reais** — a marca patrocina, usuários testam 4–8 semanas com scans; gera prova para claims.
- **Scan white-label** dentro de apps/sites de farmácias e marcas.
- **Espaço patrocinado** claramente marcado; encaminhamento a dermatologista/teleconsulta.

O design deve deixar espaço futuro para: selo "Patrocinado", botão "comprar", convite para estudo, consentimento opcional de pesquisa.

## 9. Pedido de branding
- **Nome:** "GlowScan AI" é provisório. Propor 5–10 nomes, curtos, pronunciáveis em PT-BR, com .com.br/.app livre e sem conflito no INPI (classes 9, 42, 44).
- **Personalidade:** amiga que entende de pele — confiável como farmácia, gostosa como app de beleza. Nem clínico-frio, nem "influencer".
- **Voz:** você, frases curtas, explica o porquê em uma linha, sem jargão sem tradução, sem emoji em excesso.
- **Logo:** símbolo que funcione como ícone de app (pequeno, legível) + versão horizontal.
- **Paleta:** clara, de pele/luz, com uma cor de destaque; cores de status (crítico/atenção/dica) acessíveis — contraste WCAG AA mínimo; versão dark.
- **Tipografia:** fonte livre (Google Fonts), boa em números (o Skin Score e gráficos são centrais).
- **Ilustração/fotografia:** rostos reais e diversos, texturas de produto, sem pele "photoshopada".

## 10. Pedido de UI/UX
- **Mobile-first** (PWA hoje; app nativo depois) — desenhar em 390×844, com adaptação desktop simples.
- Prioridades de experiência:
  1. **Scan sem fricção** — guia claro, feedback de luz em tempo real, rejeição gentil.
  2. **Resultado que dá vontade de compartilhar** — o "momento uau".
  3. **Rotina como checklist rápido** — abrir, marcar, fechar em 10 s.
  4. **Conflitos que ensinam** sem assustar.
  5. **Evolução** que motive a voltar (card compartilhável de 30 dias).
- Acessibilidade: contraste AA, alvo de toque ≥ 44 px, textos alternativos, não depender só de cor.
- Componentes já mapeados: anel de score, card de métrica, chip de ingrediente, alerta de conflito (3 níveis), passo de rotina, gráfico de linha, comparador antes/depois, câmera com moldura.

## 11. Entregáveis esperados
1. Nome + identidade (logo, paleta com tokens claro/escuro, tipografia, ícone do app).
2. Guia de voz curto (do/don't + 10 exemplos de microcopy).
3. Telas da seção 4 com todos os estados, em Figma.
4. Componentes do design system (tokens: cor, tipo, espaçamento, raio, sombra).
5. Card compartilhável de evolução + 3 telas para loja/landing.

## 12. Stack (para o designer saber o que é viável)
Next.js + Tailwind (tokens CSS), Supabase, Stripe, IA de visão (Claude via Vercel AI Gateway). Qualquer fonte Google, ícones Lucide ou próprios, animações leves em CSS.
