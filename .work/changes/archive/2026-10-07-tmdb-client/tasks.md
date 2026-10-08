# Tasks — tmdb-client

## Contexto
- Proposal: .work/changes/tmdb-client/proposal.md
- Design: .work/changes/tmdb-client/design.md
- Decisões: .work/design/decisoes.md (D12–D21, D23 e a tabela "Pendências de verificação") · Contratos: .work/design/components.md (tipos de domínio e props de `MovieCard`, `Overview`, `TrailerEmbed`, `CastList`, `FavoriteButton`)
- Ambiente: Windows 11, Node 22, npm 10. Comandos em Git Bash; equivalentes PowerShell onde fizer diferença. Só o grupo 5 precisa de `.env.local` com `TMDB_API_READ_TOKEN` e de rede; todo o resto (inclusive a Validação) roda sem token.
- Pré-requisito: `setup-catalogo` aplicado (`npm run check` e `npm run build` verdes).

## 1. Preparação sobre a base do `setup-catalogo`
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [x] 1.1 Inspecionar a base e instalar `server-only` [#L1]
  - Inspecionar: `package.json` (scripts `test`, `typecheck`, `lint`, `build`; nenhuma dependência de runtime além de `next`, `react`, `react-dom`), `tsconfig.json` (`"resolveJsonModule": true`, `"paths": { "@/*": ["./src/*"] }`, `exclude` com `.work`), `vitest.config.mts` (`include: ["src/**/*.test.{ts,tsx}"]`, `environment: "jsdom"`, `tsconfigPaths()`), `vitest.setup.ts`, `.env.example` (`TMDB_API_READ_TOKEN`, `TMDB_LANGUAGE=pt-BR`), `next.config.ts` (`images.remotePatterns` com `hostname: "image.tmdb.org"`, `pathname: "/t/p/**"`), `eslint.config.mjs` (`globalIgnores` com `scripts/**`)
  - Criar/Alterar: `npm install server-only`; nada mais neste passo. Se `resolveJsonModule` não estiver no `tsconfig.json`, acrescentar `"resolveJsonModule": true` em `compilerOptions`
  - Critério: `npm ls server-only` lista a versão sem erro; `git diff --stat` mostra só `package.json` e `package-lock.json`; `.env.example` já tem os dois nomes de variável (nada a mudar)
- [x] 1.2 Criar a pasta do domínio [#L1]
  - Inspecionar: `src/` (o `setup-catalogo` criou `src/app/` e `src/components/`; `src/lib/` ainda não existe); `.work/config.yaml > context` pilar 2 (sem `utils/`)
  - Criar/Alterar: `src/lib/tmdb/` e `src/lib/tmdb/fixtures/`
  - Critério: `ls src/lib/` lista só `tmdb/`

## 2. Tipos e erros
- [x] 2.1 `src/lib/tmdb/types.ts` [#L1]
  - Inspecionar: `design.md` decisão 2 (declarações completas); `.work/design/components.md` (props de `MovieCard`, `FavoriteButton` → `FavoriteSnapshot`, `Overview`, `TrailerEmbed`, `CastList`); `.work/design/decisoes.md` D30 (campos do snapshot)
  - Criar/Alterar: `types.ts` com os tipos de domínio (`Genre`, `MovieSummary`, `ListingSort`, `ListingQuery`, `ListingResult`, `CastMember`, `MovieOverview`, `MovieTrailer`, `MovieDetail`) e os DTOs (`TmdbGenreDto`, `TmdbGenreListDto`, `TmdbPagedDto<T>`, `TmdbMovieListItemDto`, `TmdbCastDto`, `TmdbCreditsDto`, `TmdbVideoDto`, `TmdbVideosDto`, `TmdbTranslationDto`, `TmdbTranslationsDto`, `TmdbMovieDetailDto`), exatamente como no design; comentário de uma linha em cada tipo de domínio dizendo quem o consome
  - Critério: `npx tsc --noEmit` verde; `MovieSummary` e `MovieDetail` têm `id`, `title`, `posterPath`, `voteAverage`, `voteCount`, `releaseDate` com os mesmos tipos (base do `FavoriteSnapshot`, que inclui `voteCount` desde o propose do `favoritos`); nenhum `any`
- [x] 2.2 `src/lib/tmdb/errors.ts` + `errors.test.ts` [#L1]
  - Inspecionar: `design.md` decisão 3; `.work/design/decisoes.md` D21; `src/components/layout/NavLink.test.tsx` (estilo: `describe`/`it` do Vitest, `expect` sem globals)
  - Criar/Alterar: `errors.ts` com `TmdbErrorKind`, `TmdbError` (`kind`, `status`, `cause`, `name = "TmdbError"`) e `errorKindFromStatus(status)`; `errors.test.ts` cobrindo 401 e 403 → `unauthorized`, 404 → `not_found`, 429 → `rate_limited`, 422/500/503 → `unavailable`, `instanceof Error` e `name`, `status` e `cause` preservados
  - Critério: `npx vitest run src/lib/tmdb/errors` verde; o arquivo não importa `server-only`

## 3. Fixtures, funções puras e testes
- [x] 3.1 Fixtures JSON [#L1]
  - Inspecionar: `design.md` decisão 12 (conteúdo de cada fixture) e decisão 2 (nomes dos campos da API); `tsconfig.json > resolveJsonModule`
  - Criar/Alterar: `src/lib/tmdb/fixtures/genres.json` (`{ "genres": [ {28, "Ação"}, {12, "Aventura"}, {878, "Ficção científica"} ] }`); `fixtures/discover-page.json` (`page: 1`, `total_pages: 51234`, `total_results: 1024680`, 3 `results`: `603` Matrix com `poster_path`, `release_date: "1999-03-30"`, `vote_average: 8.2`, `vote_count: 25000`; um filme com `poster_path: null` e `release_date: ""`; um com `vote_count: 0` e `vote_average: 0`); `fixtures/movie-603.json` (detalhe com `overview` em pt-BR, `original_language: "en"`, `runtime: 136`, `genres` 28/878, `credits.cast` com 10 entradas e `order` embaralhado 0–9, `videos.results` com 5 vídeos — Teaser `en` oficial, Trailer `en` não oficial `published_at` 2010, Trailer `en` oficial `published_at` 2014, Trailer `pt` não oficial, Trailer `site: "Vimeo"` — e `translations.translations` com `pt-BR`, `en-US` e `ja`, cada uma com `data.overview`)
  - Critério: `node -e "JSON.parse(require('fs').readFileSync('src/lib/tmdb/fixtures/movie-603.json','utf8'))"` sem erro para os três arquivos; nenhum valor de cor (o `tokens:check` não varre JSON, mas a regra vale); ids e chaves de vídeo plausíveis mas inventados (a task 5.5 pode trocar pelo real recortado)
- [x] 3.2 `params.ts` + `params.test.ts` (D13–D17) [#L1]
  - Inspecionar: `design.md` decisão 6; `.work/design/decisoes.md` D13, D14, D15, D16, D17
  - Criar/Alterar: `params.ts` com `LISTING_SORTS`, `DEFAULT_SORT`, `SORT_BY`, `RATING_MIN_VOTE_COUNT = 200`, `MAX_PAGE = 500`, `clampPage`, `todayUtc`, `buildDiscoverParams`, `buildSearchParams`, `buildListingRequest`; `params.test.ts` cobrindo: popularidade sem gênero → só `include_adult`, `sort_by=popularity.desc`, `page`; `genreId: 28` → `with_genres=28`; `sort: "rating"` → `sort_by=vote_average.desc` e `vote_count.gte=200`, e **sem** `vote_count.gte` nas outras ordenações; `sort: "release"` → `sort_by=primary_release_date.desc` e `primary_release_date.lte` igual ao `today` passado, e **sem** o corte nas outras; `query: "matrix"` → `path: "/search/movie"` com `query`, `page`, `include_adult` e sem `with_genres`/`sort_by` mesmo com `genreId` e `sort` preenchidos; `query: "   "` → discover; `clampPage(0)`, `clampPage(-3)`, `clampPage(NaN)` → 1, `clampPage(501)` → 500, `clampPage(2.7)` → 2; `todayUtc(new Date("2026-10-07T23:30:00-03:00"))` → `"2026-10-08"`; `language` ausente de todos os resultados
  - Critério: `npx vitest run src/lib/tmdb/params` verde; nenhum `new Date()` sem argumento fora de `todayUtc`
- [x] 3.3 `images.ts` + `images.test.ts` (D23) [#L1]
  - Inspecionar: `design.md` decisão 11; `next.config.ts > images.remotePatterns`
  - Criar/Alterar: `images.ts` com `TMDB_IMAGE_BASE`, `POSTER_SIZE`, `PROFILE_SIZE`, `PosterSize`, `posterUrl`, `profileUrl`; `images.test.ts` cobrindo `null`, `undefined` e `""` → `null`; `posterUrl("/abc.jpg", POSTER_SIZE.card)` → `https://image.tmdb.org/t/p/w342/abc.jpg`; `POSTER_SIZE.detail` → `w500`; `profileUrl("/p.jpg")` → `w185`
  - Critério: teste verde; arquivo sem `server-only` (é importado por componente client no `favoritos`)
- [x] 3.4 `pickOverview.ts` + `pickOverview.test.ts` (D18) [#L1]
  - Inspecionar: `design.md` decisão 9; fixture `movie-603.json`; `.work/design/components.md` linha `Overview`
  - Criar/Alterar: `pickOverview.ts`; `pickOverview.test.ts` com a fixture e variantes por spread: pt-BR presente → `{ text, language: "pt" }`; `overview: ""` → `en-US` das translations com `language: "en"`; `overview: ""` e translations sem `en` → a de `original_language` (`ja` ao trocar `original_language` para `"ja"`); sem `en` e sem original → primeira não vazia; todas vazias → `null`; `translations: undefined` e `overview: "  "` → `null`; `requestedLanguage: "pt-BR"` gera `"pt"`
  - Critério: `npx vitest run src/lib/tmdb/pickOverview` verde; função sem efeito colateral e sem `Date`
- [x] 3.5 `pickTrailer.ts` + `pickTrailer.test.ts` (D19) [#L1]
  - Inspecionar: `design.md` decisão 10; `videos.results` da fixture; `.work/design/components.md` linha `TrailerEmbed`
  - Criar/Alterar: `pickTrailer.ts`; `pickTrailer.test.ts` cobrindo: `undefined` e `[]` → `null`; só Teaser → `null`; Vimeo ignorado; `official` vem antes de idioma (um Trailer oficial `en` vence um Trailer não oficial `pt`); entre dois oficiais, `pt` vence `en`; entre dois oficiais `en`, vence o `published_at` mais recente; o resultado é exatamente `{ key, name }`, sem outros campos
  - Critério: `npx vitest run src/lib/tmdb/pickTrailer` verde
- [x] 3.6 `mappers.ts` + `mappers.test.ts` [#L1]
  - Inspecionar: `design.md` decisão 8; as três fixtures; `.work/design/components.md` (`CastList` até 8 por `order`; `Pagination` página única)
  - Criar/Alterar: `mappers.ts` com `MAIN_CAST_LIMIT = 8`, `toGenre`, `toGenres`, `toMovieSummary`, `toListingResult`, `toCastMember`, `toMovieDetail`; `mappers.test.ts` cobrindo: `toGenres(genres.json)` → 3 `Genre`; `toMovieSummary` dos três itens (`posterPath: null`, `releaseDate: null` para `""` e para ausente, `voteCount: 0`); `toListingResult` → `totalPages: 500` para 51 234 e `1` para `0`, `movies.length: 3`, `page` e `totalResults` copiados; `toMovieDetail(movie-603.json, "pt-BR")` → `cast` com 8 itens em `order` 0–7, `genres` mapeados, `runtime: 136`, `releaseDate: "1999-03-30"`, `overview.language: "pt"`, `trailer.key` do Trailer `en` oficial mais recente (não há `pt` oficial na fixture); `runtime: 0` → `null`; `credits` ausente → `cast: []`
  - Critério: `npx vitest run src/lib/tmdb` verde (seis arquivos de teste); `npm run typecheck` verde

## 4. Cliente
- [x] 4.1 `src/lib/tmdb/client.ts`: `tmdbFetch`, configuração e constantes [#L1]
  - Inspecionar: `design.md` decisão 4; `.work/design/decisoes.md` D12, D20, D21; `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` (opções `cache` e `next.revalidate`); `.env.example`
  - Criar/Alterar: `client.ts` começando por `import "server-only"`; `TMDB_API_BASE`, `DEFAULT_LANGUAGE`, `REVALIDATE_GENRES = 86_400`, `REVALIDATE_LISTING = 3_600`, `REVALIDATE_DETAIL = 3_600`, `DETAIL_APPEND`, `VIDEO_LANGUAGES`; `readConfig()` privada lendo `process.env` na chamada e lançando `TmdbError("config")` com a mensagem que nomeia `TMDB_API_READ_TOKEN`; `tmdbFetch<T>(path, params, revalidate)` privada com `URL` + `searchParams` (`language` primeiro), `Authorization: Bearer`, `Accept: application/json`, `cache: "force-cache"`, `next: { revalidate }`, `TypeError` → `unavailable` com `cause`, `!res.ok` → `errorKindFromStatus`, JSON inválido → `unavailable`
  - Critério: `npm run typecheck` verde; `grep -rn "server-only" src/` lista só `client.ts`; `grep -rn "TMDB_API_READ_TOKEN" src/` lista só `client.ts`; nenhum `console.log` do token; `grep -n "api_key" src/lib/tmdb/client.ts` vazio
- [x] 4.2 `getGenres`, `fetchListing`, `getMovieDetail` [#L1]
  - Inspecionar: `design.md` decisões 5, 6, 7; `mappers.ts`, `params.ts`
  - Criar/Alterar: em `client.ts`, `getGenres(): Promise<Genre[]>` (`/genre/movie/list`, `REVALIDATE_GENRES`, `toGenres`); `fetchListing(query: ListingQuery): Promise<ListingResult>` (`buildListingRequest(query, todayUtc())`, `REVALIDATE_LISTING`, `toListingResult`); `getMovieDetail(id: number): Promise<MovieDetail | null>` (`/movie/${id}` com `append_to_response=credits,videos,translations` e `include_video_language=pt,en,null`, `REVALIDATE_DETAIL`, `toMovieDetail(dto, language)`; `catch` de `TmdbError` com `kind === "not_found"` → `null`, demais relançados). Os fallbacks de D18/D19 **não** entram ainda: a task 5 decide
  - Critério: `npm run typecheck` e `npm run lint` verdes; as três funções são as únicas exportações assíncronas; `fetchListing` não chama `connection()` nem lê `searchParams` (responsabilidade do componente)
- [x] 4.3 Isolamento do domínio e build sem token [#L1]
  - Inspecionar: `src/app/**` e `src/components/**` (nenhum import de `@/lib/tmdb`); ausência de `.env.local` (renomear temporariamente se existir)
  - Criar/Alterar: nada
  - Critério: `grep -rn "lib/tmdb" src/app src/components` vazio; `npm run build` verde sem `.env.local` e sem rede; `grep -rn "api.themoviedb.org" .next/server/app | wc -l` = 0 (o cliente não entra em nenhuma rota ainda)

## 5. Verificação com a API real (critério do change, `.work/backlog.md` linha 2)
- [x] 5.1 Sonda `scripts/tmdb-probe.mjs` [#L1]
  - Inspecionar: `scripts/check-tokens.mjs` (estilo ESM, Node 22, `process.exit(1)` com mensagem); `design.md` decisão 13; `.env.local` presente com `TMDB_API_READ_TOKEN` válido (criar a partir de `.env.example`; nunca commitar)
  - Criar/Alterar: `scripts/tmdb-probe.mjs` com `fetch` nativo: lê `TMDB_API_READ_TOKEN` (sai com 1 nomeando a variável se faltar) e `TMDB_LANGUAGE` (default `pt-BR`); aceita `[id]` (default `603`); faz as três chamadas da decisão 13 e imprime um resumo por chamada (status; `overview.length`; `translations` presente? e lista de `iso_639_1-iso_3166_1` com `data.overview` não vazio; vídeos como `iso_639_1/type/official`; diferença de vídeos com e sem `include_video_language`; status e `status_message` de `page=501`); nunca imprime o token
  - Critério: `node --env-file=.env.local scripts/tmdb-probe.mjs` (PowerShell: mesmo comando) termina com código 0 e imprime os três blocos; `node scripts/tmdb-probe.mjs` sem `.env.local` sai com 1 e a mensagem nomeia `TMDB_API_READ_TOKEN`; `npm run lint` continua verde (`scripts/**` ignorado)
- [x] 5.2 D18 — `translations` via `append_to_response` [#L1]
  - Inspecionar: bloco 1 da saída da sonda; `design.md` decisão 7
  - Criar/Alterar: **confirmado** (`translations.translations` presente com `data.overview`): nada no código; anotar "confirmado em 2026-MM-DD" na tabela da decisão 13. **Fallback** (campo ausente): em `getMovieDetail`, quando `dto.overview` trimado é vazio e `dto.translations` é `undefined`, segunda chamada `tmdbFetch<TmdbMovieDetailDto>("/movie/${id}", { language: "en-US" }, REVALIDATE_DETAIL)` e injeção de `translations = { translations: [{ iso_639_1: "en", iso_3166_1: "US", data: { overview } }] }` antes de `toMovieDetail`; sem mudar `pickOverview`
  - Critério: a tabela da decisão 13 tem a linha D18 preenchida (resultado, caminho, data); se fallback, `npm run typecheck` verde e o comportamento descrito na decisão 7
- [x] 5.3 D19 — `include_video_language=pt,en,null` [#L1]
  - Inspecionar: blocos 1 e 2 da saída da sonda (vídeos com e sem o parâmetro); `design.md` decisão 7
  - Criar/Alterar: **confirmado** (com o parâmetro vêm vídeos `en` que não vêm sem ele, ou vêm `en` nos dois casos): nada no código; registrar qual dos dois. **Fallback** (sem vídeos `en` em nenhum caso e `results` vazio para `pt-BR`): em `getMovieDetail`, quando `dto.videos?.results` é vazio, segunda chamada `tmdbFetch<TmdbVideosDto>("/movie/${id}/videos", { language: "en-US" }, REVALIDATE_DETAIL)` e uso dos `results` dela em `toMovieDetail` (via `dto.videos` substituído)
  - Critério: linha D19 da tabela preenchida; se fallback, `typecheck` verde e um filme sem vídeo `pt` mostra trailer `en` ao rodar a sonda com o id dele
- [x] 5.4 D17 — 422 acima da página 500 [#L1]
  - Inspecionar: bloco 3 da saída da sonda
  - Criar/Alterar: nada no código em nenhum dos casos (o clamp de `params.ts` já impede a chamada); registrar o status e o `status_message` observados
  - Critério: linha D17 da tabela preenchida
- [x] 5.5 Registrar resultados e alinhar fixtures [#L1]
  - Inspecionar: saída completa da sonda; `src/lib/tmdb/fixtures/movie-603.json` × resposta real (nomes e tipos dos campos lidos por `types.ts`); `.work/design/decisoes.md` linhas D17, D18, D19 e tabela "Pendências de verificação"
  - Criar/Alterar: `design.md` decisão 13 (tabela preenchida); `.work/design/decisoes.md` (coluna "Decisão"/"Trade-off" de D17, D18, D19 sem o "pendente de verificação", e a tabela de pendências com uma coluna "Resultado"); se algum campo real divergir dos tipos, corrigir `types.ts`, as fixtures e os testes; opcionalmente substituir `movie-603.json` por um recorte da resposta real (só os campos lidos, elenco com 10 pessoas, mesmos cinco tipos de vídeo)
  - Critério: `grep -n "endente de verifica" .work/design/decisoes.md` vazio; `npx vitest run src/lib/tmdb` verde após qualquer ajuste; saída da sonda anexada à evidência do apply

## 6. Documentação
- [x] 6.1 README: decisões deste change, sonda e segurança do token [#L1]
  - Inspecionar: `README.md` (seções "Como rodar", "Decisões técnicas e trade-offs", "Melhorias futuras" criadas pelo `setup-catalogo`); `design.md` decisão 14 e tabela da decisão 13; `.work/design/decisoes.md` D12, D13, D15–D21, D23
  - Criar/Alterar: em "Como rodar", a linha da sonda (`node --env-file=.env.local scripts/tmdb-probe.mjs`) como forma de conferir o token; nova subseção "Segurança do token" (Bearer no header, só no servidor, `server-only`, nunca `NEXT_PUBLIC_`, D12); em "Decisões técnicas e trade-offs", um parágrafo por decisão D12, D13, D15, D16, D17, D18, D19, D20, D21, D23 citando o id e, em D18/D19, o resultado da sonda; em "Melhorias futuras", "type guard mínimo nas respostas do TMDB"
  - Critério: README cita `scripts/tmdb-probe.mjs`, `server-only` e os tempos de `revalidate` (86 400 s gêneros; 3 600 s listas e detalhe); nenhum token de exemplo real

## 7. Validação
- [x] 7.1 Rodar comandos de validação existentes (comandos de config.yaml > apply.validation): `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` — o build sem `.env.local` e sem rede (pilar 7; nenhuma página importa `src/lib/tmdb/` ainda) [#L1]
- [x] 7.2 Rodar testes existentes: `npm run test` (NavLink, Button e os seis de `src/lib/tmdb/`: errors, params, images, pickOverview, pickTrailer, mappers) e registrar a saída na evidência [#L1]
- [x] 7.3 Conferir que `.work/backlog.md` marca `L1` como `doing` (o finish deste change marca `done`: `tmdb-client` completa L1); conferir que `.work/design/decisoes.md` D17–D19 batem com `design.md` decisão 13; regenerar o HTML do change (com o ferramental local, não versionado) [#L1]
