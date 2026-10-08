# detalhe-filme

## Resumo:
Quinto change do catálogo: a página de detalhe em `/movie/[id]` (tela
`.work/design/screens/Detalhe.dc.html`, `screens/pdf/detalhe.png`). Cria a rota
`src/app/movie/[id]/{page,not-found,error}.tsx`, o domínio de UI `src/components/movie-detail/`
(`BackLink`, `BackLinkLoader`, `MovieDetails`, `MovieHeader`, `RatingChip`, `Overview`,
`CastList`/`CastCard`, `TrailerEmbed`, `DetailSkeleton`), três formatadores em `src/lib/format/`
(`formatRuntime` → "2h 16min", `languageName` → "inglês", `formatMovieMeta` → "1999 · 2h 16min ·
Ação, Ficção científica"), `backHref` em `src/lib/listing/` (o `?from=` validado de D39) e
`parseMovieId` em `src/lib/tmdb/` (id inteiro positivo antes do fetch). Consome, sem alterar,
`getMovieDetail`/`MovieDetail` do `tmdb-client` (sinopse e trailer já escolhidos por `pickOverview`
e `pickTrailer`), `parseListingParams`/`buildListingHref`, `EmptyState`, `ErrorState`,
`formatRating` e `releaseYear` do `listagem-filmes`, e o `FavoriteButton` na variante `full` do
`favoritos`. Entrega [#L6]. Não toca na listagem, nos favoritos nem no README.

## Parent item(ns) relacionado(s):
- [#L6] Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal
  e trailer quando houver. A rota é exatamente `/movie/[id]` (restrição do enunciado); a sinopse
  segue D18 (pt-BR → inglês → idioma original → qualquer, com aviso "Sinopse disponível apenas em
  inglês" ou o idioma de origem, e "Sinopse não disponível." quando não há nenhuma); o trailer é o
  único vídeo escolhido por D19, com a seção inteira omitida quando não há (D38); a nota é o chip
  "Nota 7,2"/"Sem nota" (`formatRating`); o elenco são até 8 pessoas por `order` (`MAIN_CAST_LIMIT`
  do mapeador). O botão "♡ Adicionar aos favoritos" do protótipo é o `FavoriteButton full` do [#L7],
  já pronto, recebendo o `MovieDetail` sem adaptador. "← Voltar à listagem" preserva os filtros via
  `?from=` (D39), que o `MovieCard` do `listagem-filmes` já emite.

## Tasks
Ver `tasks.md`: 1) inspeção da base deixada por `setup-catalogo`, `tmdb-client`, `listagem-filmes`
e `favoritos`, e dos docs do Next 16.4 instalados (`generateMetadata`, `not-found`, `error`,
`image`, Cache Components); 2) funções puras com teste (`parseMovieId`, `backHref`, `formatRuntime`,
`languageName`, `formatMovieMeta`); 3) componentes de apresentação (`BackLink`, `RatingChip`,
`Overview`, `CastList`/`CastCard`, `TrailerEmbed`, `MovieHeader`, `DetailSkeleton`) com testes;
4) composição server (`MovieDetails`, `BackLinkLoader`); 5) rotas (`page.tsx` com
`generateMetadata`, `not-found.tsx`, `error.tsx`); 6) verificação no browser (critério da linha 5
de `.work/backlog.md`) e nos dois modos de `cacheComponents`; 7) registro (`components.md`,
`backlog.md`); 8) validação.

## Por quê
L6 é o último requisito obrigatório com tela própria e o único que ainda não tem rota. D41 o coloca
depois de `tmdb-client` (que entrega `getMovieDetail` com sinopse e trailer já resolvidos) e de
`favoritos` (que entrega o `FavoriteButton full`), para que este change seja quase só composição:
a lógica de dados (D18, D19, D21) está na porta TMDB e é testada lá; a lógica de favoritos está no
store. O que nasce aqui é a UI do detalhe e o pouco de lógica pura que só ela usa (duração, rótulo
de idioma, linha de metadados, validação do id da rota, href de volta), tudo em funções testadas
(pilar 3). A página materializa os pilares 1 e 6 numa rota dinâmica: nenhuma leitura de `params`/
`searchParams` nem fetch fora de `<Suspense>` (válido nos dois modos de `cacheComponents`, D2),
`DetailSkeleton` como loading, `not-found.tsx` para id inválido ou inexistente, `error.tsx` por
segmento (D37), e as duas restrições não negociáveis do enunciado (sinopse com fallback de idioma
ou mensagem de ausência; trailer só quando houver) ficam verificáveis no browser e em teste.

