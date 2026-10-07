# tmdb-client

## Resumo:
Segundo change do catálogo: a porta única para a API do TMDB em `src/lib/tmdb/`. Entrega o
cliente HTTP com Bearer e cache por `fetch` (`client.ts`), os tipos da API e de domínio
(`types.ts`), o erro classificado por `kind` (`errors.ts`), os montadores de parâmetros de
`/discover/movie` e `/search/movie` (`params.ts`), as URLs de imagem (`images.ts`), os mapeadores
DTO → domínio (`mappers.ts`) e as duas seleções de conteúdo do detalhe (`pickOverview.ts`,
`pickTrailer.ts`), tudo com fixtures JSON e testes ao lado. Resolve com uma chamada real as três
pendências de `.work/design/decisoes.md` (translations via `append_to_response`,
`include_video_language`, 422 acima da página 500). Completa o [#L1] e fixa o contrato que
`listagem-filmes`, `favoritos` e `detalhe-filme` consomem. **Não há UI**: nenhuma tela de
`.work/design/screens/` é implementada aqui e `src/app/` não é tocado.

## Parent item(ns) relacionado(s):
- [#L1] Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via
  variável de ambiente, .env.example. O scaffold, as variáveis e o `.env.example` vieram do
  `setup-catalogo`; este change entrega o cliente TMDB que lê `TMDB_API_READ_TOKEN` só no servidor
  e fecha o item.

## Tasks
Ver `tasks.md`: 1) preparação sobre a base do `setup-catalogo` (`server-only`, pasta do domínio);
2) tipos e erros; 3) fixtures, funções puras e testes (`params`, `images`, `pickOverview`,
`pickTrailer`, `mappers`); 4) cliente (`tmdbFetch`, `getGenres`, `fetchListing`,
`getMovieDetail`); 5) verificação com a API real das três pendências de `decisoes.md`;
6) documentação (README, `decisoes.md`); 7) validação.

## Por quê
Todos os requisitos L2–L7 leem dados do TMDB, e o pilar 3 de `.work/config.yaml > context` exige
uma porta única: `src/lib/tmdb/` com `import "server-only"`, componentes recebendo tipos de domínio
e nunca JSON cru, mapeadores e montadores de parâmetros puros e testados com fixtures. Fazer isso
num change próprio, antes de qualquer tela, tem três ganhos: (1) o contrato de dados
(`MovieSummary`, `MovieDetail`, `Genre`, `CastMember`, `ListingQuery`) nasce uma vez e os três
changes de UI só consomem; (2) as decisões D12–D21 e D23 ficam materializadas e testadas sem a
variável de uma interface; (3) as três pendências de verificação de `decisoes.md` (D17, D18, D19)
são resolvidas com uma chamada real **antes** de o `detalhe-filme` depender delas, e a decisão
resultante fica registrada no `design.md` e em `decisoes.md`. O token nunca sai do servidor (D12).

## O que muda
- Nasce `src/lib/tmdb/` com oito módulos: `types.ts` (DTOs da API com sufixo `Dto` e tipos de
  domínio sem sufixo), `errors.ts` (`TmdbError` com `kind`), `params.ts` (montadores de
  `/discover/movie` e `/search/movie`, constantes nomeadas de D15/D16, `MAX_PAGE` e `clampPage` de
  D17), `images.ts` (`posterUrl`/`profileUrl` com os tamanhos de D23), `pickOverview.ts` (D18),
  `pickTrailer.ts` (D19), `mappers.ts` (DTO → domínio, elenco limitado a 8 ordenado por `order`,
  `totalPages` limitado a 500) e `client.ts` (o único com `import "server-only"`: `tmdbFetch` com
  Bearer, `cache: "force-cache"` + `next: { revalidate }`, e as três funções públicas `getGenres`,
  `fetchListing`, `getMovieDetail`).
- Fixtures em `src/lib/tmdb/fixtures/` (`genres.json`, `discover-page.json`, `movie-603.json`) e
  testes ao lado (`errors.test.ts`, `params.test.ts`, `images.test.ts`, `pickOverview.test.ts`,
  `pickTrailer.test.ts`, `mappers.test.ts`). `client.ts` não tem teste unitário (importa
  `server-only`); é exercitado pela sonda e, a partir do `listagem-filmes`, pelas páginas.
- Dependência nova de runtime: `server-only`.
- `scripts/tmdb-probe.mjs`: sonda que faz as chamadas reais das três pendências
  (`node --env-file=.env.local scripts/tmdb-probe.mjs`) e imprime um resumo; serve também para o
  avaliador conferir o token.
- `README.md` ganha, em "Decisões técnicas e trade-offs", os parágrafos de D12, D13, D15–D21 e D23
  (com o resultado das verificações) e, em "Como rodar", uma linha sobre a sonda.
- `.work/design/decisoes.md`: as linhas D17, D18, D19 e a tabela "Pendências de verificação" são
  atualizadas no apply com o resultado da chamada real (confirmado ou fallback).
- Fora de escopo: qualquer arquivo em `src/app/`, `src/components/` e `src/lib/format/` (nasce no
  `listagem-filmes`), `src/lib/listing/` (`parseListingParams`/`buildListingHref`),
  `src/lib/favorites/`, `EmptyState`, `error.tsx`, `next.config.ts` (o `remotePatterns` de
  `image.tmdb.org` já veio no `setup-catalogo`), `.env.example` (nomes já corretos).

