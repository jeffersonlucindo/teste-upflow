# Evidência — Task #L2-6 — Transição, paginação e resultados

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
`ListingTransition` compartilha uma transição entre a barra de filtros e a região de resultados (opacidade reduzida e `aria-busy` enquanto troca), `Pagination` entrega Anterior, "Página X de N" e Próxima por links, e `MovieResults` busca a página da URL e escolhe entre página inexistente, vazio e resultados. Commits `da43c35` e `8984c2d`.

## Tasks de execução realizadas
- [x] 6.1 `src/components/movies/ListingTransition.tsx`
- [x] 6.2 `src/components/movies/Pagination.tsx` + `Pagination.test.tsx`
- [x] 6.3 `src/components/movies/MovieResults.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/ListingTransition.tsx` | criado | Ilha client: contexto de transição, região `aria-busy` e `role="status"` fora da região |
| `src/components/movies/ListingTransition.test.tsx` | criado | 3 testes (adicionados no QA) |
| `src/components/movies/Pagination.tsx` | criado | `nav` "Paginação"; `ButtonLink` com `rel="prev"`/`"next"` e `span aria-disabled` nos limites |
| `src/components/movies/Pagination.test.tsx` | criado | 5 testes |
| `src/components/movies/MovieResults.tsx` | criado | RSC: `fetchListing`, três ramos de tela, contagem em modo busca |

## Decisões técnicas
Decisões 7, 8 e 11. Ajuste do apply: `MovieResults` faz `await connection()` depois do `await searchParams` e antes de `fetchListing`, porque com a flag de `cacheComponents` o `partialPrefetching` alcançava o `new Date()` do `todayUtc()` e o `next dev` reportava `blocking-prerender-current-time` em `/`. Ajuste do QA: o `role="status"` ficou fora da região `aria-busy`, para o anúncio "Atualizando resultados…" não ser adiado por leitores de tela. Plural resolvido nos textos ("5 páginas", "1 resultado").

## Resultado
Paginação por URL (`/?page=2`), com o link de detalhe levando `from` quando há estado de listagem. Testes desta geração: 5 (`Pagination`) e 3 (`ListingTransition`) verdes.

## Observações
Custo do `await connection()`: o resultado da listagem não entra em prefetch por link (não era usado).
