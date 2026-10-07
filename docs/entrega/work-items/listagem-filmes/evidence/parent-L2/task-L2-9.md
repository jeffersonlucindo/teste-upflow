# Evidência — Task #L2-9 — Registro

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
Contratos novos e alterados registrados em `components.md`, redação do hint de D14 em `decisoes.md` e L2 a L5 marcados como `doing` no backlog. Commit `e2b3e82`.

## Tasks de execução realizadas
- [x] 9.1 `components.md` e `backlog.md`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/design/components.md` | alterado | Linha `ListingTransition`; `ErrorState` em `components/ui/` com `title?`; `EmptyState` com `icon`; `toMovieCardData`, `movieGridClassName` e os oito campos de `MovieCardData` |
| `.work/design/decisoes.md` | alterado | Só a redação do hint na linha D14 |
| `.work/backlog.md` | alterado | L2, L3, L4 e L5 em `doing` (o finish marca `done`) |

## Decisões técnicas
Decisão 18 do `design.md`: mudança de contrato atualiza `components.md`.

## Resultado
Os changes `favoritos` e `detalhe-filme` encontram os contratos de `MovieCard`, `MovieGrid`, `EmptyState` e `ErrorState` no estado real.

## Observações
O README ficou intocado neste change.
