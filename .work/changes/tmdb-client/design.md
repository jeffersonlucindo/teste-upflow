# Design — tmdb-client

## Contexto
Ao fim do `setup-catalogo` o repositório tem o projeto Next.js 16.4 buildando sem token e sem
rede, `src/app/` com o shell, `src/components/{layout,ui}/`, Vitest 5 com jsdom
(`include: src/**/*.test.{ts,tsx}`), `tsconfig.json` com `@/*` e `resolveJsonModule`,
`next.config.ts` já com `images.remotePatterns` para `image.tmdb.org/t/p/**` (D23) e
`.env.example` com `TMDB_API_READ_TOKEN` e `TMDB_LANGUAGE=pt-BR`. Ainda não existe `src/lib/`.
Este change cria o primeiro domínio de `src/lib/` e não toca em página nem componente.

O padrão a seguir está em `.work/config.yaml > context`: pilar 3 (porta única com
`import "server-only"`, tipos de domínio para os componentes, mapeadores e montadores puros com
fixtures, cache **somente** via `fetch(url, { cache: "force-cache", next: { revalidate } })` em
`client.ts`), pilar 2 (`src/lib/<domínio>/`, teste ao lado, sem `utils/`), pilar 7 (build verde sem
token e sem rede) e pilar 1 (nenhum fetch alcançável pelo shell: quem chama `getGenres()` faz
`await connection()` antes, D22; `fetchListing()` e `getMovieDetail()` rodam depois de
`await searchParams`/`await params`, sob `<Suspense>`).

Fatos já verificados no explore (`.work/design/decisoes.md`, sem reabrir):
- `/search/movie` só aceita `query, page, language, region, year, primary_release_year,
  include_adult` (D14, referência oficial): gênero e ordenação não se aplicam à busca.
- `fetch.md` do Next 16: requisição com header `authorization` só entra no cache com
  `cache: "force-cache"` explícito (D20); é o único mecanismo honrado nos dois modos de D2.
- Acima da página 500 o `/discover/movie` devolve erro (D17: esperado 422 por fontes da comunidade; a sonda da
  task 5.4 observou 400).
- Pendências que este change resolve com uma chamada real: `translations` via
  `append_to_response` (D18) e `include_video_language` (D19; proposto `pt,en,null`, adotado
  `pt-BR,pt,en,null` depois da verificação de 2026-10-07, ver decisão 13).

Formato das respostas da v3 usado nos tipos abaixo (referência oficial do TMDB; os campos citados
são os que o cliente lê — qualquer campo extra do JSON é ignorado): listas paginadas
`{ page, results[], total_pages, total_results }`; item de lista com `id, title, poster_path,
vote_average, vote_count, release_date, genre_ids`; detalhe com `overview, original_language,
runtime, genres[], release_date, poster_path, vote_average, vote_count` e, via
`append_to_response`, `credits.cast[]` (`id, name, character, profile_path, order`),
`videos.results[]` (`key, name, site, type, official, iso_639_1, iso_3166_1, published_at`) e
`translations.translations[]` (`iso_639_1, iso_3166_1, data.overview`). A task 5 confere o formato
real e atualiza tipos e fixtures se algo divergir.

Contratos consumidos pelos próximos changes (de `.work/design/components.md`): `MovieCard` recebe
`{ id, title, posterUrl: string | null, voteAverage, voteCount, releaseYear: number | null }`
(derivado de `MovieSummary` + `posterUrl()` + ano de `releaseDate`); `FavoriteSnapshot` é
`{ id, title, posterPath, voteAverage, voteCount, releaseDate, savedAt }` (derivado de `MovieSummary`
ou `MovieDetail`, que têm exatamente esses nomes; D30 revisada no propose do `favoritos`:
`voteCount` entra no snapshot porque `MovieCardData.voteCount` é obrigatório para "Sem nota");
`Overview` recebe `{ text, language } | null`;
`TrailerEmbed` recebe `{ key, name } | null`; `CastList` recebe até 8 `CastMember` ordenados por
`order`; `FilterBar` recebe `genres: Genre[]`.

## Objetivos
- Uma única porta para o TMDB, restrita ao servidor, com o token lido só em `client.ts` (D12).
- Contrato de dados estável para `listagem-filmes` (`getGenres`, `fetchListing`, `ListingQuery`,
  `ListingResult`, `MovieSummary`, `Genre`, `LISTING_SORTS`, `MAX_PAGE`, `clampPage`),
  `favoritos` (campos de `FavoriteSnapshot` em `MovieSummary`/`MovieDetail`, `posterUrl`) e
  `detalhe-filme` (`getMovieDetail`, `MovieDetail`, `CastMember`, `MovieOverview`,
  `MovieTrailer`, `posterUrl`, `profileUrl`).
