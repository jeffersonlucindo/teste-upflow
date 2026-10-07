# Listagem de filmes populares com paginação — Resumo de Implementação

**Parent item:** L2
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
A tela inicial `/` lista os filmes populares do TMDB em grid de cards (2 colunas no celular, `auto-fill` de 200 px a partir de `sm`), com paginação por links Anterior, "Página X de N" e Próxima, tudo dirigido pela URL. Página acima do total mostra um estado vazio com link para a última página; carregando, vazio, erro de API e token ausente têm estado próprio. O build funciona sem token e sem rede, e `/` é `◐` com `CATALOGO_CACHE_COMPONENTS=1`. A QA terminou `advisory-only`, com 38 testes E2E passando e nenhum pulado.

## Tasks realizadas
- **L2-1: Inspeção da base** — leitura do que os changes anteriores deixaram e dos docs do Next usados.
- **L2-2: URL como única fonte** — `src/lib/listing/params.ts` com 29 testes.
- **L2-3: Formatadores** — nota "7,2" e ano sem `Date`, 11 testes.
- **L2-4: UI compartilhada** — `EmptyState`, `MovieCard`, `MovieGrid` e `MovieGridSkeleton`.
- **L2-6: Transição, paginação e resultados** — `ListingTransition`, `Pagination` e `MovieResults`.
- **L2-7: Rotas** — `page.tsx` com dois `<Suspense>`, `ErrorState` e `error.tsx`.
- **L2-8: Verificação no browser e nos dois modos** — populares, estados, 390 e 1280 px, build e `next dev` com a flag (task 8.7), E2E e layout.
- **L2-9: Registro** — `components.md`, `decisoes.md` e `backlog.md`.
- **L2-10: Validação** — `npm run test` com 17 arquivos e 180 testes verdes.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/listing/params.ts` (+ teste) | criado | Parser e montadores de href da URL da listagem |
| `src/lib/format/rating.ts`, `releaseYear.ts` (+ testes) | criado | Nota pt-BR e ano de lançamento |
| `src/components/ui/EmptyState.tsx`, `ErrorState.tsx` (+ testes) | criado | Estados vazio e de erro |
| `src/components/movies/MovieCard.tsx`, `MovieGrid.tsx`, `MovieGridSkeleton.tsx` | criado | Card, grid e skeleton |
| `src/components/movies/Pagination.tsx`, `ListingTransition.tsx`, `MovieResults.tsx` | criado | Paginação, transição e resultados |
| `src/app/page.tsx`, `src/app/error.tsx` | alterado, criado | Página com os dois `<Suspense>` e fronteira de erro |
| `src/app/globals.css` | alterado | Base de 14 px no corpo (achado de layout do QA) |
| `e2e/listagem-filmes.spec.ts`, `e2e/support/layout.ts`, `playwright.config.ts` | criado, alterado | E2E e layout da listagem |
| `.work/design/components.md`, `decisoes.md`, `.work/backlog.md` | alterado | Registro de contratos |

## Decisões técnicas
D24 (URL como fonte), D17 (página de 1 a 500), D36 e D37 (estados de tela), D42 (dois modos de `cacheComponents`). Ajuste do apply: `await connection()` em `MovieResults`, por causa do `partialPrefetching` com a flag. Ajustes do QA: `role="status"` fora da região `aria-busy` e testes de `ListingTransition` e `ErrorState`.

## Resultado
`/`, `/?page=2` e `/?page=500` listam os populares com pôster `w342`, nota e ano; a paginação respeita os limites. QA: 38 E2E passed e 0 skipped (desktop e mobile); gates de layout verdes; finding baixo em aberto sobre o `h1` em 36 px contra 40 px do README de design. Limites: skeleton e "Carregando gêneros…" conferidos só no HTML do build; erro de API e token ausente verificados manualmente em dev.
