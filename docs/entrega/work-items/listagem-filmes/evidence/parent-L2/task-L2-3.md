# Evidência — Task #L2-3 — Formatadores (`src/lib/format/`)

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
`formatVoteAverage` e `formatRating` (nota em pt-BR com uma casa, ou "Sem nota" sem votos) e `releaseYear` (ano por regex, sem `Date`). Commit `8fa5515`.

## Tasks de execução realizadas
- [x] 3.1 `src/lib/format/rating.ts` + `rating.test.ts`
- [x] 3.2 `src/lib/format/releaseYear.ts` + `releaseYear.test.ts`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/format/rating.ts` | criado | `Intl.NumberFormat("pt-BR")` com uma casa; "Nota 7,2" ou "Sem nota" |
| `src/lib/format/rating.test.ts` | criado | 5 testes |
| `src/lib/format/releaseYear.ts` | criado | Extrai os quatro primeiros dígitos; `null` se não houver |
| `src/lib/format/releaseYear.test.ts` | criado | 6 testes |

## Decisões técnicas
Decisão 3 do `design.md`: formatador criado uma vez em constante de módulo; ano por regex para não depender de fuso nem de `Date`.

## Resultado
`7.2` vira "7,2", `8` vira "8,0", nota 0 sem votos vira "Sem nota"; `"1999-03-30"` vira 1999 e `""`, `null` e `"abc"` viram `null`.

## Observações
Nenhuma.
