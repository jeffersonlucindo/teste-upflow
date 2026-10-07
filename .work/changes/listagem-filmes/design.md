# Design — listagem-filmes

## Contexto
Ao fim do `tmdb-client` o repositório tem o shell do `setup-catalogo` (`src/app/{layout,page,favoritos/page}.tsx`,
`globals.css` com os 14 tokens no `@theme`, `Header`/`NavLink`, `Button`/`ButtonLink`, Vitest 5 com jsdom,
`scripts/check-tokens.mjs`, toggle `CATALOGO_CACHE_COMPONENTS` e `images.remotePatterns` para
`image.tmdb.org/t/p/**` no `next.config.ts`) e a porta TMDB em `src/lib/tmdb/` (`client.ts` com
`server-only`: `getGenres()`, `fetchListing(query)`, `getMovieDetail(id)`; módulos puros `types.ts`,
`params.ts`, `images.ts`, `mappers.ts`, `errors.ts`). `src/app/page.tsx` ainda é o esqueleto: `h1`
"Filmes populares" e um parágrafo dizendo que a listagem chega neste change. Não existem
`src/lib/listing/`, `src/lib/format/`, `src/components/movies/`, `EmptyState` nem `error.tsx`.

Contrato consumido (de `.work/changes/tmdb-client/design.md`, sem reabrir): `ListingQuery = { query:
string | null; genreId: number | null; sort: ListingSort; page: number }`; `ListingResult = { movies:
MovieSummary[]; page; totalPages (1..500); totalResults }`; `MovieSummary = { id, title, posterPath,
voteAverage, voteCount, releaseDate: string | null }`; `Genre = { id, name }`; `LISTING_SORTS`,
`DEFAULT_SORT = "popularity"`, `clampPage(page, max = MAX_PAGE)`, `MAX_PAGE = 500` em
`lib/tmdb/params.ts` (sem `server-only`, importável do client); `posterUrl(path, POSTER_SIZE.card)`
em `lib/tmdb/images.ts`. `fetchListing` **não** refaz a chamada quando `page > totalPages`: devolve
`movies: []` com `page` ecoado, e a UI decide (decisão 8). D14 no lado da API já está feito
(`buildSearchParams` ignora gênero e ordenação); o lado da UI é deste change.

