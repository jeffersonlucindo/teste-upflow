# `.work/design/` — fonte de design do projeto

> Índice lido pelo hook `design_context` (`.work/config.yaml > hooks.design_context.fallback`).
> Comandos `explore`, `propose` e `apply` começam por aqui quando o trabalho envolve UI.
> O protótipo é **inspiração**, não precisa ser seguido pixel a pixel; os **tokens** são a parte
> que deve ser respeitada.

## Mapa da pasta

| Caminho | O que é | Origem |
|---|---|---|
| `screens/Main.dc.html` | Tela **Listagem — Filmes populares** (rota `/`) | Export do Claude Design (2026-10-06) |
| `screens/Detalhe.dc.html` | Tela **Detalhe** (rota `/movie/[id]`) | idem |
| `screens/Favoritos.dc.html` | Tela **Meus favoritos** (rota `/favoritos`) | idem |
| `screens/support.js`, `screens/vendor/` | Runtime que renderiza os `.dc.html` no browser (React). Não faz parte do design. | idem (deduplicado dos 3 exports) |
| `screens/README-export.md` | Nota do exportador: como ler/visualizar um `.dc.html` | idem |
| `screens/pdf/*.png` | Recortes das três telas do **PDF original** do teste | `Teste Técnico Desenvolvedor Frontend.pdf` |
| `tokens/tokens.json` | Design System **"Catálogo."**: 14 tokens de cor, tema escuro único | cópia de `reference/catalogo-filmes/design/` |
| `tokens/README.md` | Princípios, mapa de uso por elemento, contraste WCAG, uso no Tailwind | idem |
| `decisoes.md` | **Decisões técnicas** D1–D43 (decisão, alternativas, trade-off, onde registrar) | `/devflow:explore` de 2026-10-06 |
| `components.md` | **Inventário de componentes** (pasta, tela, server/client, tokens, props, estados) e fronteira server × client | idem |
| `reference/catalogo-filmes/` | Bundle gerado pelo Claude Design junto com as telas. **Referência visual apenas**: código, changes OpenSpec e workflow dele não são baseline (ver seção abaixo). Fora do git. | gerado em 2026-10-06, 1 commit |

## Como visualizar o protótipo HTML

Os `.dc.html` carregam scripts; alguns browsers bloqueiam via `file://`. Sirva a pasta:

```bash
cd .work/design/screens && python -m http.server 8080
# http://localhost:8080/Main.dc.html  (links entre telas funcionam)
```

Os valores de design (cores, tamanhos, espaçamentos, raios) estão nos `style="…"` inline e no
bloco `<helmet><style>` de cada arquivo. O markup usa `{{var}}`, `<sc-for>` e `<sc-if>` como
placeholders de dados; a lógica de preview fica no `<script type="text/x-dc">` ao final.

## Telas × rotas × requisitos

| Tela | Rota | Requisitos do `.work/backlog.md` | Estados visíveis no protótipo |
|---|---|---|---|
| Listagem | `/` | L2 paginação · L3 busca · L4 gênero · L5 ordenação · L7 coração no card | header com badge de favoritos; 8 cards; paginação Anterior / Página 1 de N / Próxima |
| Detalhe | `/movie/[id]` | L6 sinopse, nota, elenco, trailer · L7 botão "Adicionar aos favoritos" | "← Voltar à listagem"; nota de fallback de idioma na sinopse; trailer só quando houver vídeo |
| Favoritos | `/favoritos` | L7 página de favoritos | título + "Os filmes salvos ficam neste navegador."; cards com coração ativo |

Estados que o protótipo **não desenha** (loading/skeleton, busca sem resultado, erro de API, filme
sem pôster, elenco sem foto, mobile 390 px) estão decididos em `components.md > Estados que o
protótipo não desenha`. Observação: `Favoritos.dc.html` desenha o vazio de favoritos (`sc-if noFavs`),
que é a base visual do `EmptyState`.

## Tokens de cor (resumo de `tokens/tokens.json`)