## O que muda
- Nasce `src/app/movie/[id]/page.tsx` (RSC): `generateMetadata` com o título do filme usando o
  mesmo `getMovieDetail` memoizado (sem chamada extra; fallback "Filme") e a página com dois
  `<Suspense>` irmãos: `BackLinkLoader` (lê `searchParams.from`, fallback `<BackLink href="/" />`)
  e `MovieDetails` (lê `params.id`, fallback `<DetailSkeleton />`). Nenhum `await` no corpo da
  página; sem `generateStaticParams` (o build não pré-renderiza nenhum filme: sem token e sem rede).
- Nasce `src/app/movie/[id]/not-found.tsx` (RSC): `EmptyState` `icon="film"` "Filme não encontrado"
  com ação "Voltar à listagem" para `/` (D36). Nasce `src/app/movie/[id]/error.tsx` (client): só
  renderiza `ErrorState` com `title="Não foi possível carregar o filme"` (D21, D37).
- Nasce `src/components/movie-detail/`: `BackLink` (RSC, link com seta e "Voltar à listagem"),
  `BackLinkLoader` (RSC async; `await searchParams` → `backHref(from)`), `MovieDetails` (RSC async;
  `await params` → `parseMovieId` → `notFound()` se inválido → `getMovieDetail` → `notFound()` se
  `null` → compõe as seções), `MovieHeader` (duas colunas do protótipo: pôster `w500` com
  `next/image` ou placeholder, `h1`, linha "Ano · Duração · Gênero, Gênero" omitindo pedaços
  ausentes, chips com `RatingChip` + `FavoriteButton full`; as seções entram como `children` na
  coluna da direita), `RatingChip` ("Nota 7,2"/"Sem nota"), `Overview` (três casos de D18, com
  `lang` no parágrafo quando não é português), `CastList`/`CastCard` (`figure`/`figcaption`, foto
  `w185` ou placeholder, 2 colunas a 390 px, seção omitida sem elenco), `TrailerEmbed` (iframe
  `youtube-nocookie.com` com `title`, `loading="lazy"`, `allowFullScreen`, `aspect-video`; seção
  omitida sem trailer, D38) e `DetailSkeleton` (mesmas superfícies do `MovieGridSkeleton`, D37).
- Nascem em `src/lib/format/`: `runtime.ts` (`formatRuntime(minutes)` → "2h 16min" | "45min" |
  "2h" | `null`), `languageName.ts` (`languageName(code)` via `Intl.DisplayNames("pt-BR")` → "inglês"
  | `null`) e `movieMeta.ts` (`formatMovieMeta({ releaseDate, runtime, genres })` → linha com " · "
  ou `null`), cada um com teste ao lado. O `listagem-filmes` deixou explicitamente os dois primeiros
  para este change, primeiro consumidor.
- Nasce `src/lib/listing/backHref.ts`: `backHref(from)` valida o `?from=` com
  `parseListingParams(new URLSearchParams(from))` e monta `buildListingHref(...)`; sem `from`, ou com
  qualquer conteúdo inválido, devolve `/` (D39). Nasce `src/lib/tmdb/parseMovieId.ts`:
  `parseMovieId(raw)` aceita só inteiro positivo em forma canônica (`/movie/603`), senão `null`.
  Ambos puros, testados, sem `server-only`.
- Nenhum arquivo existente de `src/` é modificado. `.work/design/components.md` e `.work/backlog.md`
  recebem o registro no apply (linha `BackLinkLoader`, props finais de `MovieDetails`/`MovieHeader`,
  L6 `doing`), conforme a regra dos próprios arquivos.
