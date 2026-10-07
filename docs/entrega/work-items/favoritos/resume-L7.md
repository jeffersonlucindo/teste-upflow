# favoritos

## 📋 Proposta — O quê e por quê

**Resumo:** Favoritos persistidos no navegador e a tela `/favoritos`, com o coração de favoritar no card da listagem. Cria `src/lib/favorites/` (`store.ts` com a chave `catalogo.favorites.v1`, payload `{ version: 1, items }`, type guards sem biblioteca, ordem por `savedAt` decrescente, fallback em memória e evento `storage` entre abas; `useFavorites.ts` com `useSyncExternalStore`) e `src/components/favorites/` (`FavoriteButton` com variantes `icon` e `full`, `FavoritesBadge`, `FavoritesList`). Altera `MovieCard` (liga o `FavoriteButton`) e `Header` (badge no `NavLink` Favoritos) e reescreve `src/app/favoritos/page.tsx` como RSC estático. O `FavoriteButton full` fica pronto para o `detalhe-filme`.

**Parent items relacionados:**
- #L7 — Favoritos: persistência no client e página/aba que liste os favoritos

**Problema / Necessidade:**
O requisito de favoritos do enunciado pede persistir a escolha no cliente e listá-la em uma página. Como `/favoritos` não chama o TMDB, o snapshot do filme é gravado junto com o favorito.

**Resultado esperado:**
Favoritar na listagem, ver em `/favoritos` e remover; reload mantém; duas abas sincronizam; payload corrompido não quebra; testes do store e do hook; build verde com `CATALOGO_CACHE_COMPONENTS=1`.

---

## 🏗️ Design implementado — Como foi resolvido

- **Store.** `createFavoritesStore(getStorage)` com leitura que só reparseia quando o texto bruto muda (referência estável, D29), `try/catch` com fallback em memória e escuta do evento `storage` (D32). Snapshot de sete chaves, com `voteCount` (D30).
- **Hook.** `useFavorites()` com dois `useSyncExternalStore`: um para a lista (servidor sempre vazio) e outro para `hydrated`; sem `useState` nem `useEffect` (D31 e regras do React Compiler).
- **Componentes.** `FavoriteButton` (`icon` 40 × 40 px sobre o pôster, `full` com rótulo, `aria-pressed` e nome alternando), `FavoritesBadge` (oculto em zero, nome "N favorito(s)") e `FavoritesList` (nada antes de hidratar; `EmptyState` com coração ou `MovieGrid`).
- **Integração.** Botão irmão do `<Link>` no `MovieCard`; `Header` com o badge dentro do `NavLink`; `/favoritos` estática (`○`) nos dois modos de `cacheComponents` (D42).
- **Ajustes do apply.** Sem `transition-colors` no coração `icon` (o anel de foco demorava 150 ms para chegar à cor final); o componente da página mantém o nome `FavoritosPage`; o `div` do pôster não tem `overflow-hidden`, para o anel de foco do link.
- **Ajustes do QA.** Três lacunas de teste unitário e uma sugestão do code review aplicadas; gates de layout do shell passaram a rodar em `/favoritos`.

---

## ✅ Tasks

- [x] **1.** Inspeção da base
  - Task(s): #L7-1
  - Arquivos: leitura
- [x] **2.** Store (`src/lib/favorites/store.ts`)
  - Task(s): #L7-2
  - Arquivos: `store.ts`, `store.test.ts`
- [x] **3.** Hook (`useFavorites.ts`)
  - Task(s): #L7-3
  - Arquivos: `useFavorites.ts`, `useFavorites.test.tsx`
- [x] **4.** Componentes
  - Task(s): #L7-4
  - Arquivos: `FavoriteButton`, `FavoritesBadge`, `FavoritesList` (código e teste)
- [x] **5.** Integração
  - Task(s): #L7-5
  - Arquivos: `MovieCard.tsx`, `Header.tsx`, `src/app/favoritos/page.tsx`
- [x] **6.** Verificação no browser e nos dois modos
  - Task(s): #L7-6
  - Arquivos: `e2e/favoritos.spec.ts`, `e2e/shell.spec.ts`
- [x] **7.** Registro
  - Task(s): #L7-7
  - Arquivos: `.work/design/components.md`, `decisoes.md`, `.work/backlog.md`
- [x] **8.** Validação
  - Task(s): #L7-8
  - Arquivos: `tasks.md`, `.devflow.yaml`

---

## 🔗 Referências

- Change: `favoritos`
- Gerado em: 2026-10-07

---

## 📦 Entrega

**Status:** Finalizado em 2026-10-07. QA `passed` (1 iteração, 5 findings resolvidos, nenhum em aberto, `functional: pass`, E2E 82 passed e 0 skipped, layout `pass`).
**Change:** `.work/changes/archive/2026-10-07-favoritos/`

**Evidências:**
### Requisito #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
- [`parent-L7.md`](evidence/parent-L7/parent-L7.md)
- #L7-1 — [`task-L7-1.md`](evidence/parent-L7/task-L7-1.md)
- #L7-2 — [`task-L7-2.md`](evidence/parent-L7/task-L7-2.md)
- #L7-3 — [`task-L7-3.md`](evidence/parent-L7/task-L7-3.md)
- #L7-4 — [`task-L7-4.md`](evidence/parent-L7/task-L7-4.md)
- #L7-5 — [`task-L7-5.md`](evidence/parent-L7/task-L7-5.md)
- #L7-6 — [`task-L7-6.md`](evidence/parent-L7/task-L7-6.md)
- #L7-7 — [`task-L7-7.md`](evidence/parent-L7/task-L7-7.md)
- #L7-8 — [`task-L7-8.md`](evidence/parent-L7/task-L7-8.md)

**Capturas de layout:** `evidence/layout/<projeto>-<tela>.png` (`desktop` e `mobile`; telas `favoritos`, `favoritos-carregado`, `favoritos-vazio`, `favoritos-vazio-inicial` e `listagem-com-favoritos`).
