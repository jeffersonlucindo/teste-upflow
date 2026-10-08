# Evidência — Task #L2-7 — Rotas

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
`src/app/page.tsx` reescrito com `h1` e os dois `<Suspense>` (barra de filtros com fallback desabilitado; resultados com skeleton), mais `ErrorState` e `src/app/error.tsx` para falha de API e token ausente. Commits `baa00fc` e `011b15f`.

## Tasks de execução realizadas
- [x] 7.1 `src/app/page.tsx` com `h1` e os dois `<Suspense>`
- [x] 7.2 `src/components/ui/ErrorState.tsx` + `src/app/error.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/app/page.tsx` | alterado | `HomePage` sem `await`; `ListingTransition` com `FilterBarLoader` e `MovieResults` sob `<Suspense>` |
| `src/components/ui/ErrorState.tsx` | criado | `EmptyState` de alerta; mensagem do erro só em desenvolvimento; "Tentar novamente" com `router.refresh()` + `reset()` |
| `src/components/ui/ErrorState.test.tsx` | criado | 4 testes (commit `73a94ba`) |
| `src/app/error.tsx` | criado | Fronteira de erro do segmento, renderiza `ErrorState` |

## Decisões técnicas
Decisões 4 (dois `<Suspense>`, `searchParams` sem `await` na página) e 13 (erro). Os docs do Next 16.4 recomendam `retry()` em vez de `reset()`; o contrato do design foi mantido e verificado no browser (recupera sem recarregar). Trocar para `retry` fica como pendência, pois muda o contrato que o `detalhe-filme` reutiliza.

## Resultado
`/` compila como rota dinâmica sem token e sem rede. Com token ausente, o erro nomeia `TMDB_API_READ_TOKEN` em dev e o `Header` permanece visível.

## Observações
Os estados de erro de API e de token ausente foram verificados manualmente em `next dev`; não há cobertura E2E para eles.
