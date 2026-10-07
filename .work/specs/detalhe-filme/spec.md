## Requisitos ADICIONADOS

### Requisito: Rota de detalhe com shell estático e dados sob Suspense
O sistema DEVE responder em `/movie/[id]` com uma página cujo corpo não lê `params` nem
`searchParams` e não faz fetch: o href de "Voltar à listagem" e o detalhe do filme DEVEM ser
resolvidos em dois `<Suspense>` irmãos, válidos com `cacheComponents` ligado ou desligado, sem
`generateStaticParams`, `'use cache'` ou `cacheLife`.
Placement: `src/app/movie/[id]/page.tsx` (`default`, `generateMetadata`);
`src/components/movie-detail/BackLinkLoader.tsx` (`await searchParams`);
`src/components/movie-detail/MovieDetails.tsx` (`await params` → `getMovieDetail`); fallbacks
`src/components/movie-detail/BackLink.tsx` (`href="/"`) e `src/components/movie-detail/DetailSkeleton.tsx`.
Endpoint TMDB usado (via `src/lib/tmdb/client.ts`): `GET /movie/{id}?append_to_response=credits,videos,translations`.

#### Cenário: Build sem token e sem rede
- QUANDO `npm run build` roda sem `.env.local`, com ou sem `CATALOGO_CACHE_COMPONENTS=1`
- ENTÃO o build termina com sucesso
- E nenhuma requisição é feita a `api.themoviedb.org` (nenhum id é pré-renderizado)

#### Cenário: Shell e buracos com a flag ligada
- QUANDO `/movie/603?from=q%3Dmatrix` é aberta com `CATALOGO_CACHE_COMPONENTS=1`
- ENTÃO o shell chega primeiro com "Voltar à listagem" apontando para `/` e o `DetailSkeleton` (`role="status"`, "Carregando filme")
- E em seguida o link passa a apontar para `/?q=matrix` e o detalhe substitui o skeleton
- E `next dev` não emite insight nem erro de blocking-route ou de IO síncrono

#### Cenário: Uma chamada por render
- QUANDO `generateMetadata` e `MovieDetails` chamam `getMovieDetail(603)` na mesma requisição
- ENTÃO apenas uma requisição HTTP ao TMDB acontece (memoização por URL e opções)
- E o título da aba é "<título do filme> · Catálogo."

#### Cenário: Fallback do título
- QUANDO o id é inválido
- ENTÃO `generateMetadata` devolve o título "Filme não encontrado" sem chamar o TMDB
- E quando `getMovieDetail` lança qualquer erro, `generateMetadata` devolve "Filme" e o erro é exibido pelo `error.tsx` a partir do `MovieDetails`

### Requisito: Validação do id e not-found
O sistema DEVE aceitar como id apenas um inteiro positivo em forma canônica, validado antes de
qualquer chamada ao TMDB, e DEVE renderizar `not-found.tsx` para id inválido ou para filme que o
TMDB não encontra (404 → `null` em `getMovieDetail`).
Placement: `src/lib/tmdb/parseMovieId.ts` (`parseMovieId(raw): number | null`);
`src/components/movie-detail/MovieDetails.tsx` (`notFound()`); `src/app/movie/[id]/not-found.tsx`
(`EmptyState` `icon="film"`).

#### Cenário: Id canônico
- QUANDO `parseMovieId("603")` é chamada
- ENTÃO devolve `603`
- E `"1"` devolve `1`

#### Cenário: Id rejeitado
- QUANDO o id é `"abc"`, `"0"`, `"-1"`, `"1.5"`, `"0603"`, `"603abc"`, `" 603"`, `""`, `undefined` ou tem mais dígitos que um inteiro seguro
- ENTÃO `parseMovieId` devolve `null`
- E `/movie/<esse id>` renderiza o not-found sem nenhuma chamada ao TMDB

#### Cenário: Filme inexistente
- QUANDO `/movie/999999999` é aberta e o TMDB responde 404
- ENTÃO `getMovieDetail` devolve `null` e `MovieDetails` chama `notFound()`
- E nenhum `error.tsx` é mostrado