- Parâmetros, mapeadores e seleções puros, determinísticos e testados com fixtures (D7, pilar 3).
- As três pendências de `decisoes.md` resolvidas com uma chamada real e registradas (critério do
  change em `.work/backlog.md`).
- Build e `npm run check` verdes sem token e sem rede (pilar 7): nada em `src/app/` importa este
  domínio ainda.

## Não-objetivos
- UI, rotas, `Suspense`, `error.tsx`, `EmptyState`, skeletons (`listagem-filmes`, `detalhe-filme`).
- Parser e href da URL (`src/lib/listing/`: `parseListingParams`, `buildListingHref`, D24) e os
  formatadores (`src/lib/format/`: nota com vírgula, ano, duração) — `listagem-filmes`.
- Store e hook de favoritos (`src/lib/favorites/`, D29–D32) — `favoritos`.
- Busca multipágina (alternativa (c) de D14), route handler/proxy, retry automático em 429,
  cache fora do `fetch` (`'use cache'`, `cacheLife`, memória própria).
- Teste unitário de `client.ts` (importa `server-only`; ver Riscos).

## Abordagem
- Oito módulos em `src/lib/tmdb/`, de baixo para cima: `types.ts` → `errors.ts` → `params.ts`,
  `images.ts`, `pickOverview.ts`, `pickTrailer.ts` → `mappers.ts` → `client.ts`. Só `client.ts`
  importa `server-only` e só ele lê `process.env`; os outros sete são puros e importáveis de
  qualquer lado (inclusive de componentes client, como `images.ts` pelo `FavoritesList` e
  `LISTING_SORTS` pelo `FilterBar`).
- As três funções públicas (`getGenres`, `fetchListing`, `getMovieDetail`) compõem um único
  `tmdbFetch<T>()` que monta a URL, injeta `language`, o Bearer e o cache, classifica o status em
  `TmdbError` e devolve o JSON tipado; cada função passa o DTO pelo mapeador e devolve domínio.
- Datas e ambiente entram como argumento nas funções puras (`today` em `buildDiscoverParams`,
  `requestedLanguage` em `pickOverview`/`toMovieDetail`), para os testes não dependerem de relógio
  nem de `.env`.
- Fixtures JSON escritas à mão no formato da v3 (a task 5 pode substituí-las pela resposta real
  recortada); testes ao lado com `import fixture from "./fixtures/x.json"`.
- Verificação com a API real por uma sonda em `scripts/tmdb-probe.mjs` (Node 22, `fetch` nativo,
  `--env-file=.env.local`), com os dois caminhos (confirmado / fallback) já descritos aqui para o
  apply só escolher.

## Decisões técnicas
1. **Mapa de módulos e fronteira** (aplica D12, pilares 2 e 3) — `src/lib/tmdb/`:
   | Arquivo | `server-only` | Exporta |
   |---|---|---|
   | `types.ts` | não | DTOs (`Tmdb*Dto`) e tipos de domínio (decisão 2) |
   | `errors.ts` | não | `TmdbError`, `TmdbErrorKind`, `errorKindFromStatus` (decisão 3) |
   | `params.ts` | não | `LISTING_SORTS`, `DEFAULT_SORT`, `SORT_BY`, `RATING_MIN_VOTE_COUNT`, `MAX_PAGE`, `clampPage`, `todayUtc`, `buildDiscoverParams`, `buildSearchParams`, `buildListingRequest` (decisão 6) |
   | `images.ts` | não | `TMDB_IMAGE_BASE`, `POSTER_SIZE`, `PROFILE_SIZE`, `posterUrl`, `profileUrl` (decisão 11) |
   | `pickOverview.ts` | não | `pickOverview` (decisão 9) |
   | `pickTrailer.ts` | não | `pickTrailer` (decisão 10) |
   | `mappers.ts` | não | `MAIN_CAST_LIMIT`, `toGenres`, `toMovieSummary`, `toListingResult`, `toCastMember`, `toMovieDetail` (decisão 8) |
   | `client.ts` | **sim** | `getGenres`, `fetchListing`, `getMovieDetail`, `REVALIDATE_*` (decisões 4, 5, 7) |
   Convenção de nome registrada: sufixo `Dto` para o formato cru da API (snake_case, como vem no
   JSON); tipos de domínio sem sufixo e em camelCase; arquivos de função pura nomeados pela função
   quando o módulo tem uma só (`pickOverview.ts`, `pickTrailer.ts`, como `useFavorites.ts` será
   nomeado pelo hook). `TmdbError` mora em `errors.ts`, e não em `client.ts`, porque é pura e
   testável (`errors.test.ts`) e porque módulos testados no Vitest não podem importar `server-only`.
   Não há `index.ts`: cada consumidor importa do módulo exato (`@/lib/tmdb/client`,
   `@/lib/tmdb/images`), o que deixa visível quem depende do lado servidor.
