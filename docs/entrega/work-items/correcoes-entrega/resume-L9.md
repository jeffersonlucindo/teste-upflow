# correcoes-entrega

## 📋 Proposta — O quê e por quê

**Resumo:** Sétimo change do catálogo: corrige o que a revisão da entrega `v0.1.0` (2026-10-08) encontrou antes de o repositório ser compartilhado. Código: a corrida entre a busca e os selects no `FilterBar`, o `posterPath` adulterado que derruba `/favoritos`, o 404 genérico em inglês, o status 200 para id de filme inválido, o gênero desconhecido na URL, o `engines` do `package.json` e o `TMDB_LANGUAGE` que só valia pela metade; mais skip-link, `h1` nas telas de erro e de não encontrado, título da listagem durante a busca e indicador de carregamento na paginação. README: URL de clone, contagens, resumo das decisões e seção "Processo". Registros: D8 e a regra de README revisadas, referências a ferramental local removidas e `setup-catalogo` arquivado.

**Parent items relacionados:**
- #L9 — Correções da revisão da entrega

**Problema / Necessidade:**
A revisão aprovou os requisitos, mas apontou defeitos que contradiziam o próprio README (por exemplo, "dados inválidos não quebram a tela") e um clone com nome de repositório errado. Como todo artefato entregue é analisado, esses pontos pesam mais do que o tamanho deles sugere.

**Resultado esperado:**
Cada defeito reproduzido por teste que falha antes e passa depois; nenhum requisito L1 a L8 muda de comportamento no uso previsto; README correto e franco sobre o processo; validação completa verde nos dois modos de cache e E2E verde.

---

## 🏗️ Design implementado — Como foi resolvido

- **Listagem.** `pushFilter` cancela o timer da busca, limpa o campo e zera `committedRef`; `resolveGenreId` (D47) faz gênero desconhecido virar "Todos" em `MovieResults` e no `FilterBar`; `ListingTitle` (RSC) sob `<Suspense>` acompanha a busca; `PaginationPending` (ilha client com `useLinkStatus`, ponto fora do fluxo) mostra o carregamento. A escolha do estado vazio virou `resolveEmptyState`.
- **Imagens e favoritos.** `isTmdbImagePath` valida o caminho em `images.ts` (D48); `toFavoriteSnapshot` grava `posterPath: null` quando ele é recusado.
- **404.** `src/app/not-found.tsx` em português; `src/proxy.ts` com `matcher` `/movie/:id` faz `rewrite` para um caminho sem rota quando `parseMovieId` recusa o id (D46). O `rewrite` devolveu 404 nos dois modos de cache. Id válido que o TMDB não conhece continua 200.
- **Idioma.** `MovieOverview.fallback`, `pickTrailer(videos, language)` e `videoLanguages(language)` fazem sinopse e trailer seguir `TMDB_LANGUAGE`; com `pt-BR` o resultado é o anterior.
- **Acessibilidade.** Skip-link no `layout.tsx` e `main` com `id="conteudo"`; `EmptyState.headingLevel` (1 nas telas que substituem a página).
- **Projeto e registros.** `engines.node` = `^22.22.2 || ^24.15.0 || >=26.0.0`; decisões D45 a D48; `components.md` com as ilhas e contratos novos.
- **Ajustes do QA.** O ponto do indicador saiu do fluxo para não mudar a largura do botão; a escolha do estado vazio foi extraída para função pura testada.

---

## ✅ Tasks

- [x] **1.** Reprodução
  - Task(s): #L9-1
  - Arquivos: leitura
- [x] **2.** Listagem
  - Task(s): #L9-2
  - Arquivos: `FilterBar`, `MovieResults`, `ListingTitle`, `PaginationPending`, `Pagination`, `page.tsx`, `src/lib/listing/`
- [x] **3.** Favoritos e imagens
  - Task(s): #L9-3
  - Arquivos: `src/lib/tmdb/images.ts`, `src/lib/favorites/store.ts`
- [x] **4.** Detalhe e 404
  - Task(s): #L9-4
  - Arquivos: `src/app/not-found.tsx`, `src/proxy.ts`, `src/lib/tmdb/*`, `Overview.tsx`
- [x] **5.** Shell e acessibilidade
  - Task(s): #L9-5
  - Arquivos: `layout.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `movie/[id]/not-found.tsx`
- [x] **6.** Projeto
  - Task(s): #L9-6
  - Arquivos: `package.json`, `package-lock.json`
- [x] **7.** README
  - Task(s): #L9-7
  - Arquivos: `README.md`
- [x] **8.** Registros
  - Task(s): #L9-8
  - Arquivos: `.work/design/*`, `.work/config.yaml`, `.work/backlog.md`, `eslint.config.mjs`, arquivo de changes
- [x] **9.** E2E
  - Task(s): #L9-9
  - Arquivos: `e2e/correcoes-entrega.spec.ts`, `detalhe-filme.spec.ts`, `listagem-filmes.spec.ts`
- [x] **10.** Validação
  - Task(s): #L9-10
  - Arquivos: `tasks.md`, arquivo de estado do change

---

## 🔗 Referências

- Change: `correcoes-entrega`
- Gerado em: 2026-10-08

---

## 📦 Entrega

**Status:** Finalizado em 2026-10-08. QA `passed` (2 iterações, 14 findings resolvidos, nenhum em aberto, `functional: pass` com 409 testes em 35 arquivos, E2E 132 passed e 0 skipped em 66 testes de 5 specs, layout `pass`). Dois cenários sem E2E, declarados em `qa.not_covered_e2e` e no README: estado vazio por filtros e `TMDB_LANGUAGE` diferente de `pt-BR`.
**Change:** `.work/changes/archive/2026-10-08-correcoes-entrega/`

**Evidências:**
### Requisito #L9 — Correções da revisão da entrega
- [`parent-L9.md`](evidence/parent-L9/parent-L9.md)
- #L9-1 — [`task-L9-1.md`](evidence/parent-L9/task-L9-1.md)
- #L9-2 — [`task-L9-2.md`](evidence/parent-L9/task-L9-2.md)
- #L9-3 — [`task-L9-3.md`](evidence/parent-L9/task-L9-3.md)
- #L9-4 — [`task-L9-4.md`](evidence/parent-L9/task-L9-4.md)
- #L9-5 — [`task-L9-5.md`](evidence/parent-L9/task-L9-5.md)
- #L9-6 — [`task-L9-6.md`](evidence/parent-L9/task-L9-6.md)
- #L9-7 — [`task-L9-7.md`](evidence/parent-L9/task-L9-7.md)
- #L9-8 — [`task-L9-8.md`](evidence/parent-L9/task-L9-8.md)
- #L9-9 — [`task-L9-9.md`](evidence/parent-L9/task-L9-9.md)
- #L9-10 — [`task-L9-10.md`](evidence/parent-L9/task-L9-10.md)
- Screenshots: [`evidence/layout/`](evidence/layout/) (8 telas em desktop e mobile)
