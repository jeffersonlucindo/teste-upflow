# Backlog local — desafio-up-flow

> Lido pelo provider de tracker `none` (`tracker.list_items`, usado por `/devflow:intake`).
> Ids locais `L<n>`, sem auto-link (`providers.none.local_ref: true` exibe `#L<n>` em docs).
> Fonte: `DESAFIO.md`. Atualize a coluna `state` conforme avançar (`todo` · `doing` · `done`).
> A coluna `change` diz qual change entrega o item (sequência abaixo, decidida no explore de 2026-10-06).

| id | title | kind | source | change | state |
|----|-------|------|--------|--------|-------|
| L1 | Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example | setup | DESAFIO.md › Setup | setup-catalogo, tmdb-client | done |
| L2 | Listagem de filmes populares com paginação | requisito | DESAFIO.md › Requisitos Obrigatórios | listagem-filmes | done |
| L3 | Busca por título | requisito | DESAFIO.md › Requisitos Obrigatórios | listagem-filmes | done |
| L4 | Filtro por gênero | requisito | DESAFIO.md › Requisitos Obrigatórios | listagem-filmes | done |
| L5 | Ordenação por popularidade, nota e data de lançamento | requisito | DESAFIO.md › Requisitos Obrigatórios | listagem-filmes | done |
| L6 | Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver | requisito | DESAFIO.md › Requisitos Obrigatórios | detalhe-filme | done |
| L7 | Favoritos: persistência no client e página/aba que liste os favoritos | requisito | DESAFIO.md › Requisitos Obrigatórios | favoritos | done |
| L8 | README com instruções de execução, decisões técnicas e trade-offs | entrega | DESAFIO.md › Entrega | setup-catalogo (esqueleto), readme-entrega | done |
| L9 | Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros | correcao | Revisão da entrega v0.1.0 (2026-10-08) | correcoes-entrega | todo |

## Hierarquia sugerida (parent → tasks)

Cada `L<n>` acima é um **requisito** (item pai). As tasks filhas nascem no `tasks.md` de cada
change criado por `/devflow:propose` e referenciam o pai pelo id.

## Sequência de changes

Decidida no explore (D41 em `.work/design/decisoes.md`). Favoritos vem antes do detalhe: o coração
nasce junto com o card e o detalhe já chega com o `FavoriteButton` pronto. Critério de pronto de
todos: `apply.validation` de `.work/config.yaml` (tokens, lint, typecheck, test, build) mais o que
está na coluna abaixo.

| # | change | requisitos | depende de | critério de pronto (além de `apply.validation`) | dia |
|---|---|---|---|---|---|
| 1 | `setup-catalogo` | L1, L8 (esqueleto) | — | `/` e `/favoritos` renderizam o shell com Header/NavLink e tokens; `npm run build` verde sem `.env.local` e sem rede; `npm run build` com `CATALOGO_CACHE_COMPONENTS=1` também verde; `.gitignore` com `.work/design/reference/`; README com "Como rodar" (só código, sem seção de processo) | 1 |
| 2 | `tmdb-client` | L1 | 1 | testes de `mappers`, `params`, `images`, `pickOverview`, `pickTrailer` com fixtures; uma chamada real resolve as pendências de `decisoes.md` (translations, include_video_language) e a decisão fica registrada no design.md | 1 |
| 3 | `listagem-filmes` | L2, L3, L4, L5 | 2 | os quatro requisitos verificáveis no browser; testes de `parseListingParams`/`buildListingHref`, debounce do FilterBar, limites da Pagination; 390 e 1280 px; `next dev` e `build` com a flag ligada sem insight de blocking-route | 2–3 |
| 4 | `favoritos` | L7 | 3 | favoritar na listagem → aparece em `/favoritos` → remover some; reload mantém; duas abas sincronizam; payload corrompido não quebra; testes do store e do hook; build com a flag ligada | 3–4 |
| 5 | `detalhe-filme` | L6 | 2, 4 | `/movie/603` completo; `/movie/abc` e id inexistente → not-found; sinopse nos três casos; trailer some sem vídeo; "Voltar" preserva filtros; 390 e 1280 px; build com a flag ligada | 4 |
| 6 | `readme-entrega` | L8 | 1–5 | clone limpo + `npm ci` + `.env.local` + `npm run dev` funciona; README com execução, decisões (D1–D44 consolidadas), trade-offs, flags, melhorias futuras (só código: sem seção de processo nem menção ao fluxo); checklist de teclado, contraste, 390/1280; repositório compartilhado | 5 |
| 7 | `correcoes-entrega` | L9 | 1–6 | os defeitos da revisão reproduzidos antes e ausentes depois (corrida busca × gênero, `posterPath` adulterado, `/naoexiste` e `/movie/abc` com 404 em português, `?genre=999999`); README com a URL de clone do repositório de entrega, contagens corretas e a seção "Processo"; `npm run check`, `npm run build` nos dois modos e `npm run e2e` verdes | 6 |

Ordem de corte se faltar prazo: D43 em `.work/design/decisoes.md`.