2. **Tipos** (`types.ts`) — declarações completas, consumidas pelos três changes seguintes:
   ```ts
   // Domínio (o que os componentes recebem)
   export interface Genre { id: number; name: string }
   export interface MovieSummary {
     id: number; title: string; posterPath: string | null;
     voteAverage: number; voteCount: number; releaseDate: string | null; // "YYYY-MM-DD"
   }
   export type ListingSort = "popularity" | "rating" | "release";
   export interface ListingQuery {
     query: string | null;   // busca por título; null = sem busca (D14: com busca, genreId e sort são ignorados)
     genreId: number | null; // id de Genre
     sort: ListingSort;      // default "popularity"
     page: number;           // inteiro >= 1; clampado a MAX_PAGE em fetchListing
   }
   export interface ListingResult { movies: MovieSummary[]; page: number; totalPages: number; totalResults: number }
   export interface CastMember { id: number; name: string; character: string; profilePath: string | null; order: number }
   export interface MovieOverview { text: string; language: string } // ISO 639-1: "pt", "en", "ja"…
   export interface MovieTrailer { key: string; name: string }        // sempre YouTube
   export interface MovieDetail {
     id: number; title: string; posterPath: string | null; releaseDate: string | null;
     runtime: number | null; genres: Genre[]; voteAverage: number; voteCount: number;
     overview: MovieOverview | null; cast: CastMember[]; trailer: MovieTrailer | null;
   }
   // API v3 (só os campos lidos; extras do JSON são ignorados)
   export interface TmdbGenreDto { id: number; name: string }
   export interface TmdbGenreListDto { genres: TmdbGenreDto[] }
   export interface TmdbPagedDto<T> { page: number; results: T[]; total_pages: number; total_results: number }
   export interface TmdbMovieListItemDto {
     id: number; title: string; poster_path: string | null; vote_average: number; vote_count: number;
     release_date?: string; genre_ids?: number[];
   }
   export interface TmdbCastDto { id: number; name: string; character: string; profile_path: string | null; order: number }
   export interface TmdbCreditsDto { cast: TmdbCastDto[] }
   export interface TmdbVideoDto {
     id: string; key: string; name: string; site: string; type: string; official: boolean;
     iso_639_1: string; iso_3166_1: string; published_at: string;
   }
   export interface TmdbVideosDto { results: TmdbVideoDto[] }
   export interface TmdbTranslationDto { iso_639_1: string; iso_3166_1: string; data: { overview?: string } }
   export interface TmdbTranslationsDto { translations: TmdbTranslationDto[] }
   export interface TmdbMovieDetailDto {
     id: number; title: string; original_language: string; overview: string | null;
     poster_path: string | null; release_date?: string; runtime: number | null; genres: TmdbGenreDto[];
     vote_average: number; vote_count: number;
     credits?: TmdbCreditsDto; videos?: TmdbVideosDto; translations?: TmdbTranslationsDto;
   }
   ```
   `MovieSummary` e `MovieDetail` compartilham exatamente `id, title, posterPath, voteAverage,
   voteCount, releaseDate`, os campos de `FavoriteSnapshot` (D30, com `voteCount` acrescentado no
   propose do `favoritos`): o `FavoriteButton` recebe qualquer um dos dois sem adaptador. `posterPath` (não a URL) fica no domínio porque o snapshot persiste o caminho
   e a URL depende do tamanho (`w342` no card, `w500` no detalhe). `releaseDate` é string ISO ou
   `null` (a API manda `""` quando não há data); o ano é derivado em `src/lib/format/` no
   `listagem-filmes`. Sem `overview`/`genreIds`/`popularity` em `MovieSummary`: nenhum componente
   usa. Alternativa descartada: um tipo `Movie` único com campos opcionais (obriga `?.` nos
   componentes e esconde o que a lista não tem).
