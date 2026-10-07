# Busca por título — Resumo de Implementação

**Parent item:** L3
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O campo "Buscar por título" do `FilterBar` aplica a busca depois de 350 ms sem digitação (`router.replace`, uma entrada de histórico), ou na hora com Enter. A URL ganha `q`; gênero e ordenação ficam desabilitados com um hint e saem da URL, porque a API não os combina com a busca (D14). Busca sem resultado mostra "Nenhum filme encontrado para “…”" com "Limpar busca". A QA corrigiu o texto órfão no campo quando uma busca é superada por outra navegação.

## Tasks realizadas
- **L3-5: FilterBar, busca com debounce e teste** — `FilterBar.tsx` e 18 testes de unidade.
- **L3-8: Busca por título no browser** — verificação manual e casos E2E.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | criado | Formulário `role="search"`, debounce e sincronização com a URL |
| `src/components/movies/FilterBar.test.tsx` | criado | 18 testes com timers falsos |
| `e2e/listagem-filmes.spec.ts` | criado | Casos de busca, em desktop e mobile |

## Decisões técnicas
D14, D25 (debounce com `replace`) e D26 (transição sem skeleton). Ajuste do QA: o efeito de sincronização do campo roda a cada URL nova depois que a transição assenta.

## Resultado
QA: E2E 38 passed e 0 skipped (desktop e mobile); gates de layout verdes; finding baixo em aberto sobre o `h1` em `text-4xl`. Capturas em `evidence/layout/`: `desktop-busca.png`, `mobile-busca.png`, `desktop-sem-resultado.png` e `mobile-sem-resultado.png`.
