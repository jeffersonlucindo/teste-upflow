# tmdb-client

## 📋 Proposta — O quê e por quê

**Resumo:** Porta única para a API do TMDB em `src/lib/tmdb/`: cliente restrito ao servidor com Bearer e cache por `fetch`, tipos de domínio e DTOs, erro classificado por `kind`, montadores de parâmetros, mapeadores e as escolhas de sinopse e trailer, com fixtures e testes ao lado. Uma sonda contra a API real resolveu as pendências de verificação de `translations`, `include_video_language` e do limite de 500 páginas.

**Parent items relacionados:**
- #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example

**Tasks:**
- #L1-1 — Preparação sobre a base do setup-catalogo
- #L1-2 — Tipos e erros
- #L1-3 — Fixtures, funções puras e testes
- #L1-4 — Cliente
- #L1-5 — Verificação com a API real
- #L1-6 — Documentação
- #L1-7 — Validação

**Problema / Necessidade:**
Todos os requisitos de listagem, busca, filtro, ordenação, detalhe e favoritos leem dados do TMDB. Sem uma porta única, o token poderia vazar para o browser e cada tela montaria parâmetros e leria JSON cru por conta própria.

**Resultado esperado:**
Os três changes de tela consomem tipos de domínio (`MovieSummary`, `MovieDetail`, `Genre`, `CastMember`, `ListingQuery`) por `getGenres`, `fetchListing` e `getMovieDetail`, sem tocar em JSON cru, e o token nunca sai do servidor. Este change não tem tela.

---

## 🏗️ Design implementado — Como foi resolvido

- **Mapa de módulos e fronteira.** `src/lib/tmdb/` com `types.ts`, `errors.ts`, `params.ts`, `images.ts`, `pickOverview.ts`, `pickTrailer.ts`, `mappers.ts` (puros, sem `server-only`) e `client.ts` (o único com `import "server-only"`). Sem `index.ts`: cada consumidor importa o módulo exato.
- **Tipos.** Tipos de domínio em camelCase e DTOs com sufixo `Dto` no formato cru da API; `MovieSummary` e `MovieDetail` compartilham os campos do snapshot de favoritos.
- **Erros.** `TmdbError` com `kind` (`config`, `unauthorized`, `not_found`, `rate_limited`, `unavailable`) a partir do status HTTP; rede e JSON inválido viram `unavailable`.
- **Cliente.** Bearer no header, token lido a cada chamada, `cache: "force-cache"` com `next: { revalidate }` de 86 400 s para gêneros e 3 600 s para listagem e detalhe. O build não precisa de token nem de rede, pois nenhuma página importa o cliente ainda.
- **Parâmetros.** Discover com `sort_by` e `include_adult`; `vote_count.gte=200` só em `rating`; `primary_release_date.lte` (hoje em UTC) só em `release`; busca por título descarta gênero e ordenação; página limitada a 1–500.
- **Detalhe.** Uma chamada com `append_to_response=credits,videos,translations` e `include_video_language=pt-BR,pt,en,null`; `not_found` vira `null`. Elenco em até 8 por `order`; `totalPages` limitado a 500.
- **Sinopse e trailer.** Sinopse: idioma pedido, en-US, idioma original, primeira tradução com texto, `null`. Trailer: só YouTube e Trailer, ordenado por oficial, `pt`, `en` e mais recente.
- **Imagens.** `w342` no card, `w500` no detalhe e `w185` no elenco; `null` sem caminho.
- **Verificação real.** `translations` via `append_to_response` confirmado sem fallback; o `include_video_language` proposto (`pt,en,null`) descartava os vídeos pt-BR e foi trocado por `pt-BR,pt,en,null`; a página 501 respondeu HTTP 400, e não 422, com o clamp protegendo nos dois casos.

---

## ✅ Tasks

- [x] **1.** Preparação sobre a base do `setup-catalogo`
  - Task(s): #L1-1
  - Arquivos: `package.json`, `package-lock.json`, `src/lib/tmdb/`
- [x] **2.** Tipos e erros
  - Task(s): #L1-2
  - Arquivos: `src/lib/tmdb/types.ts`, `src/lib/tmdb/errors.ts`, `src/lib/tmdb/errors.test.ts`
- [x] **3.** Fixtures, funções puras e testes
  - Task(s): #L1-3
  - Arquivos: `src/lib/tmdb/fixtures/*.json`, `params`, `images`, `pickOverview`, `pickTrailer` e `mappers` (código e teste)
- [x] **4.** Cliente
  - Task(s): #L1-4
  - Arquivos: `src/lib/tmdb/client.ts`
- [x] **5.** Verificação com a API real
  - Task(s): #L1-5
  - Arquivos: `scripts/tmdb-probe.mjs`, `.work/changes/tmdb-client/probe-output.txt`, `.work/changes/tmdb-client/design.md`, `.work/design/decisoes.md`
- [x] **6.** Documentação
  - Task(s): #L1-6
  - Arquivos: `README.md`
- [x] **7.** Validação
  - Task(s): #L1-7
  - Arquivos: `.work/changes/tmdb-client/change.html`

---

## 🔗 Referências

- Change: `tmdb-client`
- Gerado em: 2026-10-07

---

## 📦 Entrega

**Status:** Implementado em 2026-10-07; QA `advisory-only` (2 iterações, 8 findings resolvidos, `functional: pass`, E2E e layout `not-applicable` por não haver tela). Evidências geradas, ainda sem validação do desenvolvedor.
**Change:** `.work/changes/archive/2026-10-07-tmdb-client/` (após o finish)

**Evidências:**
### Parent #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
- [`parent-L1.md`](evidence/parent-L1/parent-L1.md)
- #L1-1 — [`task-L1-1.md`](evidence/parent-L1/task-L1-1.md)
- #L1-2 — [`task-L1-2.md`](evidence/parent-L1/task-L1-2.md)
- #L1-3 — [`task-L1-3.md`](evidence/parent-L1/task-L1-3.md)
- #L1-4 — [`task-L1-4.md`](evidence/parent-L1/task-L1-4.md)
- #L1-5 — [`task-L1-5.md`](evidence/parent-L1/task-L1-5.md)
- #L1-6 — [`task-L1-6.md`](evidence/parent-L1/task-L1-6.md)
- #L1-7 — [`task-L1-7.md`](evidence/parent-L1/task-L1-7.md)
