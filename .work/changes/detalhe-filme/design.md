# Design — detalhe-filme

## Contexto
Ao fim do `favoritos` o repositório tem o shell do `setup-catalogo` (`src/app/layout.tsx` com
Header, container `max-w-[1200px] px-4 sm:px-10` e `metadata.title.template` "%s · Catálogo.";
`globals.css` com os 14 tokens no `@theme`; `Button`/`ButtonLink`; Vitest 5 com jsdom;
`scripts/check-tokens.mjs`; toggle `CATALOGO_CACHE_COMPONENTS`; `images.remotePatterns` para
`image.tmdb.org/t/p/**`), a porta TMDB em `src/lib/tmdb/` (só `client.ts` tem `server-only`), a
listagem em `/` (`src/lib/listing/`, `src/lib/format/`, `src/components/movies/`,
`src/components/ui/{EmptyState,ErrorState}.tsx`, `src/app/error.tsx`) e os favoritos
(`src/lib/favorites/`, `src/components/favorites/`). Não existem `src/app/movie/`,
`src/components/movie-detail/`, `src/lib/format/{runtime,languageName,movieMeta}.ts`,
`src/lib/listing/backHref.ts` nem `src/lib/tmdb/parseMovieId.ts`. Nenhum arquivo existente de
`src/` é alterado por este change.

Contratos consumidos (dos `design.md` de `tmdb-client`, `listagem-filmes` e `favoritos`, sem reabrir):
- `src/lib/tmdb/client.ts` (`server-only`): `getMovieDetail(id: number): Promise<MovieDetail | null>`
  — `GET /movie/{id}?append_to_response=credits,videos,translations&include_video_language=pt,en,null`,
  `cache: "force-cache"` + `revalidate: 3600` (D20); `TmdbError` `not_found` é capturada dentro
  dela e vira `null`; os demais `kind` (`config`, `unauthorized`, `rate_limited`, `unavailable`)
  sobem (D21). A mesma chamada em `generateMetadata` e em `MovieDetails` cai na memoização de
  requisição do Next (mesma URL e opções): uma chamada HTTP por render (spec `cliente-tmdb`,
  cenário "Mesma URL no mesmo render").
- `src/lib/tmdb/types.ts`: `MovieDetail = { id, title, posterPath: string | null, releaseDate:
  string | null, runtime: number | null, genres: Genre[], voteAverage, voteCount, overview:
  MovieOverview | null, cast: CastMember[], trailer: MovieTrailer | null }`; `MovieOverview = { text,
  language }` (`language` em ISO 639-1: "pt", "en", "ja"); `MovieTrailer = { key, name }` (sempre
  YouTube); `CastMember = { id, name, character, profilePath: string | null, order }`; `Genre =
  { id, name }`. O `MovieDetail` chega **pronto**: `toMovieDetail` já aplicou `pickOverview` (ordem
  pt → en → original → qualquer → `null`) e `pickTrailer` (YouTube `Trailer`, `official` > `pt` >
  `en` > mais recente, ou `null`), e `cast` já vem ordenado por `order` e cortado em
  `MAIN_CAST_LIMIT = 8`; `runtime` `0`/`null` já vem como `null`; `releaseDate` `""` já vem como
  `null`. Nenhum componente deste change reaplica essas regras.
- `src/lib/tmdb/images.ts` (puro): `posterUrl(path, size): string | null`, `POSTER_SIZE =
  { card: "w342", detail: "w500" }`, `profileUrl(path, size = PROFILE_SIZE): string | null`,
  `PROFILE_SIZE = "w185"`; `null`/`""` → `null` (placeholder).
- `src/lib/listing/params.ts` (puro): `parseListingParams(input: URLSearchParams | Record<string,
  string | string[] | undefined>): ListingQuery` (normaliza `q`, `genre`, `sort`, `page`; D14 e
  D17 aplicados) e `buildListingHref(query): "/" | "/?q=…"` (omite defaults). O `MovieCard` emite
  `/movie/{id}?from=${encodeURIComponent(buildListingSearch(params))}` e omite `from` quando a busca
  é vazia; o `FavoritesList` renderiza os cards sem `from`.
- `src/lib/format/rating.ts`: `formatRating(voteAverage, voteCount)` → "Nota 7,2" | "Sem nota"
  (`voteCount === 0`). `src/lib/format/releaseYear.ts`: `releaseYear(releaseDate)` → `number | null`.
  Os formatadores só do detalhe (`formatRuntime`, rótulo de idioma com `Intl.DisplayNames`) foram
  deixados por escrito para este change ("Não-objetivos" do design do `listagem-filmes`).
- `src/components/ui/EmptyState.tsx` (shared): `{ icon: "search" | "heart" | "alert" | "film",
  title, description?, action?: { label, href } | { label, onClick } }`; `film` previsto para o
  not-found. `src/components/ui/ErrorState.tsx` (client): `{ error, reset, title? }`; faz
  `startTransition(() => { router.refresh(); reset(); })` em "Tentar novamente"; `title?` existe
  para o detalhe dizer "o filme". `src/app/error.tsx` só renderiza `ErrorState` — molde do
  `error.tsx` do segmento.
- `src/components/movies/MovieGridSkeleton.tsx` (shared): `role="status"` + `sr-only`, blocos
  `aria-hidden` em `bg-surface-200 animate-pulse` e linhas `bg-surface-100` — referência visual do
  `DetailSkeleton`.
- `src/components/favorites/FavoriteButton.tsx` (client): `FavoriteButtonProps { movie:
  FavoriteMovie; variant: "icon" | "full" }`; `full` = `inline-flex min-h-11 items-center gap-2
  rounded-lg bg-accent px-[18px] font-semibold text-on-accent`, texto visível "Adicionar aos
  favoritos"/"Remover dos favoritos", `aria-pressed`, sem `aria-label`. `FavoriteMovie = { id,
  title, posterPath, voteAverage, voteCount, releaseDate }`: `MovieDetail` satisfaz por estrutura;
  `toFavoriteSnapshot` copia só os seis campos no clique.

Referência visual: `.work/design/screens/Detalhe.dc.html` (valores inline: `main` com `gap: 24px`;
"← Voltar à listagem" `align-self: flex-start`, `min-height: 44px`, `color: #a3a6ad` =
`text-muted`, peso 500, seta SVG 16 px; bloco `display: flex; flex-wrap: wrap; gap: 40px;
align-items: flex-start`; pôster `flex: 1 1 240px; max-width: 300px; aspect-ratio: 2/3; border-radius:
12px; background: #23262c` = `surface-200` com rótulo "Pôster" em `#6e727b` = `text-subtle` 12 px;
coluna `flex: 999 1 560px; min-width: 0; gap: 28px`; `h1` Plus Jakarta Sans 800, 44 px, `line-height:
1.1`, `letter-spacing: -0.01em`; meta `color: #a3a6ad`; chips `gap: 12px; margin-top: 12px`; chip
"Nota" `min-height: 44px; padding: 0 16px; border-radius: 8px; background: #23262c` = `surface-200`,
peso 600; botão âmbar 44 px, `padding: 0 18px`; seções com `h2` 20 px/700 e `gap` 8 px (sinopse,
`max-width: 720px`, `line-height: 1.6`, `color: #cfd1d6` = `text-secondary`) ou 12 px (elenco,
trailer); elenco `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px`,
`figure` com foto `aspect-ratio: 1/1; border-radius: 12px; background: #23262c` e `figcaption`
com nome 600 `#ececef` e personagem 13 px `#a3a6ad`; trailer `aspect-ratio: 16/9; max-width:
800px; border-radius: 12px; border: 1px solid #2a2d34; background: #1c1e23` = `surface-100`) e
`screens/pdf/detalhe.png`. O protótipo desenha 4 cards de elenco e o `[Player do trailer]`; aqui o
elenco vai até 8 e a seção de trailer só existe com vídeo. Contratos em `.work/design/components.md`
(fronteira server × client do detalhe; linhas `BackLink`, `MovieDetails`, `MovieHeader`,
`RatingChip`, `Overview`, `CastList`/`CastCard`, `TrailerEmbed`, `DetailSkeleton`; tabela "Páginas
e arquivos de rota" para `src/app/movie/[id]/*`; "Estados que o protótipo não desenha";
"Acessibilidade").

