# Evidência — Task #L2-2 — URL como única fonte (`src/lib/listing/`)

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
`parseListingParams`, `buildListingSearch` e `buildListingHref` fazem da URL (`q`, `genre`, `sort`, `page`) a única fonte do estado da listagem, com a regra D14 (busca descarta gênero e ordenação) nos dois sentidos. Commit `aadcc0b`.

## Tasks de execução realizadas
- [x] 2.1 `src/lib/listing/params.ts`
- [x] 2.2 `src/lib/listing/params.test.ts`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/listing/params.ts` | criado | Parser e montadores de href, sem `server-only` nem `next/*` |
| `src/lib/listing/params.test.ts` | criado | 29 testes: padrões, chaves válidas e inválidas, array do Next, D14, ordem das chaves, round-trip |

## Decisões técnicas
D24 (URL como fonte), D14 (busca exclusiva), D17 (página 1 a 500 por `clampPage`). Primeira ocorrência de cada chave, `trim` na busca, padrões omitidos, ordem fixa das chaves.

## Resultado
`buildListingHref(DEFAULT_LISTING_QUERY)` é `/`; `page=501` vira 500, `page=abc` vira 1, `genre=abc` é descartado. `npm run test` (esta geração): 29 testes verdes neste arquivo.

## Observações
Nenhuma.