3. **Erros classificados** (`errors.ts`, D21):
   ```ts
   export type TmdbErrorKind = "config" | "unauthorized" | "not_found" | "rate_limited" | "unavailable";
   export class TmdbError extends Error {
     readonly kind: TmdbErrorKind; readonly status: number | undefined;
     constructor(kind: TmdbErrorKind, message: string, options?: { status?: number; cause?: unknown });
   }
   export function errorKindFromStatus(status: number): TmdbErrorKind; // 401/403 → unauthorized · 404 → not_found · 429 → rate_limited · demais → unavailable
   ```
   `name = "TmdbError"`. Mensagens em pt-BR e úteis em dev: `config` → "Defina
   TMDB_API_READ_TOKEN em .env.local (API Read Access Token v4 do TMDB)."; `unauthorized` → "TMDB
   recusou o token (HTTP 401)."; `rate_limited` → "TMDB limitou as requisições (HTTP 429)."; `not_found`
   → "TMDB não encontrou /movie/603 (HTTP 404)."; `unavailable` → "TMDB indisponível (HTTP 503)." ou
   "Falha de rede ao chamar o TMDB." (com `cause`). Em produção o Next redige a mensagem (só
   `digest`), então o `error.tsx` de cada segmento mostra texto genérico com "Tentar novamente";
   o `kind` serve ao servidor e ao log. 422 ou 400 (página > 500; a sonda observou 400) cai em `unavailable` com o status na
   mensagem — o clamp de D17 impede que aconteça. Interpretação de D21 registrada: o `not_found`
   do detalhe é tratado **dentro** de `getMovieDetail`, que devolve `null` (decisão 7); o componente
   faz `if (!movie) notFound()`, sem `instanceof`. Os demais `kind` sobem até o `error.tsx`.
4. **`tmdbFetch` e cache** (`client.ts`, D12, D20, pilar 3):
   ```ts
   import "server-only";
   export const TMDB_API_BASE = "https://api.themoviedb.org/3";
   export const DEFAULT_LANGUAGE = "pt-BR";      // fallback de TMDB_LANGUAGE
   export const REVALIDATE_GENRES = 86_400;      // 24 h (D20)
   export const REVALIDATE_LISTING = 3_600;      // 1 h
   export const REVALIDATE_DETAIL = 3_600;       // 1 h
   interface TmdbConfig { token: string; language: string }
   function readConfig(): TmdbConfig
   async function tmdbFetch<T>(config: TmdbConfig, path: string, params: Record<string, string>, revalidate: number): Promise<T>
   ```
   Passos: (a) cada função pública chama `readConfig()` uma vez e passa o resultado ao
   `tmdbFetch` (`getMovieDetail` reaproveita o mesmo `config.language` no mapeador, sem segunda
   leitura); `readConfig()` lê `process.env.TMDB_API_READ_TOKEN` **na chamada**, não no topo
   do módulo, e lança `TmdbError("config")` se vazio; `TMDB_LANGUAGE` com fallback `pt-BR`;
   (b) `new URL(TMDB_API_BASE + path)` com `searchParams` = `{ language, ...params }` (a ordem é
   estável: a URL é a chave do cache); (c) `fetch(url, { headers: { Authorization: "Bearer " +
   token, Accept: "application/json" }, cache: "force-cache", next: { revalidate } })`;
   (d) `TypeError` de rede → `TmdbError("unavailable", …, { cause })`; `!res.ok` →
   `TmdbError(errorKindFromStatus(res.status), …, { status })`; JSON inválido → `unavailable`;
   (e) `return (await res.json()) as T`. O token nunca entra na URL nem em log. Sem retry, sem
   timeout próprio (o Next já aborta render travado), sem `connection()` aqui: pilar 1 coloca
   `await connection()` no componente que chama `getGenres()` (D22), e `fetchListing`/
   `getMovieDetail` já são chamados depois de `await searchParams`/`await params`. O mesmo
   `getMovieDetail(id)` em `generateMetadata` e em `MovieDetails` cai na memoização de requisição
   do Next (mesma URL e opções), sem segunda chamada. Alternativas descartadas: `api_key` na URL
   (vaza em log), route handler como proxy (um salto a mais), `'use cache'` (não existe com a
   flag de D2 desligada).
5. **`getGenres`** (D20, D22):
   ```ts
   export async function getGenres(): Promise<Genre[]> // GET /genre/movie/list · revalidate 86 400 s
   ```
   `toGenres(await tmdbFetch<TmdbGenreListDto>(readConfig(), "/genre/movie/list", {}, REVALIDATE_GENRES))`.
   A lista vem no idioma de `TMDB_LANGUAGE`. Não cacheia em memória nem no build: com
   `cacheComponents` ligado o `await connection()` do `FilterBarLoader` tira a chamada do shell.
