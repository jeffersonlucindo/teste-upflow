# Favoritos: persistência no client e página/aba que liste os favoritos — Resumo de Implementação

**Parent item:** L7
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O usuário favorita filmes pelo coração do card da listagem; a escolha é gravada em `localStorage` (`catalogo.favorites.v1`, payload `{ version: 1, items }`) por um store com type guards próprios, referência estável, evento `storage` entre abas e fallback em memória. `useFavorites()` entrega o estado sem mismatch de hidratação. A aba Favoritos do header mostra o badge com a contagem e `/favoritos` lista os filmes do mais recente ao mais antigo, com o vazio do protótipo e a ação "Explorar filmes".

## Tasks realizadas
- **L7-1: Inspeção da base** — Inspeção do que `setup-catalogo`, `tmdb-client` e `listagem-filmes` deixaram: `MovieCardData` já com `posterPath` e `releaseDate`, o comentário da posição do `FavoriteButton` no `MovieCard`, a assinatura de `useSyncExternalStore` com `getServerSnapshot` e as regras `react-hooks/*` do React Compiler.
- **L7-2: Store de favoritos** — `src/lib/favorites/store.ts` define a chave `catalogo.favorites.v1`, o payload `{ version: 1, items }`, os type guards sem biblioteca, as funções puras (`parseFavorites`, `serializeFavorites`, `sortFavorites`, `toggleInFavorites`, `toFavoriteSnapshot`) e `createFavoritesStore` com referência estável, evento `storage` e fallback em memória.
- **L7-3: Hook useFavorites** — `useFavorites()` lê o store com `useSyncExternalStore` (snapshot do servidor sempre vazio) e expõe `items`, `count`, `hydrated`, `isFavorite` e `toggle`.
- **L7-4: Componentes FavoriteButton, FavoritesBadge e FavoritesList** — Três ilhas client em `src/components/favorites/`: `FavoriteButton` (variantes `icon` e `full`, `aria-pressed`, nome alternando entre "Adicionar aos favoritos" e "Remover dos favoritos"), `FavoritesBadge` (contagem, oculto em 0, nome "N favorito(s)") e `FavoritesList` (nada antes de hidratar, `EmptyState` com coração ou `MovieGrid`).
- **L7-5: Integração: card, header e página** — O `MovieCard` passa a renderizar `<FavoriteButton variant="icon" />` como irmão do `<Link>` do pôster; o `Header` coloca o `FavoritesBadge` dentro do `NavLink` de Favoritos; `/favoritos` vira um RSC estático com `h1`, subtítulo e `FavoritesList`.
- **L7-6: Verificação no browser e nos dois modos** — O critério do change foi verificado em Chromium contra `next dev` com `CATALOGO_CACHE_COMPONENTS=1` (39 verificações, duas execuções seguidas) e o build foi conferido com a flag.
- **L7-7: Registro** — `components.md`, `decisoes.md` e `backlog.md` foram atualizados com o contrato final: `FavoriteButton` aceita `FavoriteMovie`, `FavoritesBadge` com singular e plural, `FavoritesList` com `hydrated`, D30 com `voteCount` e L7 em `doing`.
- **L7-8: Validação** — Os cinco comandos de `apply.validation` passaram, o build sem `.env.local` e sem rede.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/favorites/store.ts` | criado | Store sobre `localStorage`, guards e funções puras |
| `src/lib/favorites/store.test.ts` | criado | 60 testes |
| `src/lib/favorites/useFavorites.ts` | criado | Hook com `useSyncExternalStore` |
| `src/lib/favorites/useFavorites.test.tsx` | criado | 10 testes |
| `src/components/favorites/FavoriteButton.tsx` | criado | Botão `icon` e `full` |
| `src/components/favorites/FavoriteButton.test.tsx` | criado | 9 testes |
| `src/components/favorites/FavoritesBadge.tsx` | criado | Contagem no header |
| `src/components/favorites/FavoritesBadge.test.tsx` | criado | 6 testes |
| `src/components/favorites/FavoritesList.tsx` | criado | Grade ou vazio de favoritos |
| `src/components/favorites/FavoritesList.test.tsx` | criado | 6 testes |
| `src/components/movies/MovieCard.tsx` | alterado | `FavoriteButton` irmão do link do pôster |
| `src/components/movies/MovieCard.test.tsx` | alterado | Botão fora de `a` (11 testes) |
| `src/components/layout/Header.tsx` | alterado | `FavoritesBadge` no `NavLink` |
| `src/app/favoritos/page.tsx` | alterado | RSC estático com `FavoritesList` |
| `e2e/favoritos.spec.ts` | criado | 22 testes E2E e de layout |
| `e2e/shell.spec.ts` | alterado | Gates de layout de `/favoritos` |
| `.work/design/components.md`, `decisoes.md`, `.work/backlog.md` | alterado | Contratos, D30 com `voteCount` e L7 em `doing` |

## Decisões técnicas
D29 (referência estável), D30 (snapshot com `voteCount`), D31 (hidratação sem mismatch: servidor sempre vazio), D32 (storage inválido, bloqueado e evento `storage`), D36 (rota estática), D40 e D43 (testes) e D42 (dois modos de `cacheComponents`; `/favoritos` é `○` nos dois). Ajustes do apply: sem `transition-colors` no coração `icon`; o nome `FavoritosPage` e o `div` sem `overflow-hidden` do `MovieCard` seguem o código instalado.

## Resultado
Favoritar, remover, recarregar e sincronizar duas abas funcionam; payload corrompido, item inválido e `localStorage` bloqueado não quebram a tela. QA `passed`: `functional: pass` (22 arquivos e 272 testes, build verde), E2E 82 passed e 0 skipped (41 desktop, 41 mobile), layout `pass` nos gates a 1280 e 390 px, sem findings em aberto. Capturas em `evidence/layout/` (`favoritos`, `favoritos-carregado`, `favoritos-vazio`, `favoritos-vazio-inicial` e `listagem-com-favoritos`, em `desktop` e `mobile`).
