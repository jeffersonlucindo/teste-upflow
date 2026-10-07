# listagem-filmes

## 📋 Proposta — O quê e por quê

**Resumo:** A tela `/` com filmes populares paginados, busca por título, filtro por gênero e ordenação por popularidade, nota e data de lançamento, tudo dirigido pela URL (`q`, `genre`, `sort`, `page`). Cria `src/lib/listing/` (parser e href da URL), `src/lib/format/` (nota e ano), `src/components/movies/`, `EmptyState` e `ErrorState` em `src/components/ui/`, reescreve `src/app/page.tsx` com dois `<Suspense>` e cria `src/app/error.tsx`. Consome o contrato do `tmdb-client` sem alterá-lo. O botão de favoritar fica para o change `favoritos`.

**Parent items relacionados:**
- #L2 — Listagem de filmes populares com paginação
- #L3 — Busca por título
- #L4 — Filtro por gênero
- #L5 — Ordenação por popularidade, nota e data de lançamento

**Problema / Necessidade:**
Os quatro requisitos obrigatórios da primeira tela do enunciado dependem só do shell do `setup-catalogo` e da porta TMDB do `tmdb-client`. Fazê-los num change evita quatro reescritas do mesmo `FilterBar`.

**Resultado esperado:**
Os quatro requisitos verificáveis no browser a 390 e 1280 px, com estados de carregando, vazio e erro, e build e `next dev` sem insight de blocking-route nos dois modos de `cacheComponents`.

---

## 🏗️ Design implementado — Como foi resolvido

- **URL como única fonte.** `parseListingParams`, `buildListingSearch` e `buildListingHref` em `src/lib/listing/params.ts`; busca descarta gênero e ordenação (D14); página de 1 a 500.
- **Fronteira.** Só `FilterBarLoader` e `MovieResults` importam `@/lib/tmdb/client`. `ListingTransition`, `FilterBar` e `ErrorState` são as ilhas client; o resto é shared ou RSC.
- **Página.** `page.tsx` sem `await`; barra de filtros sob `<Suspense>` com fallback desabilitado; resultados sob `<Suspense>` com `MovieGridSkeleton`, dentro da região `aria-busy` de `ListingTransition`.
- **FilterBar.** Campo de busca não controlado com debounce de 350 ms (`replace`) e Enter imediato; selects de gênero e ordenação com `push` e valor otimista (`useOptimistic`); `form role="search"` com `action="/"` como fallback.
- **MovieResults.** Faz `await connection()` depois do `await searchParams` e antes de `fetchListing`; três ramos: página inexistente, vazio e resultados.
- **Cards e paginação.** `MovieCard` com pôster `w342` e `from` no link de detalhe; `Pagination` com links `rel="prev"`/`"next"` e `aria-disabled` nos limites; `EmptyState` e `ErrorState` para os demais estados.
- **Ajustes do apply.** `await connection()` por causa do `partialPrefetching` com a flag; selects lado a lado a 390 px; pôster sem `overflow-hidden` para o anel de foco; `error.tsx` mantém `reset()` (os docs do 16.4 recomendam `retry()`); plural resolvido nos textos.
- **Ajustes do QA.** Selects otimistas; sincronização do campo a cada URL nova; `role="status"` fora da região `aria-busy`; testes de `ListingTransition` e `ErrorState`; base de 14 px no corpo.

---

## ✅ Tasks

- [x] **1.** Inspeção da base
  - Task(s): #L2-1
  - Arquivos: leitura
- [x] **2.** URL como única fonte
  - Task(s): #L2-2
  - Arquivos: `src/lib/listing/params.ts`, `params.test.ts`
- [x] **3.** Formatadores
  - Task(s): #L2-3
  - Arquivos: `src/lib/format/rating.ts`, `releaseYear.ts` (código e teste)
- [x] **4.** UI compartilhada
  - Task(s): #L2-4
  - Arquivos: `EmptyState`, `MovieCard`, `MovieGrid`, `MovieGridSkeleton`
