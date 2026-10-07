# detalhe-filme

## 📋 Proposta — O quê e por quê

**Resumo:** A página de detalhe em `/movie/[id]` (sinopse com fallback de idioma, nota, elenco principal e trailer quando houver). Cria a rota `src/app/movie/[id]/{page,not-found,error}.tsx`, o domínio de UI `src/components/movie-detail/` (`BackLink`, `BackLinkLoader`, `MovieDetails`, `MovieHeader`, `RatingChip`, `Overview`, `CastList`/`CastCard`, `TrailerEmbed`, `DetailSkeleton`), três formatadores em `src/lib/format/` (`formatRuntime`, `languageName`, `formatMovieMeta`), `backHref` em `src/lib/listing/` e `parseMovieId` em `src/lib/tmdb/`. Consome, sem alterar, `getMovieDetail` e `MovieDetail` do `tmdb-client`, `EmptyState`/`ErrorState` da listagem e o `FavoriteButton` na variante `full` dos favoritos. Altera um único arquivo existente de `src/`: o `NavLink`, que ganhou um `<Suspense>` interno.

**Parent items relacionados:**
- #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver

**Problema / Necessidade:**
O requisito de detalhe do enunciado pede uma página própria em `/movie/[id]` com sinopse, nota, elenco principal e trailer quando houver. A sinopse precisa de fallback de idioma (ou mensagem de ausência) e o trailer só aparece quando existe vídeo.

**Resultado esperado:**
`/movie/603` completo; `/movie/abc`, `/movie/0` e id inexistente caem no not-found; a sinopse cobre os três casos de D18; trailer e elenco somem quando não há dados; "Voltar à listagem" preserva os filtros; 390 e 1280 px; build verde sem token e sem rede, com e sem `CATALOGO_CACHE_COMPONENTS=1`.

---

## 🏗️ Design implementado — Como foi resolvido

- **Rota.** `page.tsx` sem `await` no corpo, com dois `<Suspense>` irmãos: `BackLinkLoader` (lê `searchParams.from`; fallback `BackLink href="/"`) e `MovieDetails` (lê `params.id`; fallback `DetailSkeleton`). Sem `generateStaticParams`, então o build não depende de token nem de rede. `/movie/[id]` é `ƒ` sem a flag e `◐` com `CATALOGO_CACHE_COMPONENTS=1` (D2, D42).
- **Dados.** `MovieDetails` valida o id com `parseMovieId`, chama `getMovieDetail` uma vez (a chamada de `generateMetadata` é a mesma, memoizada) e distribui o `MovieDetail`; id inválido ou `null` chamam `notFound()`, e os demais erros sobem ao `error.tsx` (D21).
- **Apresentação.** Server Components sem diretiva: `MovieHeader` (pôster `w500` com `preload`, `h1`, meta, `RatingChip` e `FavoriteButton full`), `Overview` (aviso antes do texto e `lang` fora do português, D18), `CastList` (até 8 pessoas, 2 colunas no mobile), `TrailerEmbed` (iframe `youtube-nocookie.com`, seção omitida sem vídeo, D19 e D38) e `DetailSkeleton` (D37).
- **Voltar.** `?from=` normalizado por `backHref` com as regras da listagem; valor inválido ou externo vira `/` (D39).
- **Estados.** `not-found.tsx` com `EmptyState` de filme e `error.tsx` com `ErrorState`; título da aba "Filme não encontrado" para id inválido ou inexistente e "Filme" para erro.
- **Ajustes do apply.** `NavLink` com `<Suspense>` interno (sem ele o build com a flag falha por `blocking-prerender-client-hook`); status HTTP do not-found é 200 com `noindex` nos dois modos; `preload` no lugar de `priority`; `castGridClassName` compartilhada com o skeleton; testes sem `vi.mock("next/image")`.
- **Ajustes do QA.** `preload` no pôster, asserção do `robots` duplicado no spec E2E e teste do shell sem JavaScript para os gates e o screenshot do skeleton.

---

## ✅ Tasks

- [x] **1.** Inspeção da base
  - Task(s): #L6-1
  - Arquivos: leitura
- [x] **2.** Funções puras (`src/lib/`)
  - Task(s): #L6-2
  - Arquivos: `parseMovieId`, `backHref`, `runtime`, `languageName`, `movieMeta` (código e teste)
- [x] **3.** Componentes de apresentação
  - Task(s): #L6-3
  - Arquivos: `BackLink`, `RatingChip`, `Overview`, `CastCard`, `CastList`, `TrailerEmbed`, `MovieHeader`, `DetailSkeleton`
- [x] **4.** Composição server
  - Task(s): #L6-4
  - Arquivos: `MovieDetails.tsx`, `BackLinkLoader.tsx`
- [x] **5.** Rotas
  - Task(s): #L6-5
  - Arquivos: `src/app/movie/[id]/page.tsx`, `not-found.tsx`, `error.tsx`
- [x] **6.** Verificação no browser e nos dois modos
  - Task(s): #L6-6
  - Arquivos: `e2e/detalhe-filme.spec.ts`, `src/components/layout/NavLink.tsx`
- [x] **7.** Registro
  - Task(s): #L6-7
  - Arquivos: `.work/design/components.md`, `decisoes.md`, `.work/backlog.md`
- [x] **8.** Validação
  - Task(s): #L6-8
  - Arquivos: `tasks.md`, `.devflow.yaml`

---

## 🔗 Referências

- Change: `detalhe-filme`
- Gerado em: 2026-10-07

---

## 📦 Entrega

**Status:** Implementado e validado em 2026-10-07; PR e finalização pendentes. QA `advisory-only` (2 iterações, 3 findings resolvidos, 2 advisory em aberto, `functional: pass`, E2E 114 passed e 0 skipped, layout `pass`).
**Change:** `.work/changes/detalhe-filme/`

**Evidências:**
### Requisito #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
- [`parent-L6.md`](evidence/parent-L6/parent-L6.md)
- #L6-1 — [`task-L6-1.md`](evidence/parent-L6/task-L6-1.md)
- #L6-2 — [`task-L6-2.md`](evidence/parent-L6/task-L6-2.md)
- #L6-3 — [`task-L6-3.md`](evidence/parent-L6/task-L6-3.md)
- #L6-4 — [`task-L6-4.md`](evidence/parent-L6/task-L6-4.md)
- #L6-5 — [`task-L6-5.md`](evidence/parent-L6/task-L6-5.md)
- #L6-6 — [`task-L6-6.md`](evidence/parent-L6/task-L6-6.md)
- #L6-7 — [`task-L6-7.md`](evidence/parent-L6/task-L6-7.md)
- #L6-8 — [`task-L6-8.md`](evidence/parent-L6/task-L6-8.md)

**Capturas de layout:** `evidence/layout/<projeto>-<tela>.png` (`desktop` e `mobile`; telas `de-card`, `603-completo`, `not-found`, `sinopse-ingles`, `sem-sinopse`, `sem-elenco`, `skeleton` e `erro`).
