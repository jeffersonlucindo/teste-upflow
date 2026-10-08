# Evidência — Task #L6-1 — Inspeção da base

**Parent item pai:** #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
**Data:** 2026-10-07

## Resumo
Inspeção do que os quatro changes anteriores deixaram e dos docs do Next 16.4 instalados: `MovieDetail` e tipos de domínio, `getMovieDetail` (`null` em 404, demais `TmdbError` sobem), `images.ts`, `parseListingParams`/`buildListingHref`, `EmptyState` com o ícone `film`, `ErrorState` com `title?` e `FavoriteButton` na variante `full`. Nenhum arquivo foi criado ou alterado.

## Tasks de execução realizadas
- [x] 1.1 Inspecionar o que os quatro changes anteriores deixaram e os docs do Next 16.4 instalados

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (leitura) | — | Nenhum arquivo alterado; as divergências entre o design e o instalado foram registradas no `design.md` do change |

## Decisões técnicas
D2 (código idêntico nos dois modos de `cacheComponents`) e D42 (verificação nos dois modos), além das premissas de `params`/`searchParams` como Promise e de `notFound()` dentro de Suspense, conferidas nos docs instalados.

## Resultado
O ponto de partida ficou confirmado: `src/app/movie/`, `src/components/movie-detail/` e os formatadores do detalhe não existiam, e a porta TMDB já entregava `MovieDetail` pronto (sinopse e trailer escolhidos, elenco cortado em 8).

## Observações
Uma suposição do design se mostrou errada só mais adiante, na verificação com a flag (task 6.7): o `NavLink` precisou de um `<Suspense>` interno. Está na evidência L6-6.