Fatos do Next 16.4 que o design assume e a task 1.1 confere nos docs instalados
(`node_modules/next/dist/docs/`):
- `params` e `searchParams` são Promise; `PageProps<"/movie/[id]">` é global após `next typegen`,
  com `params: Promise<{ id: string }>`. O `await` dentro de um componente sob `<Suspense>` cria um
  buraco dinâmico (com `cacheComponents`) ou um ponto de streaming (sem); um `await` no corpo da
  página, fora de Suspense, torna a rota inteira dinâmica e, com a flag, gera o erro/insight de
  blocking-route no build e no `next dev`.
- Sem `generateStaticParams`, nenhum `/movie/{id}` é pré-renderizado no build: o build passa sem
  token e sem rede. Com `cacheComponents`, a rota recebe um shell de fallback (o que está fora dos
  `<Suspense>`) e os buracos rodam na requisição.
- `generateMetadata` recebe os mesmos `params`/`searchParams`; o `fetch` feito nele é memoizado com o
  da página (mesma URL e opções) no mesmo render. Desde o Next 15.2 a metadata dinâmica é
  **transmitida** (streaming) para navegadores e não bloqueia a UI inicial; a task 1.1 confere na
  versão instalada o comportamento com `cacheComponents` ligado e a lista `htmlLimitedBots`.
- `notFound()` (`next/navigation`) lança e o segmento renderiza `not-found.tsx`. Quando é chamado
  dentro de um buraco de Suspense já depois de o shell ter sido enviado, a UI de not-found aparece
  normalmente, mas o status HTTP pode já ter saído como 200 (o Next inclui `<meta name="robots"
  content="noindex">`); a task 6.2 registra o status observado com e sem a flag.
- `error.tsx` recebe `error` (com `digest`) e `reset`; erros de Server Components só se recuperam
  com `router.refresh()` + `reset()`, que o `ErrorState` já faz.
- `next/image` com `fill` + `sizes` e URL liberada em `remotePatterns`; a otimização roda na
  requisição, não no build.

## Objetivos
- [#L6] verificável no browser: `/movie/603` completo (pôster, título, "Ano · Duração · Gêneros",
  chip de nota, botão de favorito, sinopse, elenco até 8, trailer); `/movie/abc`, `/movie/0` e id
  inexistente → not-found; sinopse nos três casos de D18; trailer some sem vídeo; "Voltar" preserva
  filtros; 390 e 1280 px (critério da linha 5 de `.work/backlog.md`).
- Pilar 1 numa rota dinâmica: `page.tsx` sem `await`, `BackLinkLoader` e `MovieDetails` sob
  `<Suspense>` irmãos; nenhum fetch alcançável pelo shell; nenhum `Date`/`Math.random` no shell.
  Código idêntico nos dois modos de `cacheComponents` (D2), sem `'use cache'`/`cacheLife`.
- Funções puras testadas (`parseMovieId`, `backHref`, `formatRuntime`, `languageName`,
  `formatMovieMeta`) e os três casos da sinopse cobertos por teste de componente (pilar 3, D7).
- Estados definidos e visíveis: `DetailSkeleton`, not-found, erro do segmento, sem pôster, sem foto,
  sem duração/gêneros/data, sem votos, sem elenco, sem trailer (pilar 6; D36, D37).
- Cores só por token; `accent` só no `FavoriteButton full` (ação primária) e no hover do
  `BackLink`; a11y: `h1` único, `figure`/`figcaption`, iframe com `title`, `lang` na sinopse em outro
  idioma, controles com `min-h-11` (pilar 5).
- `npm run check` e `npm run build` verdes sem token e sem rede; build e `next dev` com
  `CATALOGO_CACHE_COMPONENTS=1` sem insight de blocking-route (D42).

## Não-objetivos
- Alterar `src/lib/tmdb/client.ts`, `mappers.ts`, `pickOverview.ts`, `pickTrailer.ts`: os fallbacks
  de D18/D19 decididos pela sonda do `tmdb-client` (segunda chamada quando `translations` não vem
  anexado ou quando `videos.results` vem vazio) vivem lá; este change consome `MovieDetail` como ele
  chega.
- Alterar `MovieCard`, `MovieGrid`, `FavoritesList`, `FavoriteButton`, `EmptyState`, `ErrorState`,
  `src/lib/listing/params.ts`, `src/lib/format/{rating,releaseYear}.ts`, `next.config.ts`.
- `generateStaticParams` (pré-render de filmes populares no build: exigiria token e rede, pilar 7).
- Lite embed do YouTube (thumbnail que carrega o player ao clicar): melhoria futura registrada em
  D38. `router.back()` como "Voltar" (descartado em D39).
- Elenco completo, galeria de imagens, filmes semelhantes, recomendações, provedores de streaming,
  avaliações de usuários; `og:image` com o pôster; breadcrumbs; `loading.tsx` global (D37).
- Teste unitário de `MovieDetails` e `BackLinkLoader` (async RSC não roda no Vitest, D7; importam
  `server-only`/`PageProps`; verificados no browser nas tasks 6.x).
- README e `decisoes.md` como texto (a lista para o README está em Riscos / Trade-offs; nenhuma
  decisão é reaberta); `components.md` só no apply (task 7.1).

## Abordagem
- Composição sobre dados prontos: `MovieDetails` chama `getMovieDetail` uma vez e distribui o
  `MovieDetail` pelos componentes de apresentação (`MovieHeader`, `Overview`, `CastList`,
  `TrailerEmbed`), que são Server Components síncronos, sem hook e sem `server-only`, recebendo
  tipos de domínio — por isso são testáveis no Vitest com Testing Library quando vale a pena.
- Duas fontes dinâmicas, dois `<Suspense>`: `params.id` alimenta o fetch (`MovieDetails`, fallback
  `DetailSkeleton`); `searchParams.from` alimenta só o href de "Voltar" (`BackLinkLoader`, fallback
  `<BackLink href="/" />`, que é um link válido). O shell (`article` + os dois fallbacks) é estático
  nos dois modos; o buraco do `BackLink` resolve sem rede e o do detalhe depende do TMDB (cache de
  1 h). Mesma forma do `page.tsx` da listagem (dois irmãos) e mesmo padrão `XLoader` do
  `FilterBarLoader`.
