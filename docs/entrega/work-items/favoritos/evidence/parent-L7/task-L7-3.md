# Evidência — Task #L7-3 — Hook useFavorites

**Parent item pai:** #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
**Data:** 2026-10-07

## Resumo
`useFavorites()` lê o store com `useSyncExternalStore` (snapshot do servidor sempre vazio) e expõe `items`, `count`, `hydrated`, `isFavorite` e `toggle`. `hydrated` vem de um segundo `useSyncExternalStore` (`false` no servidor, `true` no client). Sem `useState`, `useEffect` ou `useRef`, o que atende as regras do React Compiler. Commit `8d79c92`.

## Tasks de execução realizadas
- [x] 3.1 `useFavorites()`
- [x] 3.2 `src/lib/favorites/useFavorites.test.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/favorites/useFavorites.ts` | criado | Hook sobre o `favoritesStore` e `subscribeNoop` para `hydrated` |
| `src/lib/favorites/useFavorites.test.tsx` | criado | 10 testes: vazio, toggle, ordem, sincronização por `StorageEvent`, payload corrompido e referência estável em `rerender` |

## Decisões técnicas
D29 e D31 (nada de `setState` em efeito; o servidor e a primeira renderização do client coincidem, sem mismatch). Decisão 5 do `design.md`.

## Resultado
`items` mantém a mesma referência entre renderizações sem mudança; a gravação direta no `localStorage` seguida de `StorageEvent` chega ao hook (caso das abas). Os 10 testes passam e o `unmount` remove o listener de `storage`.

## Observações
Sem tela própria.
