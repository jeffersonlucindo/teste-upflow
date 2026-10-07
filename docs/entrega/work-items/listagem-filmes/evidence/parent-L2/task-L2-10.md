# Evidência — Task #L2-10 — Validação

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` passaram, o build sem `.env.local` e sem rede. A task vale também para L3, L4 e L5 (as tasks 10.1 a 10.3 carregam os quatro ref tokens). A 10.3 confere que a 8.7 está registrada (resumo na evidência da task L2-8) e regenera o HTML do change.

## Tasks de execução realizadas
- [x] 10.1 Rodar comandos de validação existentes: `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- [x] 10.2 Rodar testes existentes: `npm run test`
- [x] 10.3 Conferir que a task 8.7 foi registrada na evidência e regenerar o HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/changes/listagem-filmes/tasks.md` | alterado | Task 10.3 marcada `[x]` nesta fase |
| `.work/changes/listagem-filmes/.devflow.yaml` | alterado | `completed_tasks` 29 de 29, `phase: evidence` e bloco `evidence` |

## Decisões técnicas
Pilar 7: o build passa sem token e sem rede, pois nenhuma página lê o TMDB durante o build.

## Resultado
`npm run test`, rodado na geração desta evidência: 17 arquivos e 180 testes verdes. Dos 85 testes novos: `lib/listing/params` 29, `lib/format/rating` 5, `lib/format/releaseYear` 6, `ui/EmptyState` 5, `ui/ErrorState` 4, `movies/MovieCard` 10, `movies/FilterBar` 18, `movies/Pagination` 5 e `movies/ListingTransition` 3; os outros 95 são os do `NavLink`, do `Button` e de `src/lib/tmdb/`. A última validação registrada em `.devflow.yaml` foi `passed`, sem falhas, em 2026-10-07T13:53:54Z. A QA rodou `npm run check` (180 testes) e o build, ambos verdes.

## Observações
Não foi rodado `npm run build` nem `npm run e2e` na geração desta evidência: os números de build e E2E vêm do `.devflow.yaml > qa`. O HTML do change foi regenerado com `htmlgen.mjs` ao fechar a 10.3.
