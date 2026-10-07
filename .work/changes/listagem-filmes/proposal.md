# listagem-filmes

## Resumo:
Terceiro change do catálogo: a tela de listagem em `/` (`.work/design/screens/Main.dc.html`,
`screens/pdf/listagem.png`) com filmes populares paginados, busca por título, filtro por gênero e
ordenação por popularidade, nota e data de lançamento, tudo dirigido pela URL (`q`, `genre`, `sort`,
`page`). Cria `src/lib/listing/` (parser e href da URL), `src/lib/format/` (nota "7,2" e ano),
`src/components/movies/` (`FilterBar`, `FilterBarLoader`, `MovieResults`, `MovieGrid`,
`MovieGridSkeleton`, `MovieCard`, `Pagination`, `ListingTransition`), `src/components/ui/EmptyState.tsx`
e `src/components/ui/ErrorState.tsx`, reescreve `src/app/page.tsx` com os dois `<Suspense>` e cria
`src/app/error.tsx`. Consome o contrato do `tmdb-client` (`getGenres`, `fetchListing`, tipos de
domínio, `posterUrl`) sem alterá-lo. Entrega [#L2], [#L3], [#L4] e [#L5]. O coração de favoritar
(`FavoriteButton`) **não** entra aqui: o `MovieCard` nasce com a posição reservada e o change
`favoritos` o liga.

## Parent item(ns) relacionado(s):
- [#L2] Listagem de filmes populares com paginação. `MovieResults` chama `fetchListing` com a página
  da URL; `Pagination` renderiza Anterior · "Página X de N" · Próxima com `<Link>` e desabilita nos
  limites; página acima do total vira `EmptyState` com link para a última página (D17, lado da UI).
- [#L3] Busca por título. Campo "Buscar por título" no `FilterBar` com debounce de 350 ms e
  `router.replace` (D25); a URL ganha `q`; busca sem resultado mostra `EmptyState` com "Limpar busca".
  Com `q` preenchido, gênero e ordenação ficam desabilitados com hint e saem da URL (D14).
- [#L4] Filtro por gênero. Select "Gênero" (padrão "Todos") alimentado por `getGenres()` via
  `FilterBarLoader` com `await connection()` (D22); mudança faz `router.push` com `genre=<id>` e zera
  a página.
- [#L5] Ordenação por popularidade, nota e data de lançamento. Select "Ordenar por" (padrão
  "Popularidade") com as três opções de `LISTING_SORTS` (`popularity` · `rating` · `release`), que
  o `tmdb-client` traduz em `sort_by` mais os cortes de D15/D16.

## Tasks
Ver `tasks.md`: 1) inspeção da base deixada por `setup-catalogo` e `tmdb-client`; 2) `src/lib/listing/`
(parser, href, testes); 3) `src/lib/format/` (nota e ano, testes); 4) UI compartilhada (`EmptyState`,
`MovieCard`, `MovieGrid`, `MovieGridSkeleton`); 5) `FilterBar` (busca, gênero, ordenação, modo busca,
teste) e `FilterBarLoader`; 6) `ListingTransition`, `Pagination` (teste) e `MovieResults`; 7) rotas
(`page.tsx`, `ErrorState`, `error.tsx`); 8) verificação no browser dos quatro requisitos, dos estados,
de 390/1280 px e dos dois modos de `cacheComponents`; 9) registro (`backlog.md`, `components.md`,
render); 10) validação.