#### Cenário: Página not-found
- QUANDO o not-found é renderizado
- ENTÃO mostra o `EmptyState` com ícone de filme, "Filme não encontrado", a descrição "O endereço pode estar errado ou o filme não existe no TMDB." e o botão "Voltar à listagem" para `/`
- E o `Header` continua visível
- E o status HTTP observado (404, ou 200 com `noindex` quando o shell já foi enviado) fica registrado na evidência

#### Cenário: Erro do TMDB
- QUANDO `getMovieDetail` lança `TmdbError` com `kind` diferente de `not_found` (token ausente, 401, 429, 5xx, rede)
- ENTÃO `src/app/movie/[id]/error.tsx` renderiza o `ErrorState` com o título "Não foi possível carregar o filme" e "Tentar novamente"
- E em desenvolvimento a descrição é a mensagem do erro; em produção é o texto genérico

### Requisito: Cabeçalho do filme
O sistema DEVE renderizar, em duas colunas que empilham no mobile, o pôster `w500` (ou placeholder),
um único `h1` com o título, a linha "Ano · Duração · Gênero, Gênero" omitindo cada pedaço ausente e o
seu separador, o chip de nota e o botão de favorito na variante `full`.
Placement: `src/components/movie-detail/MovieHeader.tsx` (`{ movie: MovieDetail; children? }`);
`src/components/movie-detail/RatingChip.tsx` (`{ voteAverage, voteCount }`);
`src/lib/format/movieMeta.ts` (`formatMovieMeta`); `src/lib/format/runtime.ts` (`formatRuntime`);
imagem via `src/lib/tmdb/images.ts` (`posterUrl(path, POSTER_SIZE.detail)`).

#### Cenário: Filme completo
- QUANDO o `MovieDetail` tem `posterPath`, `releaseDate: "1999-03-30"`, `runtime: 136`, dois gêneros, `voteAverage: 8.7` e `voteCount > 0`
- ENTÃO o pôster é carregado de `image.tmdb.org/t/p/w500` via `next/image` com `priority` e `alt=""`
- E o `h1` é o título, a meta é "1999 · 2h 16min · Ação, Ficção científica" e o chip é "Nota 8,7"
- E o botão "Adicionar aos favoritos" tem `aria-pressed="false"` e alterna para "Remover dos favoritos" com `aria-pressed="true"`, gravando só os seis campos do snapshot

#### Cenário: Pedaços ausentes
- QUANDO `runtime` é `null`
- ENTÃO a meta é "1999 · Ação, Ficção científica", sem separador sobrando
- E com `releaseDate: null` e `genres: []` a meta é "2h 16min"; com tudo ausente o parágrafo não é renderizado

#### Cenário: Sem pôster e sem votos
- QUANDO `posterPath` é `null` e `voteCount` é `0`
- ENTÃO o bloco do pôster mostra o placeholder `bg-surface-200` com o rótulo "Pôster" (`text-text-subtle`, `aria-hidden`)
- E o chip é "Sem nota"

#### Cenário: Duração formatada
- QUANDO `formatRuntime` recebe `136`, `45`, `120`
- ENTÃO devolve "2h 16min", "45min", "2h"
- E para `0`, `null`, `undefined`, `NaN` ou negativo devolve `null`

### Requisito: Sinopse com fallback de idioma
O sistema DEVE mostrar a seção "Sinopse" sempre, com o texto em português quando houver; com aviso
de idioma antes do texto e `lang` no parágrafo quando a sinopse vier em outro idioma; e com a
mensagem "Sinopse não disponível." quando não houver nenhuma.
Placement: `src/components/movie-detail/Overview.tsx` (`{ overview: MovieOverview | null }`,
`overviewNotice`); `src/lib/format/languageName.ts` (`languageName(code)` via `Intl.DisplayNames`
em `pt-BR`); a escolha da sinopse é de `src/lib/tmdb/pickOverview.ts` (`tmdb-client`) e não é
refeita aqui.

#### Cenário: Sinopse em português
- QUANDO `overview` é `{ text, language: "pt" }`
- ENTÃO o parágrafo mostra o texto em `text-text-secondary`, sem aviso e sem atributo `lang`