6. **Parâmetros da listagem** (`params.ts`, D13–D17; D14 só no lado da API):
   ```ts
   export const LISTING_SORTS = ["popularity", "rating", "release"] as const satisfies readonly ListingSort[];
   export const DEFAULT_SORT: ListingSort = "popularity";
   export const SORT_BY: Record<ListingSort, string> = {
     popularity: "popularity.desc", rating: "vote_average.desc", release: "primary_release_date.desc",
   };
   export const RATING_MIN_VOTE_COUNT = 200; // D15: só com sort=rating
   export const MAX_PAGE = 500;              // D17: limite da API
   export function clampPage(page: number, max: number = MAX_PAGE): number; // não finito ou < 1 → 1; > max → max; trunca decimais
   export function todayUtc(now: Date = new Date()): string;               // "YYYY-MM-DD" em UTC (D16)
   export function buildDiscoverParams(query: ListingQuery, today: string): Record<string, string>;
   export function buildSearchParams(query: ListingQuery): Record<string, string>;
   export function buildListingRequest(query: ListingQuery, today: string):
     { path: "/discover/movie" | "/search/movie"; params: Record<string, string> };
   ```
   `buildDiscoverParams` devolve, nesta ordem de chaves: `include_adult=false`,
   `sort_by=SORT_BY[sort]`, `page=clampPage(page)`, `with_genres=<genreId>` (só com `genreId`),
   `vote_count.gte=200` (só `sort=rating`), `primary_release_date.lte=<today>` (só
   `sort=release`). `buildSearchParams` devolve `include_adult=false`, `query=<query trimado>`,
   `page=clampPage(page)` — sem gênero nem ordenação, que a API não aceita (D14).
   `buildListingRequest` escolhe `/search/movie` quando `query` trimado é não vazio; senão
   `/discover/movie`. `language` **não** entra aqui: é o `tmdbFetch` que injeta. `today` é
   argumento para os testes serem determinísticos; `fetchListing` passa `todayUtc()` calculado na
   requisição (D16: muda uma vez por dia, um bucket de cache por dia). "Populares" = discover por
   `popularity.desc` (D13), sem `/movie/popular`. `LISTING_SORTS` e `DEFAULT_SORT` são a fonte do
   parser da URL e das opções do `FilterBar` no `listagem-filmes`, para não existir uma segunda
   lista de valores.
   ```ts
   export async function fetchListing(query: ListingQuery): Promise<ListingResult> // revalidate 3 600 s
   ```
   `const { path, params } = buildListingRequest(query, todayUtc())` →
   `toListingResult(await tmdbFetch<TmdbPagedDto<TmdbMovieListItemDto>>(readConfig(), path, params, REVALIDATE_LISTING))`.
   Quando a página pedida é maior que `totalPages`, a API devolve `results: []` sem erro;
   `fetchListing` não refaz a chamada — o `listagem-filmes` decide a UI (`EmptyState` com link
   para a última página) usando `page` e `totalPages` do resultado. Alternativa descartada:
   segunda chamada automática na última página (duas requisições por acesso a URL inválida).
7. **`getMovieDetail` e as pendências** (D18, D19, D21):
   ```ts
   export const DETAIL_APPEND = "credits,videos,translations";
   export const VIDEO_LANGUAGES = "pt-BR,pt,en,null"; // `pt` sozinho só casa com pt-PT
   export async function getMovieDetail(id: number): Promise<MovieDetail | null> // revalidate 3 600 s; null em 404
   ```
   Caminho principal (uma chamada): `GET /movie/{id}?append_to_response=credits,videos,translations&include_video_language=pt-BR,pt,en,null`
   → `toMovieDetail(dto, config.language)`. `TmdbError` com `kind === "not_found"` é capturada e vira
   `null`; qualquer outro `kind` sobe. A sonda da task 5 decide entre os caminhos abaixo; o apply
   implementa **só** o confirmado (sem código morto) e preenche a tabela "Resultado das
   verificações" no fim desta seção:
   - **D18 translations.** Confirmado = `dto.translations.translations` vem na mesma resposta →
     nada muda. Fallback = a API ignora `translations` no `append_to_response` → quando
     `dto.overview` trimado é vazio, `getMovieDetail` faz uma segunda chamada
     `GET /movie/{id}` com `language=en-US` (mesmo `revalidate`) e injeta o resultado como
     `translations = { translations: [{ iso_639_1: "en", iso_3166_1: "US", data: { overview } }] }`
     antes do mapeador; `pickOverview` não muda.
   - **D19 include_video_language.** Confirmado = com `language=pt-BR` e o parâmetro vêm vídeos
     `en` junto com os `pt` → uma chamada só. O valor proposto era `pt,en,null`; a verificação de
     2026-10-07 mostrou que `pt` sozinho casa só com pt-PT e tira os pt-BR da resposta, então o
     valor adotado é `pt-BR,pt,en,null` (a prioridade de `pickTrailer` não muda: pt-BR e pt-PT têm
     `iso_639_1 = "pt"`). Fallback = o parâmetro não
     tem efeito → quando `videos.results` vier vazio, segunda chamada
     `GET /movie/{id}/videos` com `language=en-US` e os `results` dela entram em `pickTrailer`.
     Se o parâmetro for simplesmente ignorado mas os vídeos `en` já vierem, ele fica (inofensivo)
     e a linha de D19 registra "sem efeito observável".
   - **D17 página > 500.** Só registra o status; o clamp já protege nos dois casos.