- A lógica que só o detalhe precisa vira função pura no domínio certo (pilar 2): id da rota em
  `src/lib/tmdb/` (é um id do TMDB), href de volta em `src/lib/listing/` (é a URL da listagem),
  duração/idioma/linha de metadados em `src/lib/format/`. Nenhuma pasta nova em `src/lib/`.
- Única ilha client nova na tela: nenhuma. `FavoriteButton` (já existe) e `ErrorState` (já existe)
  são as duas ilhas; tudo o mais é RSC ou shared.
- Cores só por token (classes 1:1 de `globals.css`); medidas do protótipo em utilitários
  (`min-h-11`, `rounded-lg`, `rounded-xl`, `text-[44px]`, `text-[13px]`, `max-w-[720px]`,
  `max-w-[800px]`); nada em `globals.css`.
- Testes: funções puras com casos de borda; `Overview` (os três casos de D18 são o requisito, não
  é cortável); `CastList`, `TrailerEmbed`, `MovieHeader` com Testing Library (cortáveis por D43,
  verificados no browser de qualquer forma).

## Decisões técnicas
1. **Mapa de arquivos e fronteira** (aplica pilares 1, 2, 3; `components.md` › Fronteira server ×
   client):
   | Arquivo | Tipo | Exporta | Importa de |
   |---|---|---|---|
   | `src/lib/tmdb/parseMovieId.ts` | puro | `parseMovieId` | — |
   | `src/lib/listing/backHref.ts` | puro | `backHref` | `@/lib/listing/params` |
   | `src/lib/format/runtime.ts` | puro | `formatRuntime` | — |
   | `src/lib/format/languageName.ts` | puro | `languageName` | — |
   | `src/lib/format/movieMeta.ts` | puro | `formatMovieMeta`, `MovieMetaInput` | `./releaseYear`, `./runtime` |
   | `src/components/movie-detail/BackLink.tsx` | RSC (sem hook) | `BackLink`, `BackLinkProps` | `next/link` |
   | `src/components/movie-detail/BackLinkLoader.tsx` | RSC async | `BackLinkLoader`, `BackLinkLoaderProps` | `@/lib/listing/backHref`, `./BackLink` |
   | `src/components/movie-detail/RatingChip.tsx` | RSC (sem hook) | `RatingChip`, `RatingChipProps` | `@/lib/format/rating` |
   | `src/components/movie-detail/Overview.tsx` | RSC (sem hook) | `Overview`, `OverviewProps`, `overviewNotice` | `@/lib/tmdb/types`, `@/lib/format/languageName` |
   | `src/components/movie-detail/CastCard.tsx` | RSC (sem hook) | `CastCard`, `CastCardProps` | `next/image`, `@/lib/tmdb/images`, `@/lib/tmdb/types` |
   | `src/components/movie-detail/CastList.tsx` | RSC (sem hook) | `CastList`, `CastListProps` | `@/lib/tmdb/types`, `./CastCard` |
   | `src/components/movie-detail/TrailerEmbed.tsx` | RSC (sem hook) | `TrailerEmbed`, `TrailerEmbedProps`, `trailerEmbedUrl` | `@/lib/tmdb/types` |
   | `src/components/movie-detail/MovieHeader.tsx` | RSC (sem hook) | `MovieHeader`, `MovieHeaderProps` | `next/image`, `@/lib/tmdb/images`, `@/lib/tmdb/types`, `@/lib/format/movieMeta`, `./RatingChip`, `@/components/favorites/FavoriteButton` |
   | `src/components/movie-detail/DetailSkeleton.tsx` | shared | `DetailSkeleton` | — |
   | `src/components/movie-detail/MovieDetails.tsx` | RSC async | `MovieDetails`, `MovieDetailsProps` | `next/navigation` (`notFound`), `@/lib/tmdb/client`, `@/lib/tmdb/parseMovieId`, `./MovieHeader`, `./Overview`, `./CastList`, `./TrailerEmbed` |
   | `src/app/movie/[id]/page.tsx` | RSC | `default`, `generateMetadata` | `react` (`Suspense`), `@/lib/tmdb/client`, `@/lib/tmdb/parseMovieId`, `BackLink`, `BackLinkLoader`, `MovieDetails`, `DetailSkeleton` |
   | `src/app/movie/[id]/not-found.tsx` | RSC | `default` | `@/components/ui/EmptyState` |
   | `src/app/movie/[id]/error.tsx` | client | `default` | `@/components/ui/ErrorState` |
   Regra de importação: só `MovieDetails` e `page.tsx` (`generateMetadata`) importam
   `@/lib/tmdb/client` (`server-only`); nenhum componente de apresentação o importa, por isso
   `Overview`, `CastList`, `TrailerEmbed` e `MovieHeader` rodam no Vitest. `RatingChip`, `Overview`,
   `CastList`/`CastCard`, `TrailerEmbed`, `MovieHeader` e `BackLink` são Server Components por
   posição (renderizados a partir de RSC) mas não têm diretiva nem `server-only`: tecnicamente
   shared, como `components.md` já faz com `MovieCard`. Sem `index.ts` (convenção do `tmdb-client`).
   Nome `BackLinkLoader` segue `FilterBarLoader` (RSC async que resolve uma entrada e renderiza o
   componente de apresentação); é componente **novo** em relação a `components.md`, registrado na
   task 7.1. `parseMovieId.ts` e `backHref.ts` seguem a convenção "arquivo nomeado pela função
   quando o módulo tem uma só" (`pickOverview.ts`, `releaseYear.ts`); `runtime.ts` e `movieMeta.ts`
   seguem `rating.ts` (arquivo pelo conceito, função com prefixo `format`).
2. **`page.tsx`: shell estático, dois `<Suspense>` e `generateMetadata`** (D2, D37, D39; pilar 1):
   ```tsx
   import type { Metadata } from "next";
   import { Suspense } from "react";

   export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
     const { id } = await params;
     const movieId = parseMovieId(id);
     if (movieId === null) return { title: "Filme não encontrado" };
     const movie = await getMovieDetail(movieId).catch(() => null);
     return { title: movie?.title ?? "Filme" };
   }

   export default function MoviePage({ params, searchParams }: PageProps<"/movie/[id]">) {
     return (
       <article className="flex flex-col gap-6">
         <Suspense fallback={<BackLink href="/" />}>
           <BackLinkLoader searchParams={searchParams} />
         </Suspense>
         <Suspense fallback={<DetailSkeleton />}>
           <MovieDetails params={params} />
         </Suspense>
       </article>
     );
   }
   ```
   A página recebe as duas Promises e **não** faz `await`: `params` desce para `MovieDetails` e
   `searchParams` para `BackLinkLoader`. Sem a flag, `/movie/[id]` é dinâmica (`ƒ`) e os fallbacks
   aparecem só durante o streaming; com a flag, o shell (`article`, `BackLink` para `/`,
   `DetailSkeleton`) é pré-renderizado como fallback shell e os dois buracos rodam na requisição —
   sem `generateStaticParams`, nenhum id é pré-renderizado e o build não toca o TMDB. Dois
   boundaries em vez de um porque as duas fontes são independentes: o href de "Voltar" resolve sem
   rede e não deve esperar o fetch; se o fetch falhar, o `error.tsx` substitui o segmento inteiro
   (inclusive o `BackLink`), o que é aceitável. `generateMetadata`: o título da aba é o do filme
   ("Matrix · Catálogo." pelo template do layout); `getMovieDetail` é o mesmo da página, memoizado
   (uma chamada HTTP por render, contrato do `tmdb-client`); `notFound()` **não** é chamado aqui (é o
   `MovieDetails` quem decide) e qualquer erro é engolido com `.catch(() => null)` para que a
   metadata nunca seja a origem do erro — o `MovieDetails` lança o mesmo erro e o `error.tsx` o
   mostra. Fallbacks de título: id inválido → "Filme não encontrado" (coerente com a UI que o
   `MovieDetails` vai pedir); fetch falhou → "Filme". Com a flag ligada, `await params` em
   `generateMetadata` torna a metadata dinâmica e transmitida por streaming (não entra no shell); a
   task 1.1 confere nos docs instalados que isso não dispara o insight de blocking-route e a task
   6.6 confirma no `next dev`. Alternativas descartadas: `loading.tsx` do segmento (esconderia o
   `BackLink`, D37); um único `<Suspense>` com o `BackLink` dentro do `MovieDetails` (prenderia o
   link ao fetch e ao `from?` do contrato; ver decisão 4); `metadata` estática "Filme" (perde o
   título na aba e no histórico); `generateStaticParams` (pilar 7).
