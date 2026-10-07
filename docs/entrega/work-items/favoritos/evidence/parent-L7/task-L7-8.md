# Evidência — Task #L7-8 — Validação

**Parent item pai:** #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` passaram, o build sem `.env.local` e sem rede. A 8.3 confere que as tasks 6.1 a 6.6 estão registradas na evidência da task L7-6 (payload inspecionado, duas abas, payload corrompido e resumo do build com a flag) e regenera o HTML do change.

## Tasks de execução realizadas
- [x] 8.1 Rodar comandos de validação existentes: `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- [x] 8.2 Rodar testes existentes: `npm run test`
- [x] 8.3 Conferir que as tasks 6.1–6.6 estão registradas na evidência e regenerar o HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/changes/archive/2026-10-07-favoritos/tasks.md` | alterado | Tasks 8.1 a 8.3 marcadas `[x]` |
| `.work/changes/archive/2026-10-07-favoritos/.devflow.yaml` | alterado | `phase: evidence` e bloco `evidence` |

## Decisões técnicas
Pilar 7: o build passa sem token e sem rede, pois `/favoritos` não lê o TMDB e nenhuma página o lê durante o build.

## Resultado
`npm run test`, rodado na geração desta evidência: 22 arquivos e 272 testes verdes. Dos 91 testes novos do change: `lib/favorites/store` 60, `lib/favorites/useFavorites` 10, `favorites/FavoriteButton` 9, `favorites/FavoritesBadge` 6 e `favorites/FavoritesList` 6; `movies/MovieCard` passou de 10 para 11 testes. Os demais são os de `NavLink` (6), `Button` (7), `EmptyState` (5), `ErrorState` (4), `FilterBar` (18), `Pagination` (5), `ListingTransition` (3), `lib/listing/params` (29), `lib/format` (11) e `lib/tmdb/*` (82).

Última validação registrada em `.devflow.yaml`: `passed`, sem falhas, em 2026-10-07T15:12:07Z (tokens:check, lint, typecheck, test e build verdes; `/favoritos` estática e `/` dinâmica). A QA registrou `functional: pass` (272 testes e build), E2E 82 passed e 0 skipped, layout `pass`, sem findings em aberto.

## Observações
Não foi rodado `npm run build` nem `npm run e2e` na geração desta evidência: os números de build e E2E vêm do `.devflow.yaml`. O HTML do change é regenerado com `htmlgen.mjs` ao fechar a 8.3.