8. **Mapeadores** (`mappers.ts`, pilar 3):
   ```ts
   export const MAIN_CAST_LIMIT = 8;
   export function toGenre(dto: TmdbGenreDto): Genre;
   export function toGenres(dto: TmdbGenreListDto): Genre[];
   export function toMovieSummary(dto: TmdbMovieListItemDto): MovieSummary;
   export function toListingResult(dto: TmdbPagedDto<TmdbMovieListItemDto>): ListingResult;
   export function toCastMember(dto: TmdbCastDto): CastMember;
   export function toMovieDetail(dto: TmdbMovieDetailDto, requestedLanguage: string): MovieDetail;
   ```
   Regras: `release_date` ausente ou `""` → `releaseDate: null`; `poster_path`/`profile_path`
   ausentes → `null`; `totalPages = Math.min(Math.max(total_pages, 1), MAX_PAGE)` (D17; `0` vira
   `1` para a `Pagination` mostrar "Página 1 de 1" com os dois botões desabilitados); `cast` =
   `credits.cast` ordenado por `order` crescente e cortado em `MAIN_CAST_LIMIT` (contrato do
   `CastList`); `overview = pickOverview(dto, requestedLanguage)`; `trailer =
   pickTrailer(dto.videos?.results)`; `runtime` `null` ou `0` → `null` (a UI omite a duração).
   O mapeador não valida o JSON em runtime (sem zod/type guard): a API é tipada pela referência
   oficial e a sonda confere o formato; um type guard mínimo fica como melhoria futura.
9. **Seleção da sinopse** (`pickOverview.ts`, D18):
   ```ts
   export function pickOverview(
     detail: Pick<TmdbMovieDetailDto, "overview" | "original_language" | "translations">,
     requestedLanguage: string, // "pt-BR" (TMDB_LANGUAGE)
   ): MovieOverview | null;
   ```
   Ordem, parando no primeiro texto não vazio após `trim()`: (1) `detail.overview` → `language`
   = subtag primária de `requestedLanguage` (`"pt"`); (2) em `translations.translations`, a de
   `iso_639_1 === "en"` (prefere `iso_3166_1 === "US"`, senão a primeira `en`) → `"en"`; (3) a de
   `iso_639_1 === detail.original_language` → esse idioma; (4) a primeira não vazia na ordem do
   array → seu `iso_639_1`; (5) `null` (a UI mostra "Sinopse não disponível."). `translations`
   ausente pula para (5). O passo (3) refina o "qualquer não vazia" de D18 com um desempate
   determinístico e útil (a sinopse original antes de uma tradução arbitrária); pt-PT cai no
   passo (3)/(4) como qualquer outro idioma, como D18 descreve. O `language` sai como ISO 639-1
   para o `Overview` montar o aviso ("Sinopse disponível apenas em inglês") com
   `Intl.DisplayNames("pt-BR", { type: "language" })` em `src/lib/format/` no `detalhe-filme`.
10. **Seleção do trailer** (`pickTrailer.ts`, D19):
    ```ts
    export function pickTrailer(videos: readonly TmdbVideoDto[] | undefined): MovieTrailer | null;
    ```
    Filtra `site === "YouTube" && type === "Trailer"` com `key` não vazia (Teaser, Clip,
    Featurette e outros sites ficam de fora); ordena por `official` (true primeiro), depois idioma
    (`pt` = 0, `en` = 1, outros = 2), depois `published_at` decrescente (comparação de string ISO;
    ausente conta como a mais antiga); devolve `{ key, name }` do primeiro ou `null`. Sem Teaser
    como fallback: o enunciado pede trailer e o `TrailerEmbed` omite a seção com `null`.
