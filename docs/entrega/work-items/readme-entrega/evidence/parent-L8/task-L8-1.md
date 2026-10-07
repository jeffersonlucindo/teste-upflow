# Evidência — Task #L8-1 — Inspeção do estado final

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
Inventário do README deixado pelos cinco changes anteriores, da árvore de `src/`, `scripts/` e `e2e/`, dos scripts npm e dos registros em `.work/design/`. Nenhum arquivo foi alterado. A inspeção mostrou que o README de partida não tinha nenhum id de decisão e que o `design.md` deste change pedia uma estrutura que a regra de README do `config.yaml` proíbe.

## Tasks de execução realizadas
- [x] 1.1 Inventariar o README acumulado pelos finishes 1–5
- [x] 1.2 Inventariar o repositório para Estrutura, Scripts, Flags e Testes
- [x] 1.3 Conferir os registros devidos pelos applies anteriores

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (leitura) | — | Nenhum arquivo alterado; as divergências foram registradas em "Ajustes do apply" do `design.md` |

## Decisões técnicas
A regra de `.work/config.yaml > context › README` (o README trata só do código, sem ids `D<n>`/`L<n>`, sem seção "Processo" e sem citar `.work/`) prevaleceu sobre as decisões 1, 2, 3 e 12 do design, que pediam ids em negrito e as seções "Processo" e "Entrega". A cobertura das decisões passou a ser conferida pelo mapa decisão → seção em "Ajustes do apply".

## Resultado
Listas levantadas: 31 arquivos de teste; nove arquivos com `"use client"` (`NavLink`, `FilterBar`, `ListingTransition`, `FavoriteButton`, `FavoritesBadge`, `FavoritesList`, `ErrorState` e os dois `error.tsx`); `import "server-only"` só em `src/lib/tmdb/client.ts`; dez scripts npm; dependências de runtime `next`, `react`, `react-dom` e `server-only`. Em `decisoes.md`, nenhuma linha "pendente de verificação", D30 com `voteCount`, e `components.md` com `FavoriteMovie`, `BackLinkLoader` e `ListingTransition`. Backlog: L1–L7 `done`, L8 `doing`. Valores lidos das evidências anteriores: D18 confirmado em uma chamada; D19 com `include_video_language=pt-BR,pt,en,null`; not-found do detalhe com HTTP 200 nos dois modos; nenhum corte de D43.

## Observações
Os `.devflow.yaml` arquivados de `listagem-filmes`, `favoritos` e `detalhe-filme` ainda dizem `merge: pending`, embora os PRs 3, 4 e 5 estejam mergeados em `develop`, e o `setup-catalogo` está em `phase: commit`, sem finish. O `decisoes.md` tem 44 decisões (D44, Playwright, entrou depois do propose deste change).