#### Cenário: Sinopse em outro idioma
- QUANDO `overview` é `{ text, language: "en" }`
- ENTÃO o aviso "Sinopse disponível apenas em inglês." (`text-[13px] text-text-muted`) aparece antes do texto
- E o parágrafo do texto tem `lang="en"`
- E para `language: "ja"` o aviso diz "…apenas em japonês."

#### Cenário: Idioma desconhecido pelo CLDR
- QUANDO `overview.language` é um código que `Intl.DisplayNames` não resolve
- ENTÃO o aviso é "Sinopse disponível apenas em outro idioma."
- E `languageName` devolve `null` sem lançar

#### Cenário: Sinopse ausente
- QUANDO `overview` é `null`
- ENTÃO a seção mantém o `h2` "Sinopse" e mostra "Sinopse não disponível." em `text-text-muted`

### Requisito: Elenco principal
O sistema DEVE renderizar a seção "Elenco principal" com os `CastMember` recebidos (já ordenados por
`order` e limitados a 8 pelo mapeador), cada um como `figure` com foto `w185` ou placeholder e
`figcaption` com nome e personagem, e DEVE omitir a seção inteira quando a lista é vazia.
Placement: `src/components/movie-detail/CastList.tsx` (`{ cast: CastMember[] }`);
`src/components/movie-detail/CastCard.tsx` (`{ member: CastMember }`); imagem via
`src/lib/tmdb/images.ts` (`profileUrl(path)`, `w185`).

#### Cenário: Com elenco
- QUANDO `cast` tem 8 membros
- ENTÃO a seção mostra o `h2` "Elenco principal" e uma lista (`ul role="list"`) com 8 itens
- E cada item é um `figure` com a foto (`alt=""`) e um `figcaption` com o nome (`text-text-primary`) e o personagem (`text-[13px] text-text-muted`)
- E a lista não recorta nem reordena o que recebeu

#### Cenário: Sem foto ou sem personagem
- QUANDO `profilePath` é `null`
- ENTÃO a foto é o placeholder `bg-surface-200` com o rótulo "Foto" (`aria-hidden`)
- E quando `character` é `""`, só o nome é renderizado

#### Cenário: Elenco vazio
- QUANDO `cast` é `[]`
- ENTÃO nada é renderizado (nem o `h2`)

#### Cenário: Duas colunas no mobile
- QUANDO a viewport tem 390 px
- ENTÃO a lista tem 2 colunas e, a partir de `sm`, `auto-fill` com mínimo de 140 px

### Requisito: Trailer apenas quando houver
O sistema DEVE renderizar a seção "Trailer" com um `iframe` de `youtube-nocookie.com` somente quando
`MovieDetail.trailer` não é `null`, e DEVE omitir a seção inteira (inclusive o `h2`) caso contrário.
Placement: `src/components/movie-detail/TrailerEmbed.tsx` (`{ trailer: MovieTrailer | null }`,
`trailerEmbedUrl(key)`); a escolha do vídeo é de `src/lib/tmdb/pickTrailer.ts` (`tmdb-client`).

#### Cenário: Com trailer
- QUANDO `trailer` é `{ key: "abc", name: "Official Trailer" }`
- ENTÃO a seção mostra o `h2` "Trailer" e um `iframe` com `src` `https://www.youtube-nocookie.com/embed/abc`, `title="Trailer: Official Trailer"`, `loading="lazy"` e `allowfullscreen`
- E a caixa tem proporção 16:9, largura máxima de 800 px, borda `border-border-subtle` e fundo `bg-surface-100`

#### Cenário: Sem trailer
- QUANDO `trailer` é `null` (sem vídeo, só Teaser, ou fora do YouTube)
- ENTÃO nada é renderizado e nenhuma requisição ao YouTube acontece

#### Cenário: Chave codificada
- QUANDO `trailerEmbedUrl("a b")` é chamada
- ENTÃO devolve `https://www.youtube-nocookie.com/embed/a%20b`

