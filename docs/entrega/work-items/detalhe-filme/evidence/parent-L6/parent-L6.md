# Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver — Resumo de Implementação

**Parent item:** L6
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O usuário abre `/movie/[id]` a partir de um card (ou por link direto) e vê pôster, título, "Ano · Duração · Gêneros", chip de nota, o botão de favorito já pronto do change anterior, a sinopse com fallback de idioma (aviso antes do texto e `lang` no parágrafo quando não está em português), o elenco principal com até 8 pessoas e o trailer do YouTube só quando existe. A rota tem um shell estático com dois `<Suspense>` irmãos (link de volta e dados), por isso o build passa sem token e sem rede nos dois modos de `cacheComponents`. Id inválido ou inexistente cai num not-found com o `Header` visível, falha do TMDB cai num `error.tsx` do segmento, e "Voltar à listagem" preserva a busca, os filtros e a página pelo `?from=` validado.

## Tasks realizadas
- **L6-1: Inspeção da base** — Inspeção dos tipos, de `getMovieDetail`, dos contratos consumidos e dos docs do Next 16.4 instalados; nenhum arquivo alterado.
- **L6-2: Funções puras** — `parseMovieId`, `backHref`, `formatRuntime`, `languageName` e `formatMovieMeta`, com testes e sem `server-only`.
- **L6-3: Componentes de apresentação** — `BackLink`, `RatingChip`, `Overview`, `CastCard`/`CastList`, `TrailerEmbed`, `MovieHeader` (com `FavoriteButton full`) e `DetailSkeleton`.
- **L6-4: Composição server** — `MovieDetails` (valida o id, busca uma vez, `notFound()` em id inválido ou `null`) e `BackLinkLoader` (href de "Voltar" a partir de `searchParams.from`).
- **L6-5: Rotas** — `page.tsx` com `generateMetadata` e dois Suspense, `not-found.tsx` e `error.tsx` em `src/app/movie/[id]/`.
- **L6-6: Verificação no browser e nos dois modos** — `/movie/603`, not-found, três casos da sinopse, trailer e elenco ausentes, "Voltar", 390 e 1280 px, build nos dois modos; spec `e2e/detalhe-filme.spec.ts` (17 testes por projeto) e ajuste do `NavLink` com `<Suspense>` interno.
- **L6-7: Registro** — `components.md`, `decisoes.md` (coluna "Onde" de D21 e D23) e `backlog.md` (L6 em `doing`).
- **L6-8: Validação** — Os cinco comandos de `apply.validation` passaram, o build sem `.env.local` e sem rede.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/tmdb/parseMovieId.ts` e `.test.ts` | criado | Id inteiro positivo antes do fetch (12 testes) |
| `src/lib/listing/backHref.ts` e `.test.ts` | criado | `?from=` normalizado para o href de "Voltar" (12 testes) |
| `src/lib/format/runtime.ts` e `.test.ts` | criado | "2h 16min" (12 testes) |
| `src/lib/format/languageName.ts` e `.test.ts` | criado | Nome do idioma em pt-BR (6 testes) |
| `src/lib/format/movieMeta.ts` e `.test.ts` | criado | "1999 · 2h 16min · Ação, Ficção científica" (5 testes) |
| `src/components/movie-detail/BackLink.tsx`, `RatingChip.tsx` | criado | Link de volta e chip de nota, 44 px |
| `src/components/movie-detail/Overview.tsx` e `.test.tsx` | criado | Sinopse com os três casos de D18 (8 testes) |
| `src/components/movie-detail/CastCard.tsx`, `CastList.tsx` e `CastList.test.tsx` | criado | Elenco em `ul role="list"` (5 testes) |
| `src/components/movie-detail/TrailerEmbed.tsx` e `.test.tsx` | criado | Iframe `youtube-nocookie.com`, seção omitida sem vídeo (4 testes) |
| `src/components/movie-detail/MovieHeader.tsx` e `.test.tsx` | criado | Pôster `w500`, `h1`, meta, nota e `FavoriteButton full` (6 testes) |
| `src/components/movie-detail/DetailSkeleton.tsx` | criado | Skeleton com `role="status"` |
| `src/components/movie-detail/MovieDetails.tsx`, `BackLinkLoader.tsx` | criado | Composição server sob Suspense |
| `src/app/movie/[id]/page.tsx`, `not-found.tsx`, `error.tsx` | criado | Rota, `generateMetadata`, not-found e erro do segmento |
| `src/components/layout/NavLink.tsx` | alterado | Pathname lido sob `<Suspense>` interno (exigido pela flag `cacheComponents`) |
| `e2e/detalhe-filme.spec.ts` | criado | 17 testes E2E e de layout por projeto |
| `.work/design/components.md`, `decisoes.md`, `.work/backlog.md` | alterado | Contratos, coluna "Onde" de D21 e D23 e L6 em `doing` |

## Decisões técnicas
D2 e D42 (mesmo código nos dois modos de `cacheComponents`; `/movie/[id]` é `ƒ` sem a flag e `◐` com ela), D7 e D43 (testes), D18 (fallback de sinopse), D19 e D38 (trailer só quando houver), D21 (erros), D23 e D35 (imagens e 390/1280 px), D36 e D37 (estados de tela) e D39 e D40 (`?from=` e reuso do `FavoriteButton`). Ajustes do apply: o status HTTP do not-found é 200 com `noindex` nos dois modos (o `notFound()` roda depois do início do streaming); `preload` no lugar de `priority` no pôster; `NavLink` com `<Suspense>` interno; o título da aba do filme inexistente é "Filme não encontrado" e "Filme" fica só para erro.

## Resultado
O detalhe funciona em 390 e 1280 px, por teclado e nos dois modos de `cacheComponents`. Validação: `tokens:check` (14 tokens, 84 arquivos), `lint`, `typecheck`, `test` (31 arquivos, 342 testes) e `build` verdes. QA `advisory-only`: `functional: pass`, E2E 114 passed e 0 skipped (57 desktop, 57 mobile), layout `pass` nos gates a 1280 e 390 px, 2 iterações e 3 findings resolvidos. Dois advisory em aberto: o estado de erro sem E2E versionado e a `key` por `member.id` do `CastList`. O anel de foco não aparece no iframe do trailer (limite do navegador). Capturas em `../layout/` (`de-card`, `603-completo`, `not-found`, `sinopse-ingles`, `sem-sinopse`, `sem-elenco`, `skeleton` e `erro`, em `desktop` e `mobile`).