3. **Validação do id e not-found** (`parseMovieId`, `MovieDetails`, `not-found.tsx`; D21, D36, D37):
   ```ts
   // src/lib/tmdb/parseMovieId.ts
   export function parseMovieId(raw: string | undefined): number | null;
   // "603" → 603; "abc", "0", "-1", "1.5", "0603", "603abc", "", undefined, 17 dígitos → null
   ```
   Aceita só inteiro positivo em forma canônica (`/^[1-9]\d*$/`) que seja `Number.isSafeInteger`;
   "0603" é rejeitado de propósito (uma URL só, sem normalização silenciosa; o `MovieCard` nunca
   gera isso). `MovieDetails`:
   ```ts
   export interface MovieDetailsProps { params: PageProps<"/movie/[id]">["params"] }
   export async function MovieDetails({ params }: MovieDetailsProps): Promise<ReactNode>;
   ```
   Fluxo: `const { id } = await params` → `const movieId = parseMovieId(id)` → `if (movieId ===
   null) notFound()` (sem chamada ao TMDB para id inválido) → `const movie = await
   getMovieDetail(movieId)` → `if (!movie) notFound()` (404 do TMDB já virou `null` dentro do
   cliente, interpretação de D21 registrada no `tmdb-client`; sem `instanceof`) → `<MovieHeader
   movie={movie}><Overview overview={movie.overview} /><CastList cast={movie.cast} /><TrailerEmbed
   trailer={movie.trailer} /></MovieHeader>`. Qualquer outro `TmdbError` (`config` sem token,
   `unauthorized`, `rate_limited`, `unavailable`) sobe para `src/app/movie/[id]/error.tsx`.
   `not-found.tsx` (RSC, sem props, sem `searchParams` — o Next não passa nada a ele):
   ```tsx
   export default function MovieNotFound() {
     return (
       <EmptyState icon="film" title="Filme não encontrado"
         description="O endereço pode estar errado ou o filme não existe no TMDB."
         action={{ href: "/", label: "Voltar à listagem" }} />
     );
   }
   ```
   O `from` não é alcançável no not-found (sem props), então a ação vai para `/` — é o "sem `from`
   → `/`" de D39 aplicado ao único lugar onde ele não existe. O `Header` continua visível. Status
   HTTP: sem a flag, o `notFound()` acontece durante o streaming da rota dinâmica; com a flag, o
   shell estático já pode ter saído com 200 e a UI de not-found chega no buraco (com `noindex`).
   O critério do backlog é a UI ("`/movie/abc` e id inexistente → not-found"); o status observado em
   cada modo é registrado na task 6.2, sem mitigação além disso (fazer o `await params` fora do
   Suspense para garantir 404 tornaria a rota inteira dinâmica e quebraria a flag).
   Interpretação de `components.md` registrada: `MovieDetails` perde a prop `from?` (o `from` é
   consumido pelo `BackLinkLoader`, decisão 4); `params` continua `Promise<{ id: string }>`.
4. **"Voltar à listagem" com `?from=` validado** (`backHref`, `BackLink`, `BackLinkLoader`; D39, D43):
   ```ts
   // src/lib/listing/backHref.ts
   export function backHref(from: string | string[] | undefined): string;
   ```
   `const raw = Array.isArray(from) ? from[0] : from; if (!raw) return "/"; return
   buildListingHref(parseListingParams(new URLSearchParams(raw)))`. O `from` chega ao servidor já
   decodificado pelo Next (`q=matrix&page=2`, como o `MovieCard` serializou com
   `buildListingSearch`); `URLSearchParams` o reparte e `parseListingParams` normaliza como faz com
   a própria listagem (`page=999` → 500, `sort=foo` → omitido, `q=m&genre=28` → `/?q=m` por D14,
   lixo qualquer → `/`). A saída é sempre `/` ou `/?…` construída por `buildListingHref`: nunca uma
   URL externa, nunca um valor vindo do usuário sem passar pelo parser. Fica em `src/lib/listing/`
   porque é "href da URL da listagem" (pilar 2), ao lado de `params.ts`, que não muda.
   ```ts
   // BackLink.tsx (RSC, sem hook)
   export interface BackLinkProps { href: string }
   export function BackLink({ href }: BackLinkProps): ReactNode;
   // BackLinkLoader.tsx (RSC async)
   export interface BackLinkLoaderProps { searchParams: PageProps<"/movie/[id]">["searchParams"] }
   export async function BackLinkLoader({ searchParams }: BackLinkLoaderProps): Promise<ReactNode>;
   ```
   `BackLink`: `<Link href={href} className="inline-flex min-h-11 items-center gap-2 self-start
   font-medium text-text-muted hover:text-accent">` com a seta do protótipo (`<svg width="16"
   height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">` com `M19 12H5` e `m12 19-7-7
   7-7`) e o texto visível "Voltar à listagem" — sem `aria-label` (o nome acessível é o texto; o
   `aria-label` do pilar 5 é só para botão/link só com ícone). `BackLinkLoader`: `const { from } =
   await searchParams; return <BackLink href={backHref(from)} />`. O fallback do Suspense é
   `<BackLink href="/" />`: um link correto para quem clica antes de o buraco chegar (e o que a
   `FavoritesList` e um link direto produzem de qualquer forma). D43 lista o `?from=` como segundo
   corte, mas "Voltar preserva filtros" é critério de pronto da linha 5 do backlog: entra; são ~10
   linhas, e se fosse cortado a `BackLinkLoader` viraria `<BackLink href="/" />` fixo no `page.tsx`.
   Alternativas descartadas: `router.back()` (D39: não funciona em link direto e exige ilha client);
   ler `searchParams` no corpo da página (quebra o shell com a flag); passar `from` como prop até o
   `MovieHeader` (o contrato `from?` de `components.md` acoplava o link ao fetch; registrado na
   task 7.1).