| Token | Valor | Uso |
|---|---|---|
| `bg-base` | `#121316` | fundo da página e do header |
| `bg-overlay` | `#15161a` | botão circular de favoritar sobre o pôster |
| `surface-100` | `#1c1e23` | inputs, selects, nav ativa, botão secundário, área do trailer |
| `surface-200` | `#23262c` | cards, placeholder de pôster/foto, chip de nota |
| `border-subtle` | `#2a2d34` | divisor do header, bordas de inputs/cards, fundo do badge |
| `border-strong` | `#3a3e47` | borda do botão outline (Anterior) |
| `text-primary` | `#ececef` | títulos, nomes, texto de botões neutros |
| `text-secondary` | `#cfd1d6` | texto corrido (sinopse) |
| `text-muted` | `#a3a6ad` | labels, metadados, nav inativa, "Página 1 de N" |
| `text-subtle` | `#6e727b` | rótulo "Pôster" (contraste 3.1:1, só texto não essencial) |
| `accent` | `#f2b84b` | ação primária, coração ativo, ponto do logo. **Único acento.** |
| `on-accent` | `{bg-base}` | texto/ícone sobre `accent` |
| `focus-ring` | `{accent}` | anel de foco (2 px, offset 2 px) |
| `upflow-blue` | `#1328db` | marca UpFlow; não aparece na UI do catálogo |

## Tipografia e medidas (lidas de `screens/Main.dc.html`)

- **Display**: Plus Jakarta Sans 700/800 — logo 20 px; `h1` 40 px / 1.1 / -0.01em.
- **Corpo**: IBM Plex Sans 400/500/600 — base 14 px; label 13 px 600; título do card 15 px 600; meta 13 px.
- **Container**: `max-width: 1200px`; nav `16px 40px`; main `32px 40px 56px`; gap vertical 24 px.
- **Controles**: altura 44 px (alvo mínimo de toque), raio 8 px, borda 1 px `border-subtle`, fundo `surface-100`.
- **Grid**: `repeat(auto-fill, minmax(220px, 1fr))`, gap `24px 20px`; card raio 12 px, pôster `aspect-ratio: 2/3`; botão de favorito 40 px circular a 10 px do canto.
- **Botões**: primário `accent` + `on-accent`, sem borda; outline `bg-base` + `border-strong`; ambos `min-height: 44px`, padding `0 20px`, raio 8 px, peso 600.
- **Preview**: 1280 × 1420 (desktop). Não há artboard mobile.

## Regras de uso

1. No código, **nunca** hex/rgb/hsl literal: traduza cada valor inline do protótipo para o token
   correspondente (`tokens/README.md > Mapa de uso`).
2. `accent` só para ação primária, favorito ativo e o ponto do logo.
3. Bordas e diferença de superfície separam áreas; o protótipo não usa sombras.
4. Acessibilidade herdada do protótipo: elementos nativos, `aria-label` em botões só com ícone,
   `aria-pressed` no toggle de favorito, `aria-current="page"` na nav, foco visível em `accent`.
5. Dois contrastes abaixo do WCAG vêm do protótipo (`text-subtle`, `border-strong`). Decisão D34
   em `decisoes.md`: mantidos, com `text-subtle` só em texto decorativo (`aria-hidden`) e placeholder
   de input em `text-muted`. Registrado no README de entrega.

## Sobre `reference/catalogo-filmes/`

Bundle gerado pelo Claude Design junto com as três telas. Vale **somente como referência visual**
(as telas em `docs/prototype/` dele são as mesmas de `screens/`; os tokens em `design/` dele são os
mesmos de `tokens/`). O resto não é baseline deste repo, por decisão do explore de 2026-10-06:

- O shell Next (`src/`, `package.json`, `next.config.ts`, `scripts/check-tokens.mjs`) não é copiado.
  O scaffold é feito do zero com `create-next-app@16.4.0` (D3) e cada arquivo nosso segue o padrão
  de `.work/config.yaml > context` e `components.md`.
- Os cinco changes em `openspec/changes/` e o workflow OpenSpec (`.claude/commands/opsx/`,
  `.claude/skills/openspec-*`) não são o fluxo deste repo (aqui é o devflow-core). As decisões
  deste repo estão em `decisoes.md`, tomadas e justificadas por nós.
- Tem `.git/` próprio (1 commit). A pasta fica fora do git do projeto (D8).

## `.gitignore` (decidido, D8)

```
.work/design/reference/
```