11. **URLs de imagem** (`images.ts`, D23):
    ```ts
    export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
    export const POSTER_SIZE = { card: "w342", detail: "w500" } as const;
    export const PROFILE_SIZE = "w185";
    export type PosterSize = (typeof POSTER_SIZE)[keyof typeof POSTER_SIZE];
    export function posterUrl(path: string | null | undefined, size: PosterSize): string | null;
    export function profileUrl(path: string | null | undefined, size: string = PROFILE_SIZE): string | null;
    ```
    `null`, `undefined` ou `""` → `null` (a UI mostra o placeholder `bg-surface-200`); senão
    `${TMDB_IMAGE_BASE}/${size}${path}` (o `path` da API já começa com `/`). Sem `server-only`:
    `MovieCard` é shared e o `FavoritesList` (client) monta a URL a partir do snapshot. Os tamanhos
    batem com `images.remotePatterns` (`/t/p/**`) do `next.config.ts`; `next/image` com `fill` +
    `sizes` nos componentes, então não exportamos largura/altura.
12. **Fixtures e testes** (D7) — `src/lib/tmdb/fixtures/`: `genres.json` (3 gêneros em pt-BR),
    `discover-page.json` (`page: 1`, `total_pages: 51_234`, `total_results` coerente, 3 itens:
    `603` completo; um com `poster_path: null` e `release_date: ""`; um com `vote_count: 0`),
    `movie-603.json` (detalhe de Matrix com `overview` pt-BR, `credits.cast` com 10 pessoas em
    ordem embaralhada, `videos.results` com 5 vídeos — Teaser `en`, Trailer `en` não oficial
    antigo, Trailer `en` oficial, Trailer `pt`, Trailer no Vimeo — e `translations` com `pt-BR`,
    `en-US` e `ja`). Variantes (sem sinopse pt, só `ja`, sem vídeos) são derivadas no teste com
    spread, sem fixture extra. Testes: `errors.test.ts` (mapeamento de status, `name`, `status`,
    `cause`), `params.test.ts` (uma asserção por regra de D13–D17 e `todayUtc` com data injetada),
    `images.test.ts`, `pickOverview.test.ts` (cinco passos + `translations` ausente + só espaços),
    `pickTrailer.test.ts` (vazio, só Teaser, oficial > não oficial, `pt` > `en`, desempate por
    data, Vimeo ignorado), `mappers.test.ts` (summary com os três itens, `totalPages` 51 234 → 500
    e 0 → 1, detalhe com elenco ordenado e cortado em 8, `runtime`, `overview` e `trailer`
    preenchidos pelas seleções). Nenhum teste importa `client.ts`.
13. **Sonda e verificação real** (critério do change) — `scripts/tmdb-probe.mjs` (ESM, Node 22,
    sem dependências, mesmo estilo do `check-tokens.mjs`): lê `TMDB_API_READ_TOKEN` (sai com
    código 1 nomeando a variável se faltar) e `TMDB_LANGUAGE`; faz (1) `GET /movie/603?append_to_response=credits,videos,translations&include_video_language=pt-BR,pt,en,null`
    e imprime status, tamanho de `overview`, se `translations` veio e quantos idiomas, e os
    `iso_639_1-iso_3166_1`/`type`/`official` de `videos.results` (o país separa pt-BR de pt-PT); (2) a mesma URL **sem**
    `include_video_language` e imprime a diferença de vídeos; (3) `GET /discover/movie?page=501`
    e imprime status e `status_message`. Também aceita um id como argumento para testar um filme
    sem sinopse em pt-BR. Uso: `node --env-file=.env.local scripts/tmdb-probe.mjs [id]`. A saída
    vai para a evidência do apply e decide os caminhos da decisão 7. Alternativa descartada: `curl`
    manual (saída de 40 KB sem resumo, token digitado na linha de comando).
    Resultado das verificações (preencher no apply, task 5.5):
    | Pendência | Esperado | Resultado | Caminho adotado | Data |
    |---|---|---|---|---|
    | D18 `translations` via `append_to_response` | array `translations.translations` presente | Presente: 51 idiomas (47 com `overview`) no 603; nos ids 20000 e 500000, sem `overview` pt-BR (`""`), `en-US` presente com texto | Confirmado: uma chamada, sem fallback | 2026-10-07 |
    | D19 `include_video_language` (proposto `pt,en,null`) | vídeos `en` com `language=pt-BR` | Em `/movie/{id}/videos` com `language=pt-BR`: sem o parâmetro vêm só os vídeos pt-BR (603: 2; 598: 3; 27205: 2); com `pt,en,null` vêm en-US e pt-PT, **sem os pt-BR** (603: 29 en; 598: 11 en + 1 pt-PT; 27205: 27 en + 1 pt-PT), porque `pt` sozinho casa só com pt-PT; com `pt-BR,pt,en,null` vêm os três (603: 29 en + 2 pt-BR; 598: 11 en + 3 pt-BR + 1 pt-PT; 27205: 27 en + 2 pt-BR + 1 pt-PT). Na sonda com o valor adotado: 603 traz 29 en-US + 2 pt-BR (2 pt-BR sem o parâmetro); 20000 traz 1 en-US (0 sem); 500000 não tem vídeos | O parâmetro tem efeito; valor trocado para `pt-BR,pt,en,null` (aprovado pelo usuário), uma chamada, sem fallback; `pickTrailer` não muda | 2026-10-07 |
    | D17 erro acima da página 500 | HTTP 422 | HTTP 400, `Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.` (status diferente do esperado; a mensagem confirma o limite de 500) | clamp em `params.ts` (nada no código; 400 já cai em `unavailable`) | 2026-10-07 |
