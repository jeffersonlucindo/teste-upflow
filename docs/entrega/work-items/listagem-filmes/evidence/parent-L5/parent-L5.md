# Ordenação por popularidade, nota e data de lançamento — Resumo de Implementação

**Parent item:** L5
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O select "Ordenar por" oferece Popularidade (padrão, omitida da URL), Nota (`/?sort=rating`) e Data de lançamento (`/?sort=release`), troca a URL com `push` e zera a página. Os cortes de votos e de data vêm do `tmdb-client`, sem alteração. Com busca ativa o select fica desabilitado, descrito pelo hint de D14.

## Tasks realizadas
- **L5-5: Select "Ordenar por" e modo busca** — select, `SORT_LABELS` e hint.
- **L5-8: Ordenação no browser** — verificação manual e caso E2E.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | criado | Select de ordenação e modo busca |
| `src/components/movies/FilterBar.test.tsx` | criado | Casos de ordenação e modo busca entre os 18 testes |
| `e2e/listagem-filmes.spec.ts` | criado | Caso de ordenação |

## Decisões técnicas
D13, D14, D15 e D16 (cortes de votos e de data aplicados em `src/lib/tmdb/params.ts`).

## Resultado
QA: E2E 38 passed e 0 skipped (desktop e mobile); gates de layout verdes; finding baixo em aberto sobre o `h1` em `text-4xl`. Não há captura de layout dedicada à ordenação.