5. **Formatadores novos** (`src/lib/format/`; pilar 3; estilo de `rating.ts`/`releaseYear.ts`:
   locale fixo `pt-BR`, sem `Date`, determinísticos):
   ```ts
   // runtime.ts
   export function formatRuntime(minutes: number | null | undefined): string | null;
   // 136 → "2h 16min" · 45 → "45min" · 120 → "2h" · 90.6 → "1h 30min" (trunca) · 0, null, undefined, NaN, -5 → null
   // languageName.ts
   export function languageName(code: string): string | null;
   // "en" → "inglês" · "ja" → "japonês" · "pt" → "português" · "xx", "" → null
   // movieMeta.ts
   export type MovieMetaInput = Pick<MovieDetail, "releaseDate" | "runtime" | "genres">;
   export function formatMovieMeta(movie: MovieMetaInput): string | null;
   // { "1999-03-30", 136, [Ação, Ficção científica] } → "1999 · 2h 16min · Ação, Ficção científica"
   // sem runtime → "1999 · Ação, Ficção científica" · sem data e sem gêneros → "2h 16min" · nada → null
   ```
   `formatRuntime`: `Math.trunc`; `< 60` → "Nmin"; múltiplo de 60 → "Nh"; senão "Nh Mmin" (formato
   compacto, sem espaço em "16min", como o uso corrente em pt-BR; sem `Intl.DurationFormat`, que
   ainda não é universal). `languageName`: `new Intl.DisplayNames(["pt-BR"], { type: "language",
   fallback: "none" })` criado no nível do módulo (determinístico; não é relógio) e `.of(code)` em
   `try/catch` (código vazio ou inválido lança `RangeError` → `null`; desconhecido → `undefined` →
   `null`); devolve a forma do CLDR, já em minúsculas ("inglês"). Só roda no servidor (o `Overview` é
   RSC), onde o Node 22 tem full-icu. `formatMovieMeta`: monta `[releaseYear(releaseDate),
   formatRuntime(runtime), genres.map((g) => g.name).join(", ") || null]`, filtra `null`/vazio e
   junta com " · "; vazio → `null` (o `MovieHeader` omite o parágrafo). É o "omite o pedaço e o
   separador" de `components.md` como função pura em vez de JSX condicional. Alternativas
   descartadas: `Intl.DurationFormat` (suporte parcial); tabela própria de nomes de idioma (o CLDR
   já tem todos); montar a linha no JSX com `&&` (três casos × dois separadores sem teste).
6. **`MovieHeader`** (RSC; D23, D34, D35, D40; `components.md` linha `MovieHeader`):
   ```ts
   export interface MovieHeaderProps { movie: MovieDetail; children?: ReactNode }
   export function MovieHeader({ movie, children }: MovieHeaderProps): ReactNode;
   ```
   Marcação (classes dos tokens 1:1):
   ```tsx
   <div className="flex flex-wrap items-start gap-10">
     <div className="relative aspect-[2/3] w-full max-w-[300px] grow basis-60 overflow-hidden rounded-xl bg-surface-200">
       {poster
         ? <Image src={poster} alt="" fill sizes="300px" priority className="object-cover" />
         : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-xs text-text-subtle">Pôster</span>}
     </div>
     <div className="flex min-w-0 flex-1 basis-[560px] flex-col gap-7">
       <div className="flex flex-col gap-2">
         <h1 className="break-words font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-[44px]">{movie.title}</h1>
         {meta ? <p className="text-text-muted">{meta}</p> : null}
         <div className="mt-3 flex flex-wrap gap-3">
           <RatingChip voteAverage={movie.voteAverage} voteCount={movie.voteCount} />
           <FavoriteButton movie={movie} variant="full" />
         </div>
       </div>
       {children}
     </div>
   </div>
   ```
   `poster = posterUrl(movie.posterPath, POSTER_SIZE.detail)` (`w500`); `meta =
   formatMovieMeta(movie)`. `alt=""` no pôster: a informação ("é o pôster de X") já está no `h1` ao
   lado, e o rótulo "Pôster" do placeholder é decorativo (`text-text-subtle` com `aria-hidden`,
   D34) — mesmo critério do `MovieCard`. `priority` no pôster porque é a imagem LCP da página
   (única `priority` do app; o `MovieCard` não usa). `children` são as seções (`Overview`,
   `CastList`, `TrailerEmbed`) que, como no protótipo, ficam na coluna da direita, abaixo do bloco
   de título — por isso o `MovieHeader` é o dono das duas colunas e não só do título; a prop `from?`
   de `components.md` sai (decisão 4). `FavoriteButton` recebe o `MovieDetail` inteiro: satisfaz
   `FavoriteMovie` por estrutura e `toFavoriteSnapshot` copia só os seis campos no clique
   (contrato do `favoritos`); custo registrado: o objeto inteiro (sinopse, elenco, gêneros, ~2 KB)
   vai serializado no payload RSC como prop da ilha client. Mobile (D35): a coluna tem `basis-[560px]`
   e quebra para a linha de baixo em 390 px, o pôster fica com até 300 px à esquerda; `h1` em
   `text-4xl` abaixo de `sm` (36 px, como o `h1` da listagem) e `text-[44px]` do contrato a partir
   de `sm` — refinamento registrado (o protótipo não tem artboard mobile); `break-words` evita
   overflow com título de uma palavra longa. Alternativas descartadas: `alt` com o título (redunda
   com o `h1` para leitor de tela); passar só os seis campos ao `FavoriteButton` (adaptador que o
   `favoritos` descartou de propósito); `grid` de duas colunas fixas (não empilha sem media query).
7. **`RatingChip`** (RSC; D40; `components.md` linha `RatingChip`):
   ```ts
   export interface RatingChipProps { voteAverage: number; voteCount: number }
   export function RatingChip({ voteAverage, voteCount }: RatingChipProps): ReactNode;
   ```
   `<span className="inline-flex min-h-11 items-center rounded-lg bg-surface-200 px-4 font-semibold
   text-text-primary">{formatRating(voteAverage, voteCount)}</span>` — "Nota 7,2" ou "Sem nota"
   (`voteCount === 0`), o mesmo texto do card, pela mesma função. É `span`, não botão: não é
   interativo; a altura de 44 px é visual (alinha com o botão ao lado). Sem teste próprio: coberto
   pelo `MovieHeader.test.tsx` e pelo `rating.test.ts` do `listagem-filmes`.
8. **`Overview`: os três casos de D18** (RSC; `components.md` linha `Overview`):
   ```ts
   export interface OverviewProps { overview: MovieOverview | null }
   export function overviewNotice(language: string): string | null;
   // "pt" → null · "en" → "Sinopse disponível apenas em inglês." · "ja" → "…apenas em japonês." · "xx" → "Sinopse disponível apenas em outro idioma."
   export function Overview({ overview }: OverviewProps): ReactNode;
   ```
   ```tsx
   <section className="flex flex-col gap-2">
     <h2 className="font-display text-xl font-bold">Sinopse</h2>
     {overview === null
       ? <p className="text-text-muted">Sinopse não disponível.</p>
       : <>
           {notice ? <p className="text-[13px] text-text-muted">{notice}</p> : null}
           <p lang={overview.language === "pt" ? undefined : overview.language} className="max-w-[720px] leading-relaxed text-text-secondary">{overview.text}</p>
         </>}
   </section>
   ```
   Caso 1 (pt-BR): só o texto. Caso 2 (outro idioma): aviso **antes** do texto (quem lê com leitor
   de tela sabe o idioma antes de ouvir o parágrafo) e `lang` no parágrafo com o ISO 639-1 que
   `pickOverview` devolveu (o `html` é `pt-BR`; `lang="en"` faz o leitor de tela trocar a voz). Caso
   3 (ausente): "Sinopse não disponível." em `text-text-muted`, com a seção e o `h2` mantidos (o
   enunciado pede "uma mensagem informando a ausência", não a omissão). `overviewNotice` é a
   constante de UI de D18 ("Sinopse disponível apenas em inglês" ou com o idioma de origem) com
   `languageName` por trás e o fallback genérico quando o CLDR não conhece o código; fica no
   componente (é texto de interface) e é exportada só para o teste. A seção é sempre renderizada
   (diferente de elenco e trailer, que somem quando vazios). Mobile: `max-w-[720px]` já cabe.