## Por quê
Os quatro requisitos obrigatórios da tela 1 do enunciado (L2–L5) são a primeira funcionalidade visível
do catálogo e dependem só do que já existe: o shell e o Design System do `setup-catalogo` e a porta
TMDB do `tmdb-client`, cujo `fetchListing(query: ListingQuery)` já recebe exatamente o estado que a URL
carrega. Fazer os quatro num change só é o que D41 previu (dias 2–3) e evita quatro reescritas do
mesmo `FilterBar`. O change também materializa os pilares que ainda não tinham código: pilar 4 (URL como
única fonte da listagem, D24), pilar 1 na prática (`searchParams` e `fetch` só sob `<Suspense>`,
`connection()` antes do fetch que não depende da URL, D22/D27), pilar 6 (loading, vazio e erro
definidos: skeleton, `EmptyState`, `error.tsx`, D36/D37) e o critério D42 nos dois modos de
`cacheComponents`. O `MovieCard` e o `MovieGrid` nascem aqui porque o `favoritos` os reutiliza em
`/favoritos` (components.md) e o `FavoriteButton` precisa de um card para morar.

## O que muda
- Nasce `src/lib/listing/params.ts`: `parseListingParams()` lê `q`, `genre`, `sort`, `page` (de
  `URLSearchParams` ou do objeto `searchParams` do Next), valida, aplica `clampPage` a `[1, 500]` e
  normaliza D14 (com `q`, `genre` e `sort` voltam ao padrão); `buildListingHref()`/`buildListingSearch()`
  fazem o caminho inverso omitindo defaults (`/` e não `/?page=1`). Devolvem o próprio `ListingQuery`
  do `tmdb-client`: um shape só para URL, componentes e API. Testes em `params.test.ts`.
- Nasce `src/lib/format/`: `rating.ts` (`formatVoteAverage` → "7,2"; `formatRating` → "Nota 7,2" ou
  "Sem nota") e `releaseYear.ts` (`"1999-03-30"` → `1999`, vazio → `null`), com testes. Primeiro
  consumidor é o `MovieCard`; `RatingChip` e `MovieHeader` reutilizam no `detalhe-filme`.
- Nasce `src/components/movies/`: `FilterBar` (client: `useSearchParams`, `useRouter`, transição,
  debounce, D14), `FilterBarLoader` (RSC async com `await connection()` + `getGenres()`), `MovieResults`
  (RSC async: `await searchParams` → `fetchListing` → grid + paginação ou `EmptyState`), `MovieGrid`
  (shared), `MovieGridSkeleton` (shared, 8 cards), `MovieCard` (shared, `next/image` `w342`, meta
  "Nota 7,2 · 1999", link para `/movie/{id}` com `?from=`), `Pagination` (RSC com `<Link>`) e
  `ListingTransition` (client: compartilha `isPending` entre o `FilterBar` e a região dos resultados
  para `aria-busy` e opacidade, D26).
- Nasce `src/components/ui/EmptyState.tsx` (shared; ícone, título, descrição, ação por `href` ou
  `onClick`, D36) e `src/components/ui/ErrorState.tsx` (client; usa `EmptyState` com "Tentar novamente",
  D21), este renderizado por `src/app/error.tsx` (novo).
- `src/app/page.tsx` é reescrito: `h1` "Filmes populares" e os dois `<Suspense>` de D37, sem ler
  `searchParams` na página (a Promise vai para `MovieResults`, D27). `metadata.title` continua.
- Efeito colateral documentado: `/` deixa de ser estática. Sem a flag é dinâmica (`ƒ`); com
  `CATALOGO_CACHE_COMPONENTS=1` vira shell estático com dois buracos (`◐`). O build continua sem token
  e sem rede porque nenhum fetch é alcançável pelo shell.
- Fora de escopo: `FavoriteButton`, `FavoritesBadge`, `FavoritesList`, store de favoritos
  (`favoritos`); rota `/movie/[id]`, `BackLink` e o parse do `?from=` no destino (`detalhe-filme`;
  este change só emite o parâmetro); busca multipágina (alternativa (c) de D14); `generateMetadata`
  por busca; README (as decisões ficam listadas em `design.md › Riscos / Trade-offs` para o finish e
  o `readme-entrega`); `src/lib/tmdb/` e `next.config.ts` (nada a mudar).