14. **Documentação** — README (seção "Decisões técnicas e trade-offs"): um parágrafo por decisão
    D12, D13, D15, D16, D17, D18, D19, D20, D21, D23, com o resultado da sonda em D18/D19; "Como
    rodar" ganha a linha da sonda ("para conferir o token: `node --env-file=.env.local
    scripts/tmdb-probe.mjs`"); subseção "Segurança do token" (D12: Bearer no header, só no
    servidor, `server-only`, nunca `NEXT_PUBLIC_`). `.env.example` não muda. `decisoes.md`: linhas
    D17, D18, D19 e a tabela "Pendências de verificação" recebem o resultado; se um fallback for
    adotado, a coluna "Decisão" passa a descrevê-lo.

## Riscos / Trade-offs
- Formato real da API diferente dos tipos escritos sem rede → a task 5 roda a sonda antes de
  fechar; divergência vira correção em `types.ts`, fixtures e testes no mesmo apply.
- `client.ts` sem teste unitário (importa `server-only`, que lança fora de RSC) → a lógica que
  importa está nas funções puras testadas; `tmdbFetch` tem 30 linhas e é exercitado pela sonda
  (mesmas URLs) e pelas páginas do `listagem-filmes`. Se um dia precisar, `vitest.config.mts`
  pode receber `resolve.alias: { "server-only": <módulo vazio> }` — não feito agora.
- `include_video_language` pode ser ignorado pela API → inofensivo; o fallback de D19 cobre o caso
  em que os vídeos `en` não vêm.
- O Next pode cachear respostas de erro do `fetch` com `force-cache` → com `revalidate` de 3 600 s
  o efeito é limitado; para 404 do detalhe é até desejável. Não se mitiga além disso.
- `primary_release_date.lte` muda a URL uma vez por dia → um bucket de cache por dia (D16),
  aceitável.
- `total_pages` com `0` em busca sem resultado → `Math.max(…, 1)` evita "Página 1 de 0".
- `resolveJsonModule` precisa estar ligado para os fixtures → a CLI do Next já liga; a task 1.1
  confere.
- Rótulo de idioma do `overview` principal assume que a API devolveu o idioma pedido → se o TMDB
  passar a cair em inglês sozinho, o aviso de idioma não apareceria; a sonda com um filme sem
  sinopse pt-BR (argumento `[id]`) confere o comportamento atual. Verificado em 2026-10-07 nos ids
  20000 e 500000: a API devolve `overview` vazio (não cai em inglês), então o rótulo vale.
- Sem validação de JSON em runtime → se a API mudar um campo, o erro aparece como `undefined` na
  UI e não como `TmdbError`; type guard mínimo listado em "Melhorias futuras" do README.
- 429 sem retry → o `error.tsx` mostra "Tentar novamente"; o limite do TMDB é alto para o uso
  do teste.
- Decisões para o README (seção "Decisões técnicas e trade-offs"): D12, D13, D15, D16, D17, D18,
  D19, D20, D21, D23 (D14 entra pelo `listagem-filmes`, que faz a UI; aqui só o lado da API).