9. **`CastList` e `CastCard`** (RSC; D23, D34, D35; `components.md` linha `CastList`/`CastCard`):
   ```ts
   export interface CastListProps { cast: CastMember[] }
   export function CastList({ cast }: CastListProps): ReactNode;   // cast.length === 0 → null
   export interface CastCardProps { member: CastMember }
   export function CastCard({ member }: CastCardProps): ReactNode;
   ```
   `CastList`: `cast.length === 0 → null` (seção inteira omitida, inclusive o `h2`); senão
   `<section className="flex flex-col gap-3"><h2 className="font-display text-xl font-bold">Elenco
   principal</h2><ul role="list" className="grid grid-cols-2 gap-4
   sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">` com `<li key={member.id}><CastCard
   member={member} /></li>`. Renderiza o que recebe: o corte em 8 e a ordem por `order` são do
   mapeador (`MAIN_CAST_LIMIT`, spec `cliente-tmdb` "Elenco principal"); não há segundo `slice` aqui.
   `CastCard`: `<figure className="flex flex-col gap-2"><div className="relative aspect-square
   overflow-hidden rounded-xl bg-surface-200">{photo ? <Image src={photo} alt="" fill
   sizes="(max-width: 639px) 45vw, 160px" className="object-cover" /> : <span aria-hidden="true"
   className="absolute inset-0 flex items-center justify-center text-xs text-text-subtle">Foto</span>}
   </div><figcaption className="flex flex-col gap-0.5"><span className="font-semibold
   text-text-primary">{member.name}</span>{member.character ? <span className="text-[13px]
   text-text-muted">{member.character}</span> : null}</figcaption></figure>`, com `photo =
   profileUrl(member.profilePath)` (`w185`). `alt=""` porque o `figcaption` nomeia a figura;
   `character` vazio (a API manda `""` às vezes) omite a segunda linha. 2 colunas a 390 px
   (`grid-cols-2`, cards de ~171 px) e `auto-fill minmax(140px)` de `sm` em diante (5 a 6 colunas
   a 1280 px na coluna de ~820 px, contra 4 do PNG, que é inspiração). `ul role="list"` pela mesma
   razão do `MovieGrid` (Safari). Alternativas descartadas: `<img>` puro (D23; é corte previsto em
   D43); `object-top` na foto (não há como saber onde está o rosto; `object-cover` centrado é o
   padrão).
10. **`TrailerEmbed`** (RSC; D19, D38; `components.md` linha `TrailerEmbed`):
    ```ts
    export interface TrailerEmbedProps { trailer: MovieTrailer | null }
    export function trailerEmbedUrl(key: string): string; // `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}`
    export function TrailerEmbed({ trailer }: TrailerEmbedProps): ReactNode; // null → null
    ```
    `trailer === null → null` (seção omitida com o `h2`, restrição do enunciado). Senão `<section
    className="flex flex-col gap-3"><h2 className="font-display text-xl font-bold">Trailer</h2><div
    className="aspect-video max-w-[800px] overflow-hidden rounded-xl border border-border-subtle
    bg-surface-100"><iframe src={trailerEmbedUrl(trailer.key)} title={`Trailer: ${trailer.name}`}
    loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
    picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
    className="h-full w-full" /></div></section>`. `youtube-nocookie.com` (modo de privacidade
    aprimorada do YouTube: sem cookie antes do play), `title` com o nome do vídeo (a11y),
    `loading="lazy"` (a seção fica abaixo da dobra na maioria das telas), `allowFullScreen`;
    `encodeURIComponent` na `key` por higiene (a `key` do TMDB é `[A-Za-z0-9_-]`). Nenhum script do
    YouTube é carregado pela página: só o iframe. O `TrailerEmbed` não decide qual vídeo: é o
    `pickTrailer` do `tmdb-client` (YouTube `Trailer`, `official` > `pt` > `en` > mais recente; nada
    de Teaser). Alternativa descartada: lite embed (thumbnail + play) — melhoria futura em D38.
11. **`DetailSkeleton`** (shared; D37; `components.md` linha `DetailSkeleton`; molde:
    `MovieGridSkeleton`):
    ```ts
    export function DetailSkeleton(): ReactNode;
    ```
    `<div role="status" className="flex flex-wrap items-start gap-10">` com `<span
    className="sr-only">Carregando filme</span>` e, `aria-hidden`, as mesmas caixas do
    `MovieHeader` para não haver salto de layout: pôster `aspect-[2/3] w-full max-w-[300px] grow
    basis-60 rounded-xl bg-surface-200 animate-pulse`; coluna `flex min-w-0 flex-1 basis-[560px]
    flex-col gap-7` com título `h-10 w-3/4 rounded bg-surface-200 animate-pulse`, meta `h-4 w-1/2
    rounded bg-surface-100`, dois chips `h-11 w-28 rounded-lg bg-surface-200`, um bloco de sinopse
    (`h-5 w-24 rounded bg-surface-200` + três linhas `h-4 rounded bg-surface-100`, a última `w-2/3`)
    e um grid de 4 quadrados `aspect-square rounded-xl bg-surface-200` nas mesmas colunas do elenco.
    Sem seção de trailer no skeleton (a maioria dos filmes tem, mas quando não tem o salto seria
    para menos, que não incomoda). Sem diretiva e sem `server-only` (shared), como o
    `MovieGridSkeleton`.
12. **`error.tsx` do segmento** (client; D21, D37; molde: `src/app/error.tsx`):
    ```tsx
    "use client";
    export default function MovieError(props: { error: Error & { digest?: string }; reset: () => void }) {
      return <ErrorState {...props} title="Não foi possível carregar o filme" />;
    }
    ```
    Só renderiza o `ErrorState` (contrato de `components.md`): em dev a descrição é `error.message`
    (a `TmdbError("config")` nomeia `TMDB_API_READ_TOKEN`); em produção o Next redige e fica "Tente
    novamente em instantes."; "Tentar novamente" faz `router.refresh()` + `reset()`. Erros de
    `generateMetadata` não chegam aqui (decisão 2). O `Header` continua visível.