## Capacidades
### Novas
- `listagem-filmes`: listagem de filmes dirigida pela URL com paginação, busca, filtro por gênero e
  ordenação, estados de carregamento/vazio/erro, cards reutilizáveis e verificação nos dois modos de
  `cacheComponents`. Spec em `specs/listagem-filmes/spec.md`.
### Modificadas
- `projeto-base` (spec do `setup-catalogo`): o cenário "Páginas estáticas" deixa de valer para `/`,
  que passa a ser dinâmica sem a flag e parcialmente estática (shell + buracos) com a flag; `/favoritos`
  continua estática. O cenário "Build sem variáveis de ambiente" continua valendo (nenhuma URL do TMDB
  em `.next/server/app` fora dos segmentos dinâmicos; nenhum fetch no prerender). A spec de
  `projeto-base` não é editada: o comportamento novo está descrito na spec deste change.
- `cliente-tmdb` (spec do `tmdb-client`): nenhuma mudança de código. Este change consome `getGenres`,
  `fetchListing`, `ListingQuery`, `ListingResult`, `MovieSummary`, `Genre`, `LISTING_SORTS`,
  `DEFAULT_SORT`, `clampPage`, `MAX_PAGE`, `posterUrl`, `POSTER_SIZE` e `TmdbError` exatamente como
  publicados em `.work/changes/tmdb-client/design.md`.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L2] — Listagem de filmes populares com paginação
  - [#L2] — Inspecionar a base (`setup-catalogo`, `tmdb-client`) e os docs do Next 16 usados
  - [#L2] — `src/lib/listing/params.ts` + `params.test.ts` (`parseListingParams`, `buildListingHref`, `buildListingSearch`, D24, D17)
  - [#L2] — `src/lib/format/rating.ts` + `releaseYear.ts` + testes
  - [#L2] — `src/components/ui/EmptyState.tsx` (+ teste)
  - [#L2] — `src/components/movies/MovieCard.tsx` (`toMovieCardData`, posição do `FavoriteButton`) + teste
  - [#L2] — `src/components/movies/MovieGrid.tsx` e `MovieGridSkeleton.tsx`
  - [#L2] — `src/components/movies/ListingTransition.tsx`
  - [#L2] — `src/components/movies/Pagination.tsx` + `Pagination.test.tsx`
  - [#L2] — `src/components/movies/MovieResults.tsx` (populares, página fora do intervalo, vazio, `from`)
  - [#L2] — `src/app/page.tsx` com `h1` e os dois `<Suspense>`
  - [#L2] — `src/components/ui/ErrorState.tsx` + `src/app/error.tsx`
  - [#L2] — Verificar populares e paginação no browser; 390 e 1280 px; build e `next dev` com a flag
- [#L3] — Busca por título
  - [#L3] — `FilterBar`: estrutura do `form role="search"`, campo de busca, debounce 350 ms com `router.replace`, Enter aplica na hora
  - [#L3] — `FilterBar.test.tsx`: debounce, replace × push, modo busca, fallback sem URL
  - [#L3] — Verificar busca, busca vazia e "Limpar busca" no browser
- [#L4] — Filtro por gênero
  - [#L4] — `FilterBar`: select "Gênero" com `router.push` e `page` zerada
  - [#L4] — `FilterBarLoader` com `await connection()` + `getGenres()` e fallback desabilitado
  - [#L4] — Verificar filtro por gênero no browser (inclusive gênero sem resultado)
- [#L5] — Ordenação por popularidade, nota e data de lançamento
  - [#L5] — `FilterBar`: select "Ordenar por" com as três opções de `LISTING_SORTS` e modo busca (D14)
  - [#L5] — Verificar as três ordenações no browser (nota com corte de votos, data sem futuros)

## Impacto
- Arquivos novos: `src/lib/listing/params.ts`, `src/lib/listing/params.test.ts`,
  `src/lib/format/rating.ts`, `src/lib/format/rating.test.ts`, `src/lib/format/releaseYear.ts`,
  `src/lib/format/releaseYear.test.ts`, `src/components/ui/EmptyState.tsx`,
  `src/components/ui/EmptyState.test.tsx`, `src/components/ui/ErrorState.tsx`,
  `src/components/movies/FilterBar.tsx`, `src/components/movies/FilterBar.test.tsx`,
  `src/components/movies/FilterBarLoader.tsx`, `src/components/movies/ListingTransition.tsx`,
  `src/components/movies/MovieResults.tsx`, `src/components/movies/MovieGrid.tsx`,
  `src/components/movies/MovieGridSkeleton.tsx`, `src/components/movies/MovieCard.tsx`,
  `src/components/movies/MovieCard.test.tsx`, `src/components/movies/Pagination.tsx`,
  `src/components/movies/Pagination.test.tsx`, `src/app/error.tsx`.
- Arquivos modificados: `src/app/page.tsx` (reescrito: sai o parágrafo-placeholder do
  `setup-catalogo`, entram os dois `<Suspense>`), `.work/backlog.md` (estado de L2–L5 no apply),
  `.work/design/components.md` (linhas novas de `ListingTransition` e `ErrorState` em
  `components/ui/`, tipo do `icon` do `EmptyState`, `toMovieCardData`; no apply, conforme a regra do
  próprio arquivo).
- Dependências: nenhuma nova. Só `next` (`next/link`, `next/image`, `next/navigation`,
  `next/server` para `connection`), `react` (`Suspense`, `useTransition`, `useId`, `createContext`) e
  o que o `tmdb-client` já instalou. Sem biblioteca de debounce, de ícones ou de estado.
- Padrões reutilizados: inspecionados os arquivos criados pelo `setup-catalogo` — `src/app/page.tsx`
  (esqueleto a reescrever; `metadata.title` e classes do `h1`), `src/app/layout.tsx` (container do
  `main`), `src/components/ui/Button.tsx` (`Button`, `ButtonLink`, `buttonClassName`, usados por
  `Pagination` e `EmptyState`), `src/components/layout/NavLink.tsx` e `NavLink.test.tsx` (molde de ilha
  client e de teste com `next/navigation` mockado), `src/app/globals.css` (tokens no `@theme`,
  `:focus-visible`, `::placeholder`), `vitest.config.mts`/`vitest.setup.ts`, `next.config.ts`
  (`images.remotePatterns` já libera `image.tmdb.org/t/p/**`); e pelo `tmdb-client` —
  `src/lib/tmdb/types.ts` (`ListingQuery`, `ListingResult`, `MovieSummary`, `Genre`, `ListingSort`),
  `src/lib/tmdb/params.ts` (`LISTING_SORTS`, `DEFAULT_SORT`, `clampPage`, `MAX_PAGE`),
  `src/lib/tmdb/images.ts` (`posterUrl`, `POSTER_SIZE.card`), `src/lib/tmdb/client.ts` (`getGenres`,
  `fetchListing`), `src/lib/tmdb/errors.ts` (`TmdbError`, para o `error.tsx`),
  `src/lib/tmdb/params.test.ts` (estilo de teste de função pura). Fontes de decisão:
  `.work/config.yaml > context` (pilares 1, 2, 4, 5, 6, 7, 8), `.work/design/decisoes.md` (D14, D16,
  D17, D21–D28, D35–D37, D42, D43), `.work/design/components.md` (linhas `FilterBar`,
  `FilterBarLoader`, `MovieResults`, `MovieGrid`, `MovieGridSkeleton`, `MovieCard`, `Pagination`,
  `EmptyState`, `ErrorState`, `Button`; "Páginas e arquivos de rota"; "Estados que o protótipo não
  desenha"; "Acessibilidade"), `.work/backlog.md > Sequência de changes` (linha 3). Tela implementada:
  `.work/design/screens/Main.dc.html` (rota `/`), com o vazio de `Favoritos.dc.html` como base visual
  do `EmptyState` (D36). O bundle `.work/design/reference/` não foi usado como código.
