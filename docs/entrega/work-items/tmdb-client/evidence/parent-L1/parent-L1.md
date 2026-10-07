# Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example — Resumo de Implementação

**Parent item:** L1
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O change `tmdb-client` entregou a porta única para a API do TMDB em `src/lib/tmdb/`, com `client.ts` restrito ao servidor (`server-only`, Bearer no header, cache por `fetch`), tipos de domínio separados dos DTOs, erro classificado por `kind`, montadores de parâmetros, mapeadores e as escolhas de sinopse e trailer, tudo puro e testado com fixtures. Uma sonda contra a API real resolveu as pendências de verificação: `translations` via `append_to_response` foi confirmado sem fallback; o `include_video_language` proposto descartava os vídeos pt-BR e foi trocado por `pt-BR,pt,en,null`; a página 501 respondeu HTTP 400, e não 422, e o clamp protege nos dois casos. Com isso L1 está completo. Não há tela neste change.

## Tasks realizadas
- **L1-1: Preparação sobre a base do setup-catalogo** — `server-only` instalado e pasta `src/lib/tmdb/` criada.
- **L1-2: Tipos e erros** — `types.ts` e `errors.ts`, com 12 testes.
- **L1-3: Fixtures, funções puras e testes** — três fixtures e cinco módulos puros (`params`, `images`, `pickOverview`, `pickTrailer`, `mappers`), com 70 testes.
- **L1-4: Cliente** — `client.ts` com `getGenres`, `fetchListing` e `getMovieDetail`, isolado de `src/app` e `src/components`.
- **L1-5: Verificação com a API real** — sonda `scripts/tmdb-probe.mjs`, saída real anexada e resultados registrados em `design.md` e `decisoes.md`.
- **L1-6: Documentação** — README com a sonda, a segurança do token e as decisões de dados.
- **L1-7: Validação** — os cinco comandos de `apply.validation` verdes.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json`, `package-lock.json` | alterado | Dependência `server-only` |
| `src/lib/tmdb/client.ts` | criado | Cliente server-only: Bearer, `force-cache` com `revalidate`, três funções públicas |
| `src/lib/tmdb/types.ts`, `errors.ts` | criado | Tipos de domínio e DTOs; `TmdbError` com `kind` |
| `src/lib/tmdb/params.ts`, `images.ts`, `pickOverview.ts`, `pickTrailer.ts`, `mappers.ts` | criado | Funções puras do domínio |
| `src/lib/tmdb/*.test.ts` | criado | Seis arquivos, 82 testes |
| `src/lib/tmdb/fixtures/*.json` | criado | `genres`, `discover-page` e `movie-603` |
| `scripts/tmdb-probe.mjs` | criado | Sonda contra a API real |
| `.work/changes/archive/2026-10-07-tmdb-client/probe-output.txt` | criado | Saída real da sonda e da checagem complementar |
| `README.md` | alterado | Sonda, segurança do token, decisões de dados e árvore de `src/lib/tmdb/` |
| `.work/design/decisoes.md`, `.work/changes/archive/2026-10-07-tmdb-client/design.md` | alterado | Resultado das verificações de D17, D18 e D19 |

## Decisões técnicas
Aplicadas D12 a D21 e D23. As que mais pesam: porta única com `server-only` e token lido a cada chamada (D12); cache só por `fetch` com `force-cache` e `revalidate` de 86 400 s para gêneros e 3 600 s para listagem e detalhe (D20); erro classificado por `kind` (D21); cortes de votos e de data só nas ordenações que os pedem (D15, D16); página limitada a 500 (D17); sinopse com fallback de idioma (D18) e trailer com prioridade oficial, `pt`, `en`, mais recente (D19). Desvios registrados: HTTP 400 em vez de 422 na página 501; `include_video_language` com `pt-BR,pt,en,null` (aprovado pelo usuário); o README não cita ids D<n> nem L<n>, por regra de `.work/config.yaml` (desvio da task 6.1).

## Resultado
`npm run tokens:check`, `lint`, `typecheck`, `test` (8 arquivos, 95 testes) e `build` passam, e o build não precisa de `.env.local` nem de rede. O contrato de dados que `listagem-filmes`, `favoritos` e `detalhe-filme` consomem está fixado e testado, e a sonda confirmou o formato real da API.

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md` (linha `@source not "../../.work"` já existente em develop e fora do diff; diff da árvore com trechos de Playwright/E2E do ferramental, fora dos commits deste change). E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; sem tela, sem screenshots a copiar).