13. **Consumo das pendências D18/D19 resolvidas pelo `tmdb-client`** (D18, D19): o design do
    `tmdb-client` (decisões 7 e 13) resolve com a sonda `scripts/tmdb-probe.mjs` se `translations`
    vem via `append_to_response` e se `include_video_language` tem efeito; se não, `getMovieDetail`
    faz uma segunda chamada (`/movie/{id}?language=en-US` quando `overview` vem vazia;
    `/movie/{id}/videos?language=en-US` quando `videos.results` vem vazio) **antes** de
    `toMovieDetail`. Este change declara que consome o resultado dessa sonda e que o caminho de
    fallback é invisível aqui: `MovieDetail.overview` e `MovieDetail.trailer` chegam com a mesma
    forma nos dois caminhos; `Overview` e `TrailerEmbed` não sabem quantas chamadas houve. A task
    1.1 lê a tabela "Resultado das verificações" do `tmdb-client` (preenchida no apply dele) só para
    saber se um filme sem sinopse pt-BR terá `language: "en"` (caso 2 da task 6.3) — se o fallback
    não existir e a API não devolver tradução, o caso 2 é verificado por teste unitário com
    `Overview` e registrado.
14. **Mapeamento de tokens** (D33, pilar 5; `tokens/README.md > Mapa de uso`):
    | Elemento | Classes (tokens 1:1) |
    |---|---|
    | "Voltar à listagem" | `text-text-muted`; hover `hover:text-accent` (ação) |
    | Pôster e placeholder, foto do elenco e placeholder, chip de nota, blocos do skeleton | `bg-surface-200`; rótulos "Pôster"/"Foto" `text-text-subtle` com `aria-hidden` (D34); linhas do skeleton `bg-surface-100` |
    | `h1`, nome do ator, texto do chip | `text-text-primary` (herdado do `body` no `h1`) |
    | Meta "Ano · Duração · Gêneros", personagem, aviso de idioma, "Sinopse não disponível." | `text-text-muted` |
    | Texto da sinopse | `text-text-secondary` |
    | `h2` das seções | `text-text-primary` (herdado) |
    | Botão "Adicionar aos favoritos" | `bg-accent text-on-accent` (via `FavoriteButton full`) |
    | Caixa do trailer | `bg-surface-100 border-border-subtle` |
    | Not-found e erro | via `EmptyState`: `bg-surface-100 border-border-subtle`, ícone e descrição `text-text-muted`, título `text-text-primary`, ação `bg-accent text-on-accent` |
    | Foco | `:focus-visible` global com `outline-focus-ring` |
    `accent` aparece só no botão de favorito (ação primária), na ação dos estados vazios e no hover
    do `BackLink`; nenhuma cor literal em `src/` (SVG da seta usa `currentColor`; `tokens:check`
    falha se houver). `animate-pulse` e `object-cover` não são cor.
15. **Responsivo e acessibilidade** (D35; `components.md > Acessibilidade`): a 390 px o bloco
    empilha (pôster até 300 px, depois a coluna com título, meta, chips em `flex-wrap`, sinopse,
    elenco em 2 colunas, trailer em 16:9 na largura do container); gutter 16 px do `main` (`px-4`).
    Um único `h1` (título do filme); `h2` por seção; `figure`/`figcaption` no elenco; `ul
    role="list"`; `iframe` com `title`; `lang` na sinopse em outro idioma; `role="status"` no
    skeleton; link e botão com `min-h-11`; `aria-pressed` no favorito (do `FavoriteButton`); ordem
    de tabulação: "Voltar" → botão de favorito → iframe do trailer; foco visível global. Nada de
    `aria-label` redundante (todos os controles têm texto visível).
16. **Testes** (D7, D43; critério da linha 5 do backlog):
    - `src/lib/tmdb/parseMovieId.test.ts`: "603" → 603; "1" → 1; "abc", "0", "-1", "1.5", "0603",
      "603abc", " 603", "", `undefined`, "99999999999999999" → `null`.
    - `src/lib/listing/backHref.test.ts`: `undefined`, `""` → "/"; "q=matrix&page=2" →
      "/?q=matrix&page=2"; "page=999" → "/?page=500"; "sort=rating" → "/?sort=rating"; "sort=foo&genre=abc"
      → "/"; "q=m&genre=28&sort=rating" → "/?q=m" (D14); `["page=2", "page=3"]` → "/?page=2";
      "http://evil.example/x" → "/"; "q=the+matrix" → "/?q=the+matrix" (round-trip com o parser).
    - `src/lib/format/runtime.test.ts`: 136 → "2h 16min"; 45 → "45min"; 120 → "2h"; 60 → "1h";
      90.6 → "1h 30min"; 0, `null`, `undefined`, `NaN`, -5 → `null`.
    - `src/lib/format/languageName.test.ts`: "en" → "inglês"; "ja" → "japonês"; "pt" → "português";
      "xx", "" → `null`; nunca lança.
    - `src/lib/format/movieMeta.test.ts`: completo → "1999 · 2h 16min · Ação, Ficção científica";
      sem `runtime` → "1999 · Ação, Ficção científica"; sem `releaseDate` e `genres: []` → "2h 16min";
      tudo ausente → `null`; um gênero só → sem vírgula.
    - `src/components/movie-detail/Overview.test.tsx` (não cortável: é o requisito): `{ text, language:
      "pt" }` → texto presente, nenhum aviso, `p` sem `lang`; `{ text, language: "en" }` → aviso
      "Sinopse disponível apenas em inglês." antes do texto e `p` com `lang="en"`; `language: "xx"`
      → aviso genérico; `null` → "Sinopse não disponível." e `h2` "Sinopse" presente;
      `overviewNotice` nos quatro valores.
    - `src/components/movie-detail/CastList.test.tsx` (cortável): `[]` → `container` vazio (sem
      `h2`); 3 membros → `list` com 3 `listitem`, cada um com `figure` e `figcaption` contendo nome e
      personagem; `profilePath: null` → placeholder "Foto" `aria-hidden`; `character: ""` → só o nome;
      `vi.mock("next/image")` como no `MovieCard.test.tsx`.
    - `src/components/movie-detail/TrailerEmbed.test.tsx` (cortável): `null` → `container` vazio;
      `{ key: "abc", name: "Official Trailer" }` → `iframe` com `title="Trailer: Official Trailer"`,
      `src` começando com `https://www.youtube-nocookie.com/embed/abc`, `loading="lazy"` e
      `allowfullscreen`; `trailerEmbedUrl("a b")` codifica.
    - `src/components/movie-detail/MovieHeader.test.tsx` (cortável): `MovieDetail` literal com
      `satisfies` → `h1` com o título, meta "1999 · 2h 16min · Ação", chip "Nota 8,7", botão
      `aria-pressed="false"` com nome "Adicionar aos favoritos" e texto visível; `posterPath: null` →
      placeholder "Pôster"; `runtime: null`, `genres: []`, `releaseDate: null` → sem `p` de meta;
      `voteCount: 0` → "Sem nota"; `children` renderizados dentro da coluna; `vi.mock("next/image")`.
    `MovieDetails`, `BackLinkLoader`, `page.tsx`, `not-found.tsx` e `error.tsx` não têm teste
    unitário (async RSC, `server-only`, tipos de rota): são o grupo 6 das tasks. Ordem de corte deste
    change se faltar prazo (D43): `MovieHeader.test` → `CastList.test` → `TrailerEmbed.test` →
    `next/image` → `<img>`. Não cortáveis: L6, testes de `lib/`, `Overview.test`, `?from=` (critério
    do backlog), verificação nos dois modos.