Referência visual: `.work/design/screens/Main.dc.html` (valores inline: `h1` 40 px/800; `form
role="search"` com `flex-wrap`, gap 16 px, `align-items: flex-end`; busca `flex: 1 1 320px`; selects
`flex: 0 1 200px` com chevron; controles 44 px, raio 8 px, borda `border-subtle`, fundo `surface-100`;
grid `auto-fill minmax(220px)` gap `24px 20px`; card com pôster `aspect-ratio: 2/3` raio 12 px fundo
`surface-200`, título 15 px/600, meta 13 px `text-muted`; paginação centralizada com Anterior
outline, "Página 1 de [N]" `text-muted`, Próxima primária) e `screens/pdf/listagem.png`. O vazio de
`Favoritos.dc.html` (`sc-if noFavs`: caixa `surface-100` com borda `border-subtle`, raio 12 px, padding
64/24 px, ícone 32 px `text-muted`, título 16 px/600, descrição `text-muted`, botão primário) é a base
visual do `EmptyState` (D36). Contratos em `.work/design/components.md` (linhas `FilterBar`,
`FilterBarLoader`, `MovieResults`, `MovieGrid`, `MovieGridSkeleton`, `MovieCard`, `Pagination`,
`EmptyState`, `ErrorState`; tabela "Páginas e arquivos de rota"; "Estados que o protótipo não
desenha"; "Acessibilidade").

Fatos do Next 16.4 que o design assume e a task 1.1 confere nos docs instalados
(`node_modules/next/dist/docs/`):
- `searchParams` é Promise; ler a prop sem `await` não torna a página dinâmica; o `await` dentro de um
  componente sob `<Suspense>` cria um buraco dinâmico (com `cacheComponents`) ou um ponto de streaming
  (sem). `PageProps<"/">` é global após `next typegen`.
- `connection()` (`next/server`) força o componente a rodar na requisição, fora do shell e do build.
- `useSearchParams()` precisa de `<Suspense>` acima quando a rota é prerenderizada; o **fallback**
  desse `<Suspense>` não pode chamar `useSearchParams()` (o bailout subiria até a página).
- Erros de Server Components em `error.tsx`: `reset()` sozinho re-renderiza só o client; recuperar
  o segmento exige `startTransition(() => { router.refresh(); reset(); })`.
- `next/image` com `fill` + `sizes` e URL remota liberada em `remotePatterns`; otimização roda na
  requisição, não no build.
- `eslint-config-next` 16 traz as regras do React Compiler (`react-hooks/refs`,
  `react-hooks/set-state-in-effect`): nada de `ref.current` durante o render nem `setState` síncrono
  em `useEffect`. O `FilterBar` é desenhado para passar nelas (decisão 6).

## Objetivos
- L2–L5 verificáveis no browser a partir da URL: `/`, `/?page=2`, `/?q=matrix`, `/?genre=28`,
  `/?sort=rating`, combinações e valores inválidos, com link compartilhável, refresh e voltar
  funcionando (pilar 4, D24).
- `src/lib/listing/` e `src/lib/format/` puros e testados; `FilterBar` e `Pagination` testados
  (critério de pronto da linha 3 de `.work/backlog.md`).
- Pilar 1 materializado: `page.tsx` não lê `searchParams`; `FilterBar` lê `useSearchParams` sozinho
  (D27); `FilterBarLoader` faz `await connection()` antes de `getGenres()` (D22); `MovieResults` faz
  `await searchParams` antes de `fetchListing` (que calcula `todayUtc()` na requisição, D16).
- Estados de toda a tela definidos e visíveis: skeleton de 8 cards, barra com select desabilitado,
  busca vazia, filtro sem resultado, página fora do intervalo, erro de API e token ausente (D36, D37,
  D21).
- `npm run check` e `npm run build` verdes sem token e sem rede; `npm run build` e `next dev` com
  `CATALOGO_CACHE_COMPONENTS=1` sem insight de blocking-route (D42).
- 390 px com grid de 2 colunas e sem overflow; 1280 px como a tela (D35).

## Não-objetivos
- `FavoriteButton` no card, `FavoritesBadge`, `FavoritesList`, store de favoritos (`favoritos`, D29–D32).
  O `MovieCard` só reserva a posição (decisão 9).
- Rota `/movie/[id]`, `BackLink` e a leitura do `?from=` (`detalhe-filme`, D39). Aqui só se emite o
  parâmetro com `buildListingSearch`.
- Busca multipágina com filtro local (alternativa (c) de D14); `generateMetadata` dependente da busca;
  contagem de resultados fora do modo busca; `priority` no `next/image`; indicador de pendência nos
  links da paginação (`useLinkStatus`); validação do `genre` contra a lista de gêneros.
- Formatadores que só o detalhe usa (`formatRuntime`, rótulo de idioma com `Intl.DisplayNames`):
  nascem no `detalhe-filme`, primeiro consumidor, ao lado dos daqui.
- README e `decisoes.md`: nada editado neste change; a lista para o README está em Riscos / Trade-offs.
- `loading.tsx` global (D37), `'use cache'`/`cacheLife` (D2), teste unitário de `MovieResults` e
  `FilterBarLoader` (async RSC não roda no Vitest, D7; verificados no browser).

## Abordagem
- Um shape só para o estado da listagem: a URL é serializada/desserializada para o `ListingQuery` do
  `tmdb-client` por `src/lib/listing/params.ts` (URL ↔ domínio), e `fetchListing` traduz o mesmo objeto
  para a API (domínio → API). Nenhum tipo paralelo `ListingParams`.
- `page.tsx` é um Server Component estático: `h1` mais dois `<Suspense>` irmãos (barra e resultados),
  envolvidos por `ListingTransition`, uma ilha client mínima que compartilha o `isPending` da
  navegação entre o `FilterBar` (que dispara `router.replace/push`) e a região dos resultados (que
  recebe `aria-busy` e opacidade, D26).
- Tudo que não precisa de hook é Server Component ou shared: `FilterBarLoader`, `MovieResults`,
  `Pagination` (RSC); `MovieCard`, `MovieGrid`, `MovieGridSkeleton`, `EmptyState` (shared, porque o
  `FavoritesList` client os renderiza em `/favoritos`). Ilhas client: `FilterBar`, `ListingTransition`,
  `ErrorState`.
- Cores só por token (classes 1:1 de `globals.css`), medidas do protótipo em classes utilitárias
  (`h-11`, `rounded-lg`, `rounded-xl`, `text-[13px]`, `text-[15px]`), nada em `globals.css`.
- Testes: funções puras com casos de borda (parser, href, formatadores); `FilterBar` com
  `next/navigation` mockado e timers falsos; `Pagination`, `MovieCard`, `EmptyState` com Testing
  Library. Os de `lib/` e os do `FilterBar`/`Pagination` são critério de pronto; `MovieCard`/`EmptyState`
  são os cortáveis de D43.

## Decisões técnicas
1. **Mapa de arquivos e fronteira** (aplica pilares 1, 2; `components.md` › Fronteira server × client):
   | Arquivo | Tipo | Exporta | Importa de |
   |---|---|---|---|
   | `src/lib/listing/params.ts` | puro | `DEFAULT_LISTING_QUERY`, `ListingSearchParams`, `parseListingParams`, `buildListingSearch`, `buildListingHref` | `@/lib/tmdb/types`, `@/lib/tmdb/params` |
   | `src/lib/format/rating.ts` | puro | `formatVoteAverage`, `formatRating` | — |
   | `src/lib/format/releaseYear.ts` | puro | `releaseYear` | — |
   | `src/components/ui/EmptyState.tsx` | shared | `EmptyState`, `EmptyStateIcon`, `EmptyStateAction`, `EmptyStateProps` | `@/components/ui/Button` |
   | `src/components/ui/ErrorState.tsx` | client | `ErrorState`, `ErrorStateProps` | `EmptyState`, `next/navigation` |
   | `src/components/movies/MovieCard.tsx` | shared | `MovieCard`, `MovieCardData`, `MovieCardProps`, `toMovieCardData` | `next/link`, `next/image`, `@/lib/tmdb/images`, `@/lib/tmdb/types`, `@/lib/format/*` |
   | `src/components/movies/MovieGrid.tsx` | shared | `MovieGrid`, `MovieGridProps`, `movieGridClassName` | `MovieCard` |
   | `src/components/movies/MovieGridSkeleton.tsx` | shared | `MovieGridSkeleton`, `MovieGridSkeletonProps` | `MovieGrid` (classe) |
   | `src/components/movies/ListingTransition.tsx` | client | `ListingTransition`, `ListingTransitionRegion`, `useListingTransition` | `react` |
   | `src/components/movies/FilterBar.tsx` | client | `FilterBar`, `FilterBarProps`, `SEARCH_DEBOUNCE_MS` | `next/navigation`, `@/lib/listing/params`, `@/lib/tmdb/params`, `@/lib/tmdb/types`, `ListingTransition` |
   | `src/components/movies/FilterBarLoader.tsx` | RSC async | `FilterBarLoader` | `next/server` (`connection`), `@/lib/tmdb/client`, `FilterBar` |
   | `src/components/movies/Pagination.tsx` | RSC | `Pagination`, `PaginationProps` | `@/components/ui/Button` |
   | `src/components/movies/MovieResults.tsx` | RSC async | `MovieResults`, `MovieResultsProps` | `@/lib/tmdb/client`, `@/lib/listing/params`, `MovieGrid`, `MovieCard`, `Pagination`, `EmptyState` |
   | `src/app/page.tsx` | RSC | `default`, `metadata` | `react` (`Suspense`), `FilterBar`, `FilterBarLoader`, `MovieResults`, `MovieGridSkeleton`, `ListingTransition` |
   | `src/app/error.tsx` | client | `default` | `ErrorState` |
   Regra de importação: só `FilterBarLoader` e `MovieResults` importam `@/lib/tmdb/client`
   (`server-only`); nenhum arquivo client ou shared o importa (o build falharia, e é esse o guardrail
   de D12). `lib/listing/params.ts` e `lib/tmdb/params.ts` coexistem com o mesmo nome de arquivo em
   domínios diferentes (URL × API); os imports usam sempre o caminho completo, nunca um `index.ts`.
   `ErrorState` mora em `components/ui/` (e não dentro de `error.tsx`, como a linha de `components.md`
   sugere) porque `src/app/movie/[id]/error.tsx` o reutiliza no `detalhe-filme`.
2. **URL como única fonte** (`src/lib/listing/params.ts`, D24, D17, D14; pilar 4):
   ```ts
   import type { ListingQuery, ListingSort } from "@/lib/tmdb/types";
   import { clampPage, DEFAULT_SORT, LISTING_SORTS } from "@/lib/tmdb/params";

   export type ListingSearchParams =
     | URLSearchParams                                        // useSearchParams() no client, URLSearchParams(from) no detalhe
     | Record<string, string | string[] | undefined>;         // await searchParams em page/MovieResults
   export const DEFAULT_LISTING_QUERY: ListingQuery = { query: null, genreId: null, sort: DEFAULT_SORT, page: 1 };
   export function parseListingParams(input: ListingSearchParams): ListingQuery;
   export function buildListingSearch(query: ListingQuery): string; // "" | "q=matrix&page=2" (sem "?")
   export function buildListingHref(query: ListingQuery): string;   // "/" | "/?q=matrix&page=2"
   ```
   Chaves da URL: `q`, `genre`, `sort`, `page`. `parseListingParams` lê a primeira ocorrência de cada
   chave (`URLSearchParams.get` ou o primeiro item quando o Next entrega array) e normaliza: `q` →
   `trim()`, vazio vira `null`; `genre` → `Number.parseInt(…, 10)`, só inteiro `>= 1` vira `genreId`,
   senão `null`; `sort` → só valores de `LISTING_SORTS`, senão `DEFAULT_SORT`; `page` →
   `clampPage(Number.parseInt(…, 10))` (ausente, `abc`, `0`, negativo → 1; `501` → 500; `2.7` → 2).
   D14 no parser: com `query` não nulo, `genreId = null` e `sort = DEFAULT_SORT` (um `/?q=m&genre=28`
   digitado à mão vira busca pura). `buildListingSearch` monta `URLSearchParams` nesta ordem — `q`
   (se não nulo e não vazio após `trim`), `genre` (se não nulo **e** sem `q`), `sort` (se diferente de
   `DEFAULT_SORT` **e** sem `q`), `page` (se `> 1`, clampado) — e devolve `toString()` (espaço vira
   `+`, que o parser decodifica). `buildListingHref` prefixa `/` e `?` quando há busca. Invariante
   testado: `parseListingParams(new URLSearchParams(buildListingSearch(x)))` é igual a
   `parseListingParams(x)` para qualquer `x`. Sem validação de `genre` contra a lista de gêneros: um
   id desconhecido dá lista vazia e cai no `EmptyState` "Limpar filtros" (decisão 8). Alternativa
   descartada: tipo próprio `ListingParams` com chaves da URL (`q`, `genre`) — exigiria um adaptador
   para `fetchListing` e dois nomes para a mesma coisa.
3. **Formatadores** (`src/lib/format/`, consumidos por `MovieCard` e, no `detalhe-filme`, por
   `RatingChip`/`MovieHeader`):
   ```ts
   // rating.ts
   const voteAverageFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
   export function formatVoteAverage(value: number): string;                 // 7.2 → "7,2" · 8 → "8,0"
   export function formatRating(voteAverage: number, voteCount: number): string; // voteCount === 0 → "Sem nota"; senão "Nota 7,2"
   // releaseYear.ts
   export function releaseYear(releaseDate: string | null | undefined): number | null; // "1999-03-30" → 1999; "", null, "abc" → null
   ```
   `releaseYear` lê os quatro primeiros dígitos com regex (`/^\d{4}/`), sem `Date`: nada de fuso
   horário e nenhum relógio alcançável pelo shell (pilar 1). `Intl.NumberFormat` é determinístico e
   igual no Node (full-icu) e no browser, então o `MovieCard` renderiza o mesmo texto no servidor
   (listagem) e no client (favoritos). Locale fixo `pt-BR` (a UI é monolíngue; `TMDB_LANGUAGE` só
   afeta os dados).
4. **`page.tsx`: shell estático e dois `<Suspense>`** (D37, D27; pilar 1):
   ```tsx
   export const metadata: Metadata = { title: "Filmes populares" };
   export default function HomePage({ searchParams }: PageProps<"/">) {
     return (
       <section className="flex flex-col gap-6">
         <h1 className="font-display text-4xl font-extrabold tracking-tight">Filmes populares</h1>
         <ListingTransition>
           <Suspense fallback={<FilterBar genres={[]} disabled />}>
             <FilterBarLoader />
           </Suspense>
           <ListingTransitionRegion>
             <Suspense fallback={<MovieGridSkeleton />}>
               <MovieResults searchParams={searchParams} />
             </Suspense>
           </ListingTransitionRegion>
         </ListingTransition>
       </section>
     );
   }
   ```
   A página recebe `searchParams` e **não** faz `await`: a Promise desce para `MovieResults`. Sem a
   flag, `/` é dinâmica (`ƒ`) e os dois fallbacks aparecem só durante o streaming; com a flag, o shell
   (`h1`, barra desabilitada, skeleton) é prerenderizado no build (`◐`) e os dois buracos rodam na
   requisição. `h1` e classes vêm do `page.tsx` do `setup-catalogo`. Alternativa descartada:
   `loading.tsx` (esconderia `h1` e barra, D37).
5. **`FilterBarLoader` e o fallback sem URL** (D22, D37):
   ```tsx
   export async function FilterBarLoader() {
     await connection();              // fora do shell e do build, nos dois modos
     const genres = await getGenres(); // cache 24 h no fetch (D20)
     return <FilterBar genres={genres} />;
   }
   ```
   O fallback é `<FilterBar genres={[]} disabled />`. Como o fallback é renderizado no prerender, ele
   **não pode** chamar `useSearchParams()`; por isso `FilterBar` com `disabled` renderiza só os campos
   (sem hooks) com os valores de `DEFAULT_LISTING_QUERY`, os três controles desabilitados e o select
   de gênero com a única opção "Carregando gêneros…". Consequência registrada: ao abrir `/?q=matrix`
   com a flag ligada, o campo aparece vazio no shell e recebe "matrix" quando o buraco chega (a
   duração é a do `getGenres()`, em geral servido do cache). Alternativas descartadas: ler
   `window.location` no fallback (hidratação inconsistente); passar `genres` como Promise com `use()`
   (mais peças para ganhar milissegundos; fica como melhoria futura); lista estática de gêneros (D22).
   Erro em `getGenres()` sobe ao `error.tsx` da página, como qualquer outro.
6. **`FilterBar`** (client; D14, D24, D25, D26, D27; `components.md` linha `FilterBar`):
   ```ts
   export const SEARCH_DEBOUNCE_MS = 350;
   export interface FilterBarProps { genres: Genre[]; disabled?: boolean }
   export function FilterBar({ genres, disabled = false }: FilterBarProps): ReactNode;
   ```
   Estrutura interna do arquivo: `FilterBar` decide entre `FilterBarFields` (sem hooks; usado no
   fallback) e `LiveFilterBar` (hooks), para não haver hook condicional. Ambos privados.
   `LiveFilterBar`:
   - `const current = parseListingParams(useSearchParams())`; `const router = useRouter()`; `const
     { isPending, startTransition } = useListingTransition()` (decisão 7); `const hintId = useId()`.
   - `searchMode = current.query !== null`.
   - Campo de busca: `<label>` envolvendo `<input type="search" name="q" autoComplete="off"
     enterKeyHint="search" placeholder="Digite o nome de um filme">`, **não controlado**
     (`defaultValue={current.query ?? ""}`, `ref`). `onChange` agenda `commitQuery(value)` com
     `setTimeout(SEARCH_DEBOUNCE_MS)` guardado em `useRef`, limpando o anterior. `commitQuery`:
     `const query = value.trim() || null`; se `query === committedRef.current` não faz nada; senão
     grava `committedRef.current = query` e `startTransition(() => router.replace(buildListingHref({
     ...DEFAULT_LISTING_QUERY, query }), { scroll: false }))`. Por D14, o href de uma busca só depende
     do texto (gênero e ordenação saem da URL) e o de limpar a busca é `/` — por isso não há closure
     obsoleto. `onSubmit` do `form` (Enter) faz `preventDefault()`, cancela o timer e chama
     `commitQuery` na hora. O timer é limpo no cleanup de um `useEffect` de montagem.
   - Sincronização com a URL (voltar/avançar, link): `useEffect` dependente de `current.query`: se
     `current.query !== committedRef.current`, grava `committedRef.current = current.query` e escreve
     `inputRef.current.value = current.query ?? ""`. Escrever no DOM via ref (e não `setState`) evita
     perder teclas digitadas entre o commit e a chegada da nova URL e passa em
     `react-hooks/set-state-in-effect`.
   - Select "Gênero": `<label>` envolvendo `<select name="genre" value={current.genreId ?? ""}>` com
     `<option value="">Todos</option>` + um `<option value={id}>` por `Genre`; `onChange` →
     `startTransition(() => router.push(buildListingHref({ ...current, genreId: value ? Number(value) :
     null, page: 1 })))`. Chevron SVG `stroke="currentColor"` em `text-text-muted`, `pointer-events-none`,
     `aria-hidden`; `appearance-none` no select.
   - Select "Ordenar por": mesmo padrão com `name="sort"`, opções de `LISTING_SORTS` na ordem
     `popularity`/`rating`/`release` com rótulos `SORT_LABELS = { popularity: "Popularidade", rating:
     "Nota", release: "Data de lançamento" }` (constante do próprio arquivo: rótulo é UI); `onChange` →
     `push` com `sort` e `page: 1`.
   - Modo busca (D14): os dois selects recebem `disabled={searchMode}` e
     `aria-describedby={hintId}`; o `<p id={hintId}>` com "Gênero e ordenação não se aplicam à busca
     por título (limitação da API)." entra no `form` (`basis-full`, `text-[13px] text-text-muted`)
     só em modo busca. `disabled` da prop (fallback) desabilita os três controles.
   - Marcação: `<form role="search" action="/" method="get" aria-busy={isPending}>` — com `name` nos
     controles e `action="/"`, Enter sem JavaScript ainda chega em `/?q=…` (o parser normaliza o resto).
   - Classes (`components.md`): `form` `flex flex-wrap items-end gap-4`; label `flex flex-col gap-2
     text-[13px] font-semibold text-text-muted`; busca `flex-1 basis-80`; selects `basis-52`
     (encolhem a 390 px); input/select `h-11 w-full rounded-lg border border-border-subtle
     bg-surface-100 px-4 text-sm text-text-primary` (select com `pr-10` para o chevron);
     `disabled:cursor-not-allowed disabled:opacity-60`; foco pelo `:focus-visible` global.
   Alternativas descartadas: `useState` para o texto com sync por efeito (perde teclas e cai na regra
   do Compiler); `key` no input para resincronizar (perde o foco); `push` na digitação (uma entrada de
   histórico por tecla, D25); ler `searchParams` na página e passar por props (tira a barra do shell,
   D27).
7. **`ListingTransition`: a ilha extra, registrada** (D26; pilar 1 exige registro de `"use client"`
   fora das ilhas nomeadas):
   ```ts
   export function ListingTransition({ children }: { children: ReactNode }): ReactNode;       // Provider com useTransition()
   export function ListingTransitionRegion({ children }: { children: ReactNode }): ReactNode; // <div aria-busy={isPending} className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}> + <p role="status" className="sr-only"> "Atualizando resultados…" quando pendente
   export function useListingTransition(): { isPending: boolean; startTransition: TransitionStartFunction };
   ```
   Motivo: D26 pede `aria-busy` e opacidade **no grid** enquanto a nova URL carrega, mas o `FilterBar`
   e o grid ficam em `<Suspense>` irmãos (D37), e um estado de transição não atravessa irmãos sem um
   Context. O Context carrega só `{ isPending, startTransition }` de um `useTransition()` no provider;
   não é estado de aplicação (pilar 4 continua: sem Context para favoritos, sem store global).
   `useListingTransition` cai num `useTransition()` local quando não há provider (o `FilterBar`
   continua funcional sozinho e testável sem wrapper). Como `router.replace/push` rodam dentro de
   `startTransition`, o React mantém os cards antigos até o novo payload chegar: o skeleton só aparece
   no primeiro load e em navegação direta (D26). Limite conhecido: os `<Link>` da `Pagination` (RSC,
   D28) não passam por essa transição, então não escurecem o grid — o Next mantém o conteúdo antigo
   do mesmo jeito; indicador por `useLinkStatus` fica como melhoria futura. Alternativa descartada:
   seletor CSS irmão (`form[aria-busy=true] ~ …`) — menos código, mas acoplamento invisível entre dois
   componentes.
8. **`MovieResults`** (RSC async; D13, D16, D17, D24, D36, D39):
   ```ts
   export interface MovieResultsProps { searchParams: PageProps<"/">["searchParams"] }
   export async function MovieResults({ searchParams }: MovieResultsProps): Promise<ReactNode>;
   ```
   Fluxo: `const params = parseListingParams(await searchParams)` → `const result = await
   fetchListing(params)` (o `tmdb-client` calcula `todayUtc()` nesse momento, D16) → três saídas:
   - `params.page > result.totalPages` (página acima do total, a segunda metade de D17): `EmptyState`
     `icon="search"`, título "Esta página não existe", descrição "A lista tem N página(s).", ação
     `{ href: buildListingHref({ ...params, page: result.totalPages }), label: "Ir para a última
     página" }`. Sem `redirect()`: uma resposta só, sem segunda requisição, e a URL inválida continua
     visível para o usuário corrigir.
   - `result.movies.length === 0`: com `params.query`, `EmptyState` "Nenhum filme encontrado para
     “{query}”", descrição "Confira a grafia ou tente outro título.", ação `{ href: "/", label:
     "Limpar busca" }`; sem busca (gênero desconhecido ou sem filmes), "Nenhum filme encontrado",
     descrição "Nenhum filme corresponde a esses filtros.", ação `{ href: "/", label: "Limpar filtros" }`.
   - Senão: em modo busca, um `<p className="text-[13px] text-text-muted">` com
     "{totalResults} resultado(s) para “{query}”" (`toLocaleString("pt-BR")`); depois `<MovieGrid
     movies={result.movies.map(toMovieCardData)} from={from || undefined} />` e `<Pagination
     page={params.page} totalPages={result.totalPages} hrefFor={(page) => buildListingHref({ ...params,
     page })} />`, onde `from = buildListingSearch(params)` (vazio na listagem padrão, então
     `/movie/603` fica limpo; `q=matrix&page=2` quando há estado a preservar, D39).
   Erros: qualquer `TmdbError` (inclusive `config` sem token) sobe para `src/app/error.tsx` (D21);
   `fetchListing` nunca devolve `not_found` para listas. O componente devolve um fragmento; o
   espaçamento vertical é do `ListingTransitionRegion` (`flex flex-col gap-6`).
9. **`MovieCard` e `toMovieCardData`** (shared; D23, D35; `components.md` linha `MovieCard`):
   ```ts
   export interface MovieCardData {
     id: number; title: string; posterUrl: string | null;
     voteAverage: number; voteCount: number; releaseYear: number | null;
   }
   export interface MovieCardProps { movie: MovieCardData; from?: string }
   export function toMovieCardData(movie: MovieSummary): MovieCardData; // posterUrl(movie.posterPath, POSTER_SIZE.card), releaseYear(movie.releaseDate)
   export function MovieCard({ movie, from }: MovieCardProps): ReactNode;
   ```
   Marcação:
   ```tsx
   <article className="flex flex-col gap-3">
     <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-200">
       <Link href={href} aria-label={`Ver detalhes de ${movie.title}`} className="absolute inset-0 flex items-center justify-center rounded-xl">
         {movie.posterUrl
           ? <Image src={movie.posterUrl} alt="" fill sizes="(max-width: 639px) 50vw, 220px" className="object-cover" />
           : <span aria-hidden="true" className="text-xs text-text-subtle">Pôster</span>}
       </Link>
       {/* Posição do FavoriteButton (variant="icon"): irmão do <Link>, nunca dentro dele,
           absolute top-2.5 right-2.5 w-10 h-10 — ligado pelo change `favoritos` */}
     </div>
     <div className="flex flex-col gap-1">
       <Link href={href} className="text-[15px] font-semibold text-text-primary hover:text-accent">{movie.title}</Link>
       <span className="text-[13px] text-text-muted">{meta}</span>
     </div>
   </article>
   ```
   `href = from ? `/movie/${movie.id}?from=${encodeURIComponent(from)}` : `/movie/${movie.id}``;
   `meta = formatRating(voteAverage, voteCount)` mais `" · " + releaseYear` quando há ano ("Nota 7,2 ·
   1999", "Nota 7,2", "Sem nota · 2024", "Sem nota"). `alt=""` porque o link já tem nome acessível com o
   título. Dois links por card (pôster com `aria-label` e título), como no protótipo e em
   `components.md`; o `FavoriteButton` entra como irmão do `<Link>` do pôster, posicionado sobre ele,
   o que mantém botão fora de link (HTML válido) e o `aria-pressed` fora do nome do link. `MovieCard`
   é shared porque o `FavoritesList` (client) o renderiza; por isso importa só módulos sem
   `server-only` (`images.ts`, `format/*`). `toMovieCardData` vive aqui, e não em `lib/`, porque é o
   card quem define seu view-model; o `favoritos` monta um `MovieCardData` a partir do snapshot
   (observação: o `FavoriteSnapshot` de D30 não tem `voteCount`, que o card exige; o change
   `favoritos` resolve, ver Riscos). Alternativa descartada: link único envolvendo pôster e título
   (um tab stop por card, mas foge do contrato e do protótipo; fica anotado como melhoria).
10. **`MovieGrid` e `MovieGridSkeleton`** (shared; D35, D37):
    ```ts
    export const movieGridClassName = "grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]";
    export interface MovieGridProps { movies: MovieCardData[]; from?: string }
    export function MovieGrid({ movies, from }: MovieGridProps): ReactNode;          // <ul role="list" className={movieGridClassName}> com <li key={movie.id}><MovieCard … from={from} /></li>
    export interface MovieGridSkeletonProps { count?: number }                        // default 8
    export function MovieGridSkeleton({ count = 8 }: MovieGridSkeletonProps): ReactNode;
    ```
    Skeleton: `<div role="status" className={movieGridClassName}>` com `<span className="sr-only">
    Carregando filmes</span>` e `count` itens `aria-hidden` (`flex flex-col gap-3`: bloco
    `aspect-[2/3] rounded-xl bg-surface-200 animate-pulse` + duas linhas `h-4 rounded bg-surface-100`,
    a segunda `w-2/3`). `ul role="list"` restaura a semântica de lista que `list-style: none` apaga no
    Safari. Colunas: `grid-cols-2` a 390 px (cards de ~169 px, D35) e `auto-fill minmax(200px)` de
    `sm` em diante (`components.md`; cinco colunas de ~208 px a 1280 px contra as quatro do PNG, que
    usa 220 px — o protótipo é inspiração; registrado).
11. **`Pagination`** (RSC; D28; `components.md` linha `Pagination`):
    ```ts
    export interface PaginationProps { page: number; totalPages: number; hrefFor: (page: number) => string }
    export function Pagination({ page, totalPages, hrefFor }: PaginationProps): ReactNode;
    ```
    `<nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-4">`:
    Anterior = `page > 1` ? `<ButtonLink variant="outline" href={hrefFor(page - 1)} rel="prev">` :
    `<span aria-disabled="true" className={`${buttonClassName("outline")} cursor-not-allowed
    opacity-50`}>`; meio `<span className="text-text-muted">Página {page} de {totalPages}</span>`;
    Próxima = `page < totalPages` ? `<ButtonLink variant="primary" href={hrefFor(page + 1)}
    rel="next">` : o mesmo `span` com `buttonClassName("primary")`. Página única: os dois `span`.
    `hrefFor` é função passada de RSC para RSC (não cruza a fronteira client). Funciona sem JavaScript.
    Alternativa descartada: `<button disabled>` nos limites (controle que nunca faz nada; o `span`
    informa só que não há link, como D28).
12. **`EmptyState`** (shared; D36; `components.md` linha `EmptyState`; base visual: vazio de
    `Favoritos.dc.html`):
    ```ts
    export type EmptyStateIcon = "search" | "heart" | "alert" | "film";
    export type EmptyStateAction = { label: string; href: string } | { label: string; onClick: () => void };
    export interface EmptyStateProps { icon: EmptyStateIcon; title: string; description?: string; action?: EmptyStateAction }
    export function EmptyState({ icon, title, description, action }: EmptyStateProps): ReactNode;
    ```
    `<div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle
    bg-surface-100 px-6 py-16 text-center">`: SVG 32 px `stroke="currentColor" strokeWidth={1.75}`
    `aria-hidden` em `text-text-muted` (um `<path>` por ícone num mapa interno: lupa, coração do
    protótipo, círculo com "!", retângulo de filme); título `<p className="text-base font-semibold
    text-text-primary">`; descrição `<p className="text-text-muted">`; ação `href` → `<ButtonLink
    variant="primary">`, `onClick` → `<Button variant="primary">`. `icon` é uma união de nomes (e não
    `ReactNode`) para os quatro usos previstos em `components.md` terem tamanho e traço idênticos sem
    SVG copiado em quatro lugares; `heart` e `film` ficam prontos para `favoritos` e `not-found`.
    Título em `<p>` (como o protótipo) para não impor hierarquia de headings em `error.tsx`/`not-found`.
13. **`ErrorState` e `error.tsx`** (client; D21, D36, D37):
    ```ts
    export interface ErrorStateProps { error: Error & { digest?: string }; reset: () => void; title?: string }
    export function ErrorState({ error, reset, title = "Não foi possível carregar os filmes" }: ErrorStateProps): ReactNode;
    ```
    Renderiza `EmptyState` `icon="alert"` com descrição `process.env.NODE_ENV === "development" ?
    error.message : "Tente novamente em instantes."` (em produção o Next redige a mensagem do servidor
    e só manda `digest`, D21; em dev a mensagem de `TmdbError("config")` nomeia
    `TMDB_API_READ_TOKEN`) e ação `{ label: "Tentar novamente", onClick: retry }`, com `retry = () =>
    startTransition(() => { router.refresh(); reset(); })` (`useRouter` de `next/navigation`,
    `useTransition` local), que é a forma documentada de recuperar um erro de Server Component.
    `src/app/error.tsx`: `"use client"`, `export default function ErrorPage(props) { return
    <ErrorState {...props} /> }`. O `Header` continua visível (o `error.tsx` só substitui a página).
    `title?` é opcional para o `detalhe-filme` dizer "o filme" sem duplicar o componente.
14. **Mapeamento de tokens** (D33, pilar 5; `tokens/README.md > Mapa de uso`):
    | Elemento | Classes (tokens 1:1) |
    |---|---|
    | Label de campo | `text-text-muted` |
    | Input e selects | `bg-surface-100 text-text-primary border-border-subtle`; placeholder via `::placeholder` global (`text-text-muted`, D34); chevron `text-text-muted` |
    | Hint do modo busca, meta do card, "Página X de N", contagem de resultados, descrição do `EmptyState` | `text-text-muted` |
    | Título do card, título do `EmptyState` | `text-text-primary`; hover do título `hover:text-accent` |
    | Pôster/placeholder, blocos do skeleton | `bg-surface-200`; linhas do skeleton `bg-surface-100`; rótulo "Pôster" `text-text-subtle` com `aria-hidden` (D34) |
    | Caixa do `EmptyState` | `bg-surface-100 border-border-subtle` |
    | Próxima, ação do `EmptyState`, "Tentar novamente" | `primary` = `bg-accent text-on-accent` (via `buttonClassName`) |
    | Anterior | `outline` = `border-border-strong bg-bg-base text-text-primary` (via `buttonClassName`) |
    | Foco | `:focus-visible` global com `outline-focus-ring` |
    `accent` aparece só em Próxima, na ação primária dos estados e no hover do título (ação); nenhuma
    cor literal em `src/` (o `tokens:check` falha se houver). Opacidades (`opacity-50`, `opacity-60`)
    não são cor.
15. **Responsivo e acessibilidade** (D35; `components.md > Acessibilidade`): a 390 px o `form` quebra
    (busca em linha própria, selects lado a lado encolhidos), o grid tem 2 colunas e a paginação
    quebra linha; gutter de 16 px vem do `main` (`px-4`). Nativos: `label` envolvendo `input`/`select`,
    `form role="search"`, `nav aria-label="Paginação"`, `ul role="list"`; `aria-busy` na região e no
    `form`; `role="status"` no skeleton e no texto "Atualizando resultados…"; `aria-describedby` do hint
    nos selects desabilitados; `aria-label` no link do pôster; `aria-disabled` nos limites da
    paginação; `min-h-11`/`h-11` em todo controle; Enter aplica a busca; a ordem de tabulação segue a
    tela.
16. **Testes** (D7, D43; critério da linha 3 do backlog):
    - `src/lib/listing/params.test.ts`: defaults com entrada vazia (objeto e `URLSearchParams`); cada
      chave válida; inválidos (`genre=abc`, `genre=0`, `sort=foo`, `page=abc`, `page=0`, `page=501`,
      `page=2.7`); array no objeto do Next (`page: ["3", "4"]` → 3); D14 (`q=m&genre=28&sort=rating` →
      `genreId: null`, `sort: "popularity"`); `q` só espaços → `null`; `buildListingHref` omite
      defaults (`DEFAULT_LISTING_QUERY` → `/`; `page: 1` omitido; `sort: "popularity"` omitido);
      ordem `q`, `genre`, `sort`, `page`; `q` com espaço (`the matrix` → `q=the+matrix`); `genre` e
      `sort` omitidos quando há `q`; `page` acima de 500 clampado; round-trip.
    - `src/lib/format/rating.test.ts`: `7.2` → "7,2"; `8` → "8,0"; `7.26` → "7,3"; `formatRating(7.2,
      10)` → "Nota 7,2"; `formatRating(0, 0)` e `(9.5, 0)` → "Sem nota".
    - `src/lib/format/releaseYear.test.ts`: `"1999-03-30"` → 1999; `"2024"` → 2024; `""`, `null`,
      `undefined`, `"abc"` → `null`.
    - `src/components/movies/FilterBar.test.tsx` (`vi.mock("next/navigation")` com `useRouter` →
      `{ push: vi.fn(), replace: vi.fn() }` e `useSearchParams` → `new URLSearchParams(...)` por caso;
      `vi.useFakeTimers()`): digitar "mat" não chama `replace` antes de 350 ms e chama **uma** vez com
      `("/?q=mat", { scroll: false })` depois; digitar e apagar tudo → `replace("/")` (com URL inicial
      `q=matrix`); Enter chama na hora; texto igual ao da URL não chama; gênero → `push("/?genre=28")`;
      ordenação → `push("/?sort=rating")`; URL `q=matrix` deixa os dois selects `disabled` com o hint
      visível e `aria-describedby`; `disabled` (fallback) renderiza os três controles desabilitados,
      opção "Carregando gêneros…" e **não** chama `useSearchParams` (mock que lança).
    - `src/components/movies/Pagination.test.tsx`: página 1 de 5 → "Anterior" não é link
      (`aria-disabled`), "Próxima" é link com `hrefFor(2)`; 5 de 5 → o inverso; 1 de 1 → nenhum link;
      texto "Página 3 de 5".
    - `src/components/movies/MovieCard.test.tsx` (cortável): meta nos quatro casos; placeholder
      "Pôster" sem `posterUrl`; `href` com e sem `from`; `toMovieCardData` com `posterPath: null` e
      `releaseDate: null`. Se `next/image` reclamar no jsdom, `vi.mock("next/image")` devolvendo `<img>`.
    - `src/components/ui/EmptyState.test.tsx` (cortável): ação `href` vira link; `onClick` vira botão.
    `MovieResults` e `FilterBarLoader` não têm teste unitário (async RSC); são o grupo 8 das tasks.
17. **Dois modos de `cacheComponents`** (D2, D42; critério no `tasks.md`): sem a flag, `npm run build`
    lista `/` como `ƒ` e não faz nenhum fetch (nenhum prerender da página); com
    `CATALOGO_CACHE_COMPONENTS=1`, `/` aparece como `◐` e o build também não faz fetch porque
    `connection()` e `await searchParams` tiram os dois buracos do shell. `next dev` com a flag abre
    `/`, `/?q=matrix`, `/?page=2` sem insight/erro de blocking-route nem de IO síncrono no overlay. O
    código é o mesmo nos dois modos: sem `'use cache'`, sem `cacheLife`, cache só no `client.ts` (D20).
18. **Registro** — `components.md` recebe no apply (regra do próprio arquivo): linha `ListingTransition`
    (client, `components/movies/`), `ErrorState` com pasta `components/ui/` e prop `title?`, tipo de
    `icon` do `EmptyState`, `toMovieCardData` e `movieGridClassName`, `ul role="list"` no `MovieGrid`.
    `backlog.md`: L2–L5 `doing` no apply, `done` no finish. README: nada aqui; a lista para a seção
    "Decisões técnicas e trade-offs" está no último item de Riscos / Trade-offs.

## Riscos / Trade-offs
- Fallback do `FilterBar` com valores padrão (decisão 5): em `/?q=matrix` com a flag ligada o campo
  fica vazio até o buraco chegar → curto (gêneros em cache de 24 h); a alternativa de passar `genres`
  como Promise com `use()` fica como melhoria futura.
- `useSearchParams` no fallback por engano quebra o build com a flag ("Missing Suspense boundary") →
  o teste do fallback mocka `useSearchParams` para lançar; `FilterBarFields` não tem hooks.
- Teclas perdidas entre o commit do debounce e a chegada da URL → `committedRef` + escrita no DOM
  via ref (decisão 6), com teste "texto igual ao da URL não chama".
- Regras do React Compiler no `eslint-config-next` 16 (`react-hooks/refs`, `set-state-in-effect`)
  podem reprovar o `FilterBar` → refs só lidas/escritas em handlers e efeitos; sem `setState` em efeito.
- `Pagination` por `<Link>` não escurece o grid (decisão 7) → o Next mantém o conteúdo antigo; sem
  regressão funcional; `useLinkStatus` como melhoria.
- Gênero inválido na URL não é rejeitado pelo parser → lista vazia com "Limpar filtros"; validar contra
  `getGenres()` exigiria o fetch no parser (fora do shell) e fica fora.
- `next/image` no jsdom pode exigir mock nos testes do `MovieCard` → `vi.mock("next/image")`; e se
  faltar prazo, `next/image` → `<img>` é um corte previsto (D43).
- `page > totalPages` entrega `EmptyState` e não redirect → a URL "errada" fica na barra; é o
  comportamento escolhido (uma requisição, sem loop) e está na spec.
- `FavoriteSnapshot` (D30) não tem `voteCount`, mas `MovieCardData.voteCount` é obrigatório (contrato
  do `MovieCard` em `components.md`) → o change `favoritos` precisa acrescentar `voteCount` ao snapshot
  (a chave `catalogo.favorites.v1` ainda não foi publicada) ou mapear `voteCount: 1` quando ausente;
  registrado para o propose do `favoritos`.
- Cinco colunas a 1280 px (`minmax(200px)` de `components.md`) contra as quatro do PNG (`220px`) →
  mantido o contrato de `components.md`; trocar para 220 px é uma classe.
- Build com a flag é mais estrito (shell estático) → qualquer leitura de `searchParams`, `cookies()` ou
  `Date` fora dos dois `<Suspense>` quebra; a task 8.7 pega.
- Ordem de corte deste change se faltar prazo (D43, respeitando o critério do backlog): testes de
  `MovieCard`/`EmptyState` → contagem de resultados em modo busca → `next/image` → `<img>`. Não
  cortáveis: L2–L5, testes de `lib/`, do `FilterBar` e da `Pagination`, verificação nos dois modos.
- Decisões para o README (seção "Decisões técnicas e trade-offs", adicionadas no finish): D14 (busca
  exclusiva, lado da UI e hint), D17 (página fora do intervalo como `EmptyState`), D21 (`error.tsx`
  com `router.refresh()` + `reset()`), D22 (`connection()` antes de `getGenres`), D23 (`next/image`
  `w342` com `sizes`), D24 (URL única fonte; `ListingQuery` como shape único), D25 (replace com
  debounce × push), D26 (transição compartilhada por `ListingTransition`, ilha registrada), D27
  (`FilterBar` lê a URL sozinho; fallback sem URL), D28 (`Pagination` RSC com `<Link>`), D35 (2 colunas
  a 390 px), D36 (`EmptyState` único com ícones nomeados), D37 (skeleton de 8, barra desabilitada,
  `error.tsx` por segmento), D42 (verificação nos dois modos).