## Capacidades
### Novas
- `cliente-tmdb`: acesso ao TMDB v3 restrito ao servidor, com token e idioma por variável de
  ambiente, cache por `fetch` com revalidação, erros classificados, parâmetros de listagem
  determinísticos, mapeamento para tipos de domínio, seleção de sinopse com fallback de idioma,
  seleção de trailer e URLs de imagem. Spec em `specs/cliente-tmdb/spec.md`.
### Modificadas
- nenhuma. O `projeto-base` (spec do `setup-catalogo`) ganha a dependência `server-only` e o script
  `scripts/tmdb-probe.mjs` sem mudar nenhum comportamento especificado: o build continua sem
  token e sem rede porque nenhuma página importa `src/lib/tmdb/` neste change.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L1] — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
  - [#L1] — Inspecionar a base do `setup-catalogo` e instalar `server-only`
  - [#L1] — `src/lib/tmdb/types.ts`: DTOs e tipos de domínio
  - [#L1] — `src/lib/tmdb/errors.ts` + `errors.test.ts`
  - [#L1] — Fixtures `genres.json`, `discover-page.json`, `movie-603.json`
  - [#L1] — `params.ts` + `params.test.ts` (D13–D17)
  - [#L1] — `images.ts` + `images.test.ts` (D23)
  - [#L1] — `pickOverview.ts` + `pickOverview.test.ts` (D18)
  - [#L1] — `pickTrailer.ts` + `pickTrailer.test.ts` (D19)
  - [#L1] — `mappers.ts` + `mappers.test.ts`
  - [#L1] — `client.ts`: `tmdbFetch`, `getGenres`, `fetchListing`, `getMovieDetail` (D12, D20, D21)
  - [#L1] — Sonda `scripts/tmdb-probe.mjs` e chamada real: translations, `include_video_language`, 422
  - [#L1] — Registrar o resultado das verificações em `design.md` e `decisoes.md`
  - [#L1] — README: decisões deste change e linha da sonda
  - [#L1] — Validação (`tokens:check`, `lint`, `typecheck`, `test`, `build` sem token)

## Impacto
- Arquivos novos: `src/lib/tmdb/types.ts`, `src/lib/tmdb/errors.ts`, `src/lib/tmdb/errors.test.ts`,
  `src/lib/tmdb/params.ts`, `src/lib/tmdb/params.test.ts`, `src/lib/tmdb/images.ts`,
  `src/lib/tmdb/images.test.ts`, `src/lib/tmdb/pickOverview.ts`, `src/lib/tmdb/pickOverview.test.ts`,
  `src/lib/tmdb/pickTrailer.ts`, `src/lib/tmdb/pickTrailer.test.ts`, `src/lib/tmdb/mappers.ts`,
  `src/lib/tmdb/mappers.test.ts`, `src/lib/tmdb/client.ts`, `src/lib/tmdb/fixtures/genres.json`,
  `src/lib/tmdb/fixtures/discover-page.json`, `src/lib/tmdb/fixtures/movie-603.json`,
  `scripts/tmdb-probe.mjs`.
- Arquivos modificados: `package.json` e `package-lock.json` (dependência `server-only`),
  `README.md` (seções "Como rodar" e "Decisões técnicas e trade-offs"), `.work/design/decisoes.md`
  (D17, D18, D19 e a tabela de pendências, com o resultado da chamada real),
  `.work/backlog.md` (estado de L1).
- Dependências: `server-only` (runtime, sem dependências transitivas). Nenhuma biblioteca HTTP,
  de validação ou de datas: `fetch` nativo do Next, `URL`/`URLSearchParams`, `Date` em UTC.
- Padrões reutilizados: inspecionados os arquivos criados pelo `setup-catalogo` —
  `vitest.config.mts` (`include: src/**/*.test.{ts,tsx}`, jsdom, `tsconfigPaths`),
  `vitest.setup.ts`, `tsconfig.json` (`@/*`, `resolveJsonModule`, `exclude: .work`),
  `next.config.ts` (`images.remotePatterns` para `image.tmdb.org/t/p/**`, D23, já pronto),
  `.env.example` (`TMDB_API_READ_TOKEN`, `TMDB_LANGUAGE`), `src/components/layout/NavLink.test.tsx`
  e `src/components/ui/Button.test.tsx` (estilo de teste com Vitest), `scripts/check-tokens.mjs`
  (estilo de script ESM Node 22 sem dependências, molde da sonda), `eslint.config.mjs` (já ignora
  `scripts/**`). Fontes de decisão: `.work/config.yaml > context` (pilares 1, 2, 3, 7, 8),
  `.work/design/decisoes.md` (D7, D12–D21, D23 e a tabela "Pendências de verificação"),
  `.work/design/components.md` (tipos de domínio e props de `MovieCard`, `Overview`,
  `TrailerEmbed`, `CastList`, `FavoriteButton`), `.work/backlog.md > Sequência de changes` (linha 2).
  Nenhuma tela: este change não tem UI. O bundle `.work/design/reference/` não foi usado como código.