### Requisito: Voltar à listagem preservando filtros
O sistema DEVE montar o href de "Voltar à listagem" a partir de `?from=` validado pelo parser da
listagem (`parseListingParams` → `buildListingHref`), e DEVE usar `/` quando `from` está ausente,
vazio ou inválido; no not-found a ação vai sempre para `/`.
Placement: `src/lib/listing/backHref.ts` (`backHref(from: string | string[] | undefined): string`);
`src/components/movie-detail/BackLinkLoader.tsx`; `src/components/movie-detail/BackLink.tsx`
(`{ href }`, texto visível "Voltar à listagem", seta `aria-hidden`, `min-h-11`); emissão do `from`
em `src/components/movies/MovieCard.tsx` (`listagem-filmes`, sem mudança).

#### Cenário: Filtros preservados
- QUANDO a listagem está em `/?q=matrix&page=2` e o usuário abre um card
- ENTÃO o detalhe abre em `/movie/<id>?from=q%3Dmatrix%26page%3D2`
- E "Voltar à listagem" leva a `/?q=matrix&page=2`

#### Cenário: Sem from
- QUANDO o detalhe é aberto sem `?from=` (link direto ou a partir de `/favoritos`)
- ENTÃO "Voltar à listagem" leva a `/`

#### Cenário: From normalizado ou inválido
- QUANDO `from` é `page=999`
- ENTÃO o href é `/?page=500`
- E para `sort=foo&genre=abc`, `http://evil.example/x` ou `""` o href é `/`
- E para `q=m&genre=28&sort=rating` o href é `/?q=m` (busca exclusiva, D14)
- E quando o Next entrega `from` como array, o primeiro valor é usado

#### Cenário: Fallback durante o streaming
- QUANDO o buraco do `BackLinkLoader` ainda não chegou
- ENTÃO o link renderizado aponta para `/`
- E é um `<a>` válido, com 44 px de altura e o texto "Voltar à listagem"

### Requisito: Estados de carregamento e layout
O sistema DEVE mostrar o `DetailSkeleton` enquanto o detalhe carrega, com as mesmas caixas de layout
do `MovieHeader`, e DEVE empilhar o detalhe a 390 px sem overflow horizontal.
Placement: `src/components/movie-detail/DetailSkeleton.tsx`; classes de layout em
`src/components/movie-detail/MovieHeader.tsx`.

#### Cenário: Skeleton
- QUANDO `MovieDetails` ainda não resolveu
- ENTÃO um `div[role="status"]` com o texto `sr-only` "Carregando filme" mostra blocos `aria-hidden` em `bg-surface-200`/`bg-surface-100` com `animate-pulse` nas posições do pôster, título, meta, chips, sinopse e elenco
- E a troca pelo conteúdo real não desloca o `BackLink`

#### Cenário: 390 px
- QUANDO a viewport tem 390 px
- ENTÃO o pôster (até 300 px) fica acima da coluna de texto, o `h1` tem 36 px, os chips quebram linha, o elenco tem 2 colunas e o trailer ocupa a largura do container
- E não há overflow horizontal; o gutter é de 16 px

#### Cenário: 1280 px
- QUANDO a viewport tem 1280 px
- ENTÃO o pôster fica à esquerda e a coluna com título (44 px), meta, chips, sinopse, elenco e trailer fica à direita, como em `screens/pdf/detalhe.png`

### Requisito: Acessibilidade do detalhe
O sistema DEVE expor um único `heading` de nível 1, um `heading` de nível 2 por seção, `figure`/
`figcaption` no elenco, `iframe` com `title`, `lang` na sinopse em outro idioma, foco visível e
controles com no mínimo 44 px, sem `aria-label` redundante.
Placement: `src/components/movie-detail/*.tsx`; foco global em `src/app/globals.css` (`setup-catalogo`).

#### Cenário: Árvore de acessibilidade
- QUANDO `/movie/603` é inspecionada na árvore de acessibilidade
- ENTÃO há um `heading` nível 1 (título), até três nível 2 (Sinopse, Elenco principal, Trailer), `figure` nomeadas pelo `figcaption`, um `button` com `pressed` e um `iframe` nomeado "Trailer: …"
- E nenhum elemento tem `aria-label` além do que o `FavoriteButton` já define

#### Cenário: Teclado
- QUANDO o usuário navega por Tab
- ENTÃO a ordem é "Voltar à listagem" → "Adicionar aos favoritos" → iframe do trailer
- E cada foco mostra o anel `outline-focus-ring`; Espaço/Enter no botão alterna o favorito