- [x] **5.** FilterBar e FilterBarLoader
  - Task(s): #L3-5, #L4-5, #L5-5
  - Arquivos: `src/components/movies/FilterBar.tsx`, `FilterBar.test.tsx`, `FilterBarLoader.tsx`
- [x] **6.** Transição, paginação e resultados
  - Task(s): #L2-6
  - Arquivos: `ListingTransition`, `Pagination`, `MovieResults`
- [x] **7.** Rotas
  - Task(s): #L2-7
  - Arquivos: `src/app/page.tsx`, `src/app/error.tsx`, `ErrorState`
- [x] **8.** Verificação no browser e nos dois modos
  - Task(s): #L2-8, #L3-8, #L4-8, #L5-8
  - Arquivos: `e2e/listagem-filmes.spec.ts`
- [x] **9.** Registro
  - Task(s): #L2-9
  - Arquivos: `.work/design/components.md`, `decisoes.md`, `.work/backlog.md`
- [x] **10.** Validação
  - Task(s): #L2-10
  - Arquivos: `tasks.md`, `.devflow.yaml`

---

## 🔗 Referências

- Change: `listagem-filmes`
- Gerado em: 2026-10-07

---

## 📦 Entrega

**Status:** Entregue em 2026-10-07 (PR #3 para `develop`). QA `advisory-only` (2 iterações, 6 findings resolvidos, `functional: pass`, E2E 38 passed e 0 skipped, layout `pass` com um finding baixo em aberto).
**Change:** `.work/changes/archive/2026-10-07-listagem-filmes/` · spec sincronizada em `.work/specs/listagem-filmes/spec.md`

**Evidências:**
### Parent #L2 — Listagem de filmes populares com paginação
- [`parent-L2.md`](evidence/parent-L2/parent-L2.md)
- #L2-1 — [`task-L2-1.md`](evidence/parent-L2/task-L2-1.md)
- #L2-2 — [`task-L2-2.md`](evidence/parent-L2/task-L2-2.md)
- #L2-3 — [`task-L2-3.md`](evidence/parent-L2/task-L2-3.md)
- #L2-4 — [`task-L2-4.md`](evidence/parent-L2/task-L2-4.md)
- #L2-6 — [`task-L2-6.md`](evidence/parent-L2/task-L2-6.md)
- #L2-7 — [`task-L2-7.md`](evidence/parent-L2/task-L2-7.md)
- #L2-8 — [`task-L2-8.md`](evidence/parent-L2/task-L2-8.md)
- #L2-9 — [`task-L2-9.md`](evidence/parent-L2/task-L2-9.md)
- #L2-10 — [`task-L2-10.md`](evidence/parent-L2/task-L2-10.md)

### Parent #L3 — Busca por título
- [`parent-L3.md`](evidence/parent-L3/parent-L3.md)
- #L3-5 — [`task-L3-5.md`](evidence/parent-L3/task-L3-5.md)
- #L3-8 — [`task-L3-8.md`](evidence/parent-L3/task-L3-8.md)

### Parent #L4 — Filtro por gênero
- [`parent-L4.md`](evidence/parent-L4/parent-L4.md)
- #L4-5 — [`task-L4-5.md`](evidence/parent-L4/task-L4-5.md)
- #L4-8 — [`task-L4-8.md`](evidence/parent-L4/task-L4-8.md)

### Parent #L5 — Ordenação por popularidade, nota e data de lançamento
- [`parent-L5.md`](evidence/parent-L5/parent-L5.md)
- #L5-5 — [`task-L5-5.md`](evidence/parent-L5/task-L5-5.md)
- #L5-8 — [`task-L5-8.md`](evidence/parent-L5/task-L5-8.md)

**Capturas de layout:** `evidence/layout/<projeto>-<tela>.png` (`desktop` e `mobile`; telas `carregado`, `pagina-inexistente`, `vazio`, `busca` e `sem-resultado`).