17. **Dois modos de `cacheComponents`** (D2, D42; critério no `tasks.md`): sem a flag, `npm run
    build` lista `/movie/[id]` como `ƒ` e não faz nenhum fetch (sem `generateStaticParams`); com
    `CATALOGO_CACHE_COMPONENTS=1`, o build pré-renderiza só o shell de fallback da rota (`article`,
    `BackLink` para `/`, `DetailSkeleton`) e também não toca o TMDB, porque `await params` e `await
    searchParams` vêm antes de qualquer IO e ambos ficam sob `<Suspense>`; `generateMetadata` é
    dinâmica e transmitida. `next dev` com a flag abre `/movie/603`, `/movie/603?from=q%3Dmatrix`,
    `/movie/abc` sem insight/erro de blocking-route nem de IO síncrono no overlay. O código é o
    mesmo nos dois modos: sem `'use cache'`, sem `cacheLife`, cache só no `client.ts` (D20). O
    símbolo exato da rota no resumo do build com a flag (`◐` ou `ƒ`) é registrado na task 6.6, não
    é critério.
18. **Registro** (no apply, conforme a regra dos próprios arquivos): `components.md` recebe a
    linha `BackLinkLoader` (`components/movie-detail/`, RSC async, `searchParams`, faz `await
    searchParams` e renderiza `BackLink` com `backHref(from)`; fallback `BackLink href="/"`); na
    linha `MovieDetails`, props `params: Promise<{ id: string }>` (sem `from?`) e "id inválido →
    `notFound()` sem fetch"; na linha `MovieHeader`, props `movie: MovieDetail`, `children?`
    (seções na coluna da direita), sem `from?`, e `h1` `text-4xl sm:text-[44px]`; na linha
    `DetailSkeleton`, `role="status"` + "Carregando filme"; na linha `CastList`/`CastCard`, `ul
    role="list"` e `alt=""`; na linha `Overview`, `lang` no parágrafo e aviso antes do texto; na
    tabela "Páginas e arquivos de rota", `page.tsx` com "dois Suspense (`BackLinkLoader`,
    `MovieDetails`)" e `generateMetadata` com os dois fallbacks de título; na fronteira server ×
    client, o `BackLinkLoader` sob o `page.tsx`. `backlog.md`: L6 `doing` no apply, `done` no
    finish. `decisoes.md`: nada a reabrir (D39 aplicada como está; a nota "not-found vai para `/`"
    é consequência, não revisão). README: nada aqui; a lista para a seção "Decisões técnicas e
    trade-offs" está no último item de Riscos / Trade-offs.

## Riscos / Trade-offs
- Status HTTP do not-found pode ser 200 quando o `notFound()` acontece depois de o shell sair (com a
  flag ligada, sempre; sem a flag, dependendo do momento do flush) → a UI de not-found e o `noindex`
  são o comportamento documentado do streaming; o critério do backlog é a UI; registrado na task
  6.2 e no README. Garantir 404 exigiria `await params` fora do Suspense, o que quebra a flag.
- `generateMetadata` dinâmica com a flag ligada → metadata transmitida por streaming; se os docs
  instalados mostrarem que `await params` em `generateMetadata` dispara o insight de blocking-route
  (task 1.1), o fallback é `metadata` estática `{ title: "Filme" }` com o título do filme só no
  `h1`; registrar no README qual dos dois ficou.
- `BackLink` do shell aponta para `/` até o buraco chegar → janela de milissegundos (só `await
  searchParams`, sem rede); quem clica antes vai para `/` sem filtros — aceitável, e é o que a
  `FavoritesList` produz de qualquer forma.
- `MovieDetail` inteiro como prop do `FavoriteButton` (ilha client) → ~2 KB a mais no payload RSC
  (sinopse, elenco, gêneros duplicados); `toFavoriteSnapshot` copia só os seis campos, nada vaza
  para o `localStorage`. Mantido pelo contrato "sem adaptador" do `favoritos`; passar os seis campos
  é uma linha se o tamanho incomodar.
- `Intl.DisplayNames` no servidor depende de ICU completo → Node 22 oficial tem full-icu;
  `languageName` devolve `null` (aviso genérico) em qualquer exceção, nunca quebra a página; a task
  2.4 confere `new Intl.DisplayNames(["pt-BR"], { type: "language" }).of("en")` no Node instalado.
- `next/image` no jsdom pode exigir mock nos testes de `MovieHeader`/`CastList` → `vi.mock("next/image")`
  como o `MovieCard.test.tsx` já faz; e se faltar prazo, `next/image` → `<img>` é corte previsto
  (D43).
- Pôster com `priority` → um `<link rel="preload">` a mais no `head`, só nesta rota; é a imagem LCP.
- Um filme com 8 pessoas no elenco e fotos `w185` → 8 requisições de imagem lazy (abaixo da dobra
  no mobile); aceitável; `sizes` evita baixar tamanhos maiores que o renderizado.
- `iframe` do YouTube pesa (~500 KB com o player) mesmo com `loading="lazy"` quando a seção entra na
  viewport → aceito em D38; lite embed é melhoria futura.
- `parseMovieId` rejeita "0603" e ids com espaço → not-found para URLs que o app nunca gera;
  comportamento estrito registrado na spec.
- `character` pode vir vazio ou com vários papéis separados por " / " → renderizado como vem
  (texto do TMDB), sem tratamento.
- Elenco com 5 a 6 colunas a 1280 px (`minmax(140px)` de `components.md` na coluna de ~820 px)
  contra 4 do PNG → mantido o contrato; trocar para `minmax(160px)` é uma classe.
- Build com a flag é mais estrito (shell estático) → qualquer leitura de `params`/`searchParams`,
  `cookies()` ou `Date` fora dos dois `<Suspense>` quebra; a task 6.6 pega.
- `error.tsx` substitui o segmento inteiro, inclusive o `BackLink` → o `Header` continua com
  "Explorar"; aceitável e igual ao `error.tsx` da listagem.
- Decisões para o README (seção "Decisões técnicas e trade-offs", adicionadas no finish): D18 (lado
  da UI: aviso "Sinopse disponível apenas em <idioma>" via `Intl.DisplayNames`, `lang` no parágrafo,
  "Sinopse não disponível." mantendo a seção), D19 (seção de trailer omitida sem vídeo; o
  `TrailerEmbed` não escolhe), D21 (id inválido → `notFound()` sem fetch; `null` do cliente →
  `notFound()`; demais erros → `error.tsx` do segmento com `router.refresh()`), D23 (`w500` no
  pôster com `priority` e `alt=""`, `w185` no elenco, placeholders "Pôster"/"Foto"), D35 (detalhe
  empilha a 390 px; elenco 2 colunas; `h1` 36/44 px), D36 (not-found com `EmptyState` `film` e
  "Voltar à listagem" para `/`), D37 (`DetailSkeleton` com as mesmas caixas do `MovieHeader`;
  `error.tsx` por segmento), D38 (`youtube-nocookie.com`, `title`, `loading="lazy"`,
  `allowFullScreen`; lite embed como melhoria futura), D39 (`?from=` validado por
  `parseListingParams` → `buildListingHref`; sem `from` → `/`; `BackLinkLoader` sob Suspense
  próprio), D40 (chip de nota com as medidas do botão, não interativo), D42 (verificação nos dois
  modos), D43 (`?from=` mantido por ser critério do backlog), mais as notas: `generateMetadata`
  com o mesmo `getMovieDetail` memoizado (uma chamada HTTP) e metadata transmitida; status HTTP do
  not-found em streaming; sem `generateStaticParams` (build sem token e sem rede).