- Fora de escopo: README e `decisoes.md` como texto (a lista para o README fica em
  `design.md › Riscos / Trade-offs`; nenhuma decisão é reaberta); `generateStaticParams`; lite embed
  do YouTube (D38: melhoria futura); `router.back()` (descartado em D39); galeria de imagens,
  filmes semelhantes, recomendações; elenco completo além de 8; retry automático em 429; alteração
  de `src/lib/tmdb/client.ts` (os fallbacks de D18/D19 decididos pela sonda já vivem lá, sem efeito
  nos componentes).

## Capacidades
### Novas
- `detalhe-filme`: rota `/movie/[id]` com shell estático e dados sob Suspense, válida nos dois modos
  de `cacheComponents`; id validado antes do fetch e `not-found` para id inválido ou inexistente;
  cabeçalho com pôster, título, metadados, nota e botão de favorito; sinopse nos três casos de D18;
  elenco principal até 8; trailer só quando houver; "Voltar à listagem" preservando os filtros via
  `?from=` validado; título da aba com o nome do filme. Spec em `specs/detalhe-filme/spec.md`.
### Modificadas
- `cliente-tmdb` (spec do `tmdb-client`): nenhuma mudança de código em `client.ts`, `mappers.ts`,
  `pickOverview.ts`, `pickTrailer.ts`. Este change é o primeiro consumidor de `getMovieDetail`,
  `MovieDetail`, `CastMember`, `MovieOverview`, `MovieTrailer`, `POSTER_SIZE.detail`, `PROFILE_SIZE`
  e `profileUrl`, e consome o resultado da sonda de D18/D19: o caminho de fallback (segunda
  chamada), se adotado, está encapsulado em `getMovieDetail` e não muda nada aqui. Cenários da spec
  `cliente-tmdb` que passam a ter consumidor: "Detalhe inexistente" (`null` → `notFound()`), "Mesma
  URL no mesmo render" (`generateMetadata` + `MovieDetails`), "Elenco principal", "Sinopse com
  fallback de idioma", "Trailer apenas quando houver", "URLs de imagem" (`w500`, `w185`). Acréscimo
  aditivo ao domínio: o arquivo `src/lib/tmdb/parseMovieId.ts` (puro, sem `server-only`), ao lado
  dos oito módulos do `tmdb-client`. Spec não editada.
- `listagem-filmes` (spec do `listagem-filmes`): o cenário "Link com e sem `from`" passa a ter o
  lado consumidor (`backHref` lê o `?from=` emitido pelo `MovieCard`). Acréscimo aditivo:
  `src/lib/listing/backHref.ts` ao lado de `params.ts`, importando `parseListingParams` e
  `buildListingHref` sem alterá-los. `EmptyState` (`icon="film"`, previsto para este uso),
  `ErrorState` (`title?`, previsto para este uso), `formatRating`, `releaseYear` e
  `MovieGridSkeleton` (referência visual do `DetailSkeleton`) são consumidos sem mudança. Spec não
  editada.
- `favoritos` (spec do `favoritos`): o cenário "Variante full" se cumpre no `MovieHeader`
  (`<FavoriteButton movie={movie} variant="full" />` com `movie: MovieDetail`, que satisfaz
  `FavoriteMovie` por estrutura; `toFavoriteSnapshot` copia só os seis campos). Nenhum arquivo do
  `favoritos` muda. Spec não editada.
