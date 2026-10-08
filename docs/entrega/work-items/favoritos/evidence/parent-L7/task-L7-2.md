# Evidência — Task #L7-2 — Store de favoritos

**Parent item pai:** #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
**Data:** 2026-10-07

## Resumo
`src/lib/favorites/store.ts` define a chave `catalogo.favorites.v1`, o payload `{ version: 1, items }`, os type guards sem biblioteca, as funções puras (`parseFavorites`, `serializeFavorites`, `sortFavorites`, `toggleInFavorites`, `toFavoriteSnapshot`) e `createFavoritesStore` com referência estável, evento `storage` e fallback em memória. Commit `8d79c92`.

## Tasks de execução realizadas
- [x] 2.1 Tipos, constantes e type guards
- [x] 2.2 Funções puras
- [x] 2.3 `createFavoritesStore` e `favoritesStore`
- [x] 2.4 `src/lib/favorites/store.test.ts`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/favorites/store.ts` | criado | Constantes, `FavoriteMovie`/`FavoriteSnapshot`, guards, funções puras e `createFavoritesStore` (`getSnapshot`, `getServerSnapshot`, `write`, `toggle`, `subscribe`) |
| `src/lib/favorites/store.test.ts` | criado | 60 testes: guards, parse, serialização, snapshots de `MovieSummary`/`MovieDetail`/objeto com extras, toggle, store, evento `storage`, payload corrompido e fallback |

## Decisões técnicas
D29 (referência estável: `getSnapshot` só reparseia quando o texto bruto muda; lista vazia é `EMPTY_FAVORITES`), D30 (snapshot com `voteCount`, acrescentado no propose porque `MovieCardData.voteCount` é obrigatório para "Sem nota"), D32 (`try/catch`, fallback em memória, evento `storage` só para a chave ou `key: null`). Decisões 2 a 4 do `design.md`. `Date.now()` só como parâmetro padrão de `toggle`; `window` nunca no nível do módulo.

## Resultado
Payload com `version` diferente, JSON inválido ou item inválido vira lista vazia ou descarta só o item, sem lançar; `id` repetido fica com o maior `savedAt`; chaves extras são removidas na releitura. `localStorage` bloqueado ou com cota estourada continua funcionando em memória. Os 60 testes passam.

## Observações
Sem tela própria; o comportamento no browser está em L7-6.
