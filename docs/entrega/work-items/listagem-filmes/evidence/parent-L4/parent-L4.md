# Filtro por gênero — Resumo de Implementação

**Parent item:** L4
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O select "Gênero" (padrão "Todos") é alimentado por `FilterBarLoader`, um componente de servidor que faz `await connection()` antes de `getGenres()`. Escolher um gênero faz `router.push` para `/?genre=<id>` e zera a página; um gênero sem filmes mostra "Nenhum filme encontrado" com "Limpar filtros". A QA fez o select mostrar a escolha durante a transição (`useOptimistic`), para não voltar a "Todos" em rede lenta.

## Tasks realizadas
- **L4-5: Select de gênero e FilterBarLoader** — select, loader e casos de unidade.
- **L4-8: Filtro por gênero no browser** — verificação manual e casos E2E.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | criado | Select de gênero com valor otimista |
| `src/components/movies/FilterBarLoader.tsx` | criado | RSC que busca os gêneros |
| `src/components/movies/FilterBar.test.tsx` | criado | Casos de gênero entre os 18 testes |
| `e2e/listagem-filmes.spec.ts` | criado | Casos de gênero e de navegação pendente |

## Decisões técnicas
D22 (gêneros em RSC sob `<Suspense>`) e a decisão 6 do `design.md`; `useOptimistic` no ajuste do QA.

## Resultado
QA: E2E 38 passed e 0 skipped (desktop e mobile); gates de layout verdes; finding baixo em aberto sobre o `h1` em `text-4xl`. Capturas: `desktop-vazio.png` e `mobile-vazio.png` em `evidence/layout/`. Limite: o fallback "Carregando gêneros…" foi conferido só no HTML do build.