- `projeto-base` (spec do `setup-catalogo`): nova rota dinâmica sob o mesmo `layout.tsx` (Header e
  container); `metadata.title.template` "%s · Catálogo." passa a receber o título do filme;
  `images.remotePatterns` (`image.tmdb.org/t/p/**`) já cobre `w500` e `w185`. O cenário "Build sem
  variáveis de ambiente" continua valendo: a rota não é pré-renderizada no build. Spec não editada.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L6] — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
  - [#L6] — Inspecionar a base (`setup-catalogo`, `tmdb-client`, `listagem-filmes`, `favoritos`) e os docs do Next 16.4 instalados (`generateMetadata`, `not-found`, `error`, `image`, Cache Components)
  - [#L6] — `src/lib/tmdb/parseMovieId.ts` + `parseMovieId.test.ts`
  - [#L6] — `src/lib/listing/backHref.ts` + `backHref.test.ts` (D39)
  - [#L6] — `src/lib/format/runtime.ts`, `languageName.ts`, `movieMeta.ts` + testes
  - [#L6] — `src/components/movie-detail/BackLink.tsx` e `RatingChip.tsx`
  - [#L6] — `src/components/movie-detail/Overview.tsx` + `Overview.test.tsx` (D18)
  - [#L6] — `src/components/movie-detail/CastList.tsx`, `CastCard.tsx` + `CastList.test.tsx` (D23, D35)
  - [#L6] — `src/components/movie-detail/TrailerEmbed.tsx` + `TrailerEmbed.test.tsx` (D19, D38)
  - [#L6] — `src/components/movie-detail/MovieHeader.tsx` + `MovieHeader.test.tsx` (D23, D40; `FavoriteButton full`)
  - [#L6] — `src/components/movie-detail/DetailSkeleton.tsx` (D37)
  - [#L6] — `src/components/movie-detail/MovieDetails.tsx` e `BackLinkLoader.tsx` (D21, D39; pilar 1)
  - [#L6] — `src/app/movie/[id]/page.tsx` com `generateMetadata`, `not-found.tsx`, `error.tsx` (D36, D37)
  - [#L6] — Verificar no browser: `/movie/603` completo; `/movie/abc`, `/movie/0` e id inexistente → not-found; sinopse nos três casos; trailer ausente; "Voltar" preserva filtros; 390 e 1280 px; teclado
  - [#L6] — Build e `next dev` com `CATALOGO_CACHE_COMPONENTS=1` sem insight de blocking-route (D42)
  - [#L6] — Registro: `components.md` (linhas `BackLinkLoader`, `MovieDetails`, `MovieHeader`, `DetailSkeleton`), `backlog.md` (L6 `doing`)

## Impacto
- Arquivos novos: `src/app/movie/[id]/page.tsx`, `src/app/movie/[id]/not-found.tsx`,
  `src/app/movie/[id]/error.tsx`, `src/components/movie-detail/BackLink.tsx`,
  `src/components/movie-detail/BackLinkLoader.tsx`, `src/components/movie-detail/MovieDetails.tsx`,
  `src/components/movie-detail/MovieHeader.tsx`, `src/components/movie-detail/MovieHeader.test.tsx`,
  `src/components/movie-detail/RatingChip.tsx`, `src/components/movie-detail/Overview.tsx`,
  `src/components/movie-detail/Overview.test.tsx`, `src/components/movie-detail/CastList.tsx`,
  `src/components/movie-detail/CastList.test.tsx`, `src/components/movie-detail/CastCard.tsx`,
  `src/components/movie-detail/TrailerEmbed.tsx`, `src/components/movie-detail/TrailerEmbed.test.tsx`,
  `src/components/movie-detail/DetailSkeleton.tsx`, `src/lib/format/runtime.ts`,
  `src/lib/format/runtime.test.ts`, `src/lib/format/languageName.ts`,
  `src/lib/format/languageName.test.ts`, `src/lib/format/movieMeta.ts`,
  `src/lib/format/movieMeta.test.ts`, `src/lib/listing/backHref.ts`,
  `src/lib/listing/backHref.test.ts`, `src/lib/tmdb/parseMovieId.ts`,
  `src/lib/tmdb/parseMovieId.test.ts`.
- Arquivos modificados: nenhum em `src/`, `next.config.ts`, `package.json` ou `README.md`.
  `.work/backlog.md` (estado de L6 no apply) e `.work/design/components.md` (linha nova
  `BackLinkLoader`; props finais de `MovieDetails` e `MovieHeader`; `DetailSkeleton` com
  `role="status"`; no apply, conforme a regra dos próprios arquivos). `.work/design/decisoes.md`
  não muda: nenhuma decisão é reaberta.
- Dependências: nenhuma nova. `next/image`, `next/link`, `next/navigation` (`notFound`), `react`
  (`Suspense`), `Intl.DisplayNames` (nativo do Node 22 com full-icu; o `Overview` só renderiza no
  servidor) e os módulos do repositório: `@/lib/tmdb/client` (só em `MovieDetails` e
  `generateMetadata`), `@/lib/tmdb/types`, `@/lib/tmdb/images`, `@/lib/listing/params`,
  `@/lib/format/rating`, `@/lib/format/releaseYear`, `@/components/ui/EmptyState`,
  `@/components/ui/ErrorState`, `@/components/favorites/FavoriteButton`.
- Padrões reutilizados: inspecionados os arquivos criados pelos quatro changes anteriores —
  `src/app/page.tsx` (shell estático com dois `<Suspense>` irmãos e a Promise de `searchParams`
  descendo sem `await`: molde de `page.tsx` deste change), `src/components/movies/FilterBarLoader.tsx`
  (RSC async que resolve uma entrada e renderiza o componente de apresentação: molde do
  `BackLinkLoader`), `src/components/movies/MovieResults.tsx` (`await searchParams` → fetch →
  três saídas, `PageProps<"/">["searchParams"]` como tipo: molde de `MovieDetails`),
  `src/components/movies/MovieGridSkeleton.tsx` (superfícies `bg-surface-200`/`bg-surface-100`,
  `animate-pulse`, `role="status"` + `sr-only`: molde do `DetailSkeleton`),
  `src/components/movies/MovieCard.tsx` (`next/image` com `fill` + `sizes`, placeholder "Pôster"
  `text-text-subtle aria-hidden`, href com `?from=`), `src/app/error.tsx` (só renderiza
  `ErrorState`: molde do `error.tsx` do segmento), `src/components/ui/EmptyState.tsx` (`icon="film"`
  e ação por `href`), `src/components/ui/ErrorState.tsx` (`title?`), `src/lib/listing/params.ts`
  (`parseListingParams` aceitando `URLSearchParams`, `buildListingHref`), `src/lib/format/rating.ts`
  e `releaseYear.ts` (estilo dos formatadores: `Intl` fixo em `pt-BR`, sem `Date`, teste ao lado),
  `src/lib/tmdb/types.ts` (`MovieDetail`, `CastMember`, `MovieOverview`, `MovieTrailer`, `Genre`),
  `src/lib/tmdb/images.ts` (`posterUrl`, `POSTER_SIZE.detail`, `profileUrl`, `PROFILE_SIZE`; sem
  `server-only`), `src/lib/tmdb/mappers.ts` (`MAIN_CAST_LIMIT`; `cast` já ordenado e cortado;
  `overview`/`trailer` já escolhidos), `src/lib/tmdb/client.ts` (`getMovieDetail(id): Promise<MovieDetail | null>`,
  `null` em 404, demais `TmdbError` propagam), `src/lib/tmdb/params.ts` (`clampPage`: estilo de
  validação numérica, molde do `parseMovieId`), `src/components/favorites/FavoriteButton.tsx`
  (`FavoriteButtonProps { movie: FavoriteMovie; variant }`, `full` com texto visível e
  `aria-pressed`), `src/components/ui/Button.tsx` (classes `min-h-11 rounded-lg font-semibold` que
  o chip de nota replica). Fontes de decisão: `.work/config.yaml > context` (pilares 1, 2, 3, 5, 6,
  7, 8), `.work/design/decisoes.md` (D2, D7, D18, D19, D20, D21, D23, D34, D35, D36, D37, D38, D39,
  D40, D42, D43), `.work/design/components.md` (fronteira server × client do detalhe; linhas
  `BackLink`, `MovieDetails`, `MovieHeader`, `RatingChip`, `Overview`, `CastList`/`CastCard`,
  `TrailerEmbed`, `DetailSkeleton`, `EmptyState`, `ErrorState`, `FavoriteButton`; "Páginas e
  arquivos de rota"; "Estados que o protótipo não desenha"; "Acessibilidade"),
  `.work/backlog.md > Sequência de changes` (linha 5). Tela implementada:
  `.work/design/screens/Detalhe.dc.html` (rota `/movie/[id]`); PNG em `screens/pdf/detalhe.png`.
  O bundle `.work/design/reference/` não foi usado como código.
