## Requisitos ADICIONADOS

### Requisito: Porta única e restrita ao servidor
O sistema DEVE concentrar todo acesso ao TMDB em `src/lib/tmdb/client.ts`, que começa com
`import "server-only"`, lê `TMDB_API_READ_TOKEN` e `TMDB_LANGUAGE` apenas no momento da chamada e
envia o token no header `Authorization: Bearer`, nunca na URL. Os demais módulos do domínio
(`types.ts`, `errors.ts`, `params.ts`, `images.ts`, `pickOverview.ts`, `pickTrailer.ts`,
`mappers.ts`) DEVEM ser puros e importáveis de qualquer lado.
Placement: `src/lib/tmdb/client.ts` (único com `server-only` e `process.env`); endpoints usados:
`GET /genre/movie/list`, `GET /discover/movie`, `GET /search/movie`, `GET /movie/{id}` com
`append_to_response=credits,videos,translations` (e, só no fallback de D19, `GET /movie/{id}/videos`).

#### Cenário: Token ausente
- QUANDO `getGenres()`, `fetchListing()` ou `getMovieDetail()` é chamada sem `TMDB_API_READ_TOKEN` definida (ou vazia)
- ENTÃO lança `TmdbError` com `kind: "config"`
- E a mensagem nomeia `TMDB_API_READ_TOKEN` e `.env.local`
- E nenhuma requisição é feita

#### Cenário: Token no header
- QUANDO qualquer função pública faz uma requisição
- ENTÃO o header `Authorization` é `Bearer <token>` e `Accept` é `application/json`
- E a URL não contém `api_key` nem o token

#### Cenário: Idioma por variável de ambiente
- QUANDO `TMDB_LANGUAGE` está definida
- ENTÃO toda requisição leva `language=<valor>` como primeiro parâmetro da query string
- E sem a variável o valor é `pt-BR`

#### Cenário: Importação de um componente client
- QUANDO um módulo com `"use client"` importa `@/lib/tmdb/client`
- ENTÃO o build falha (`server-only`)
- E importar `@/lib/tmdb/images` ou `@/lib/tmdb/params` do mesmo módulo funciona

### Requisito: Cache por fetch com revalidação
O sistema DEVE cachear cada requisição somente com `fetch(url, { cache: "force-cache", next: { revalidate } })`:
86 400 s para gêneros e 3 600 s para listagens e detalhe, sem `'use cache'`, `cacheLife` ou cache
em memória.
Placement: `src/lib/tmdb/client.ts` (`REVALIDATE_GENRES`, `REVALIDATE_LISTING`, `REVALIDATE_DETAIL`).

#### Cenário: Gêneros
- QUANDO `getGenres()` chama `/genre/movie/list`
- ENTÃO a requisição usa `cache: "force-cache"` e `next: { revalidate: 86400 }`

#### Cenário: Listagem e detalhe
- QUANDO `fetchListing()` ou `getMovieDetail()` faz uma requisição
- ENTÃO a requisição usa `cache: "force-cache"` e `next: { revalidate: 3600 }`

#### Cenário: Mesma URL no mesmo render
- QUANDO `getMovieDetail(603)` é chamada em `generateMetadata` e no componente da mesma requisição
- ENTÃO apenas uma chamada HTTP acontece (memoização de requisição do Next para a mesma URL e opções)

### Requisito: Erros classificados
O sistema DEVE converter toda falha em `TmdbError` com `kind` em
`config | unauthorized | not_found | rate_limited | unavailable`, mantendo `status` (quando houver)
e `cause` (quando houver).
Placement: `src/lib/tmdb/errors.ts` (`TmdbError`, `errorKindFromStatus`); uso em `src/lib/tmdb/client.ts`.

#### Cenário: Mapeamento de status HTTP
- QUANDO a resposta tem status 401 ou 403
- ENTÃO `kind` é `unauthorized`
- E 404 → `not_found`, 429 → `rate_limited`, qualquer outro status não-2xx (inclusive 400, 422 e 5xx) → `unavailable`

#### Cenário: Falha de rede ou JSON inválido
- QUANDO o `fetch` lança `TypeError` ou o corpo não é JSON
- ENTÃO `kind` é `unavailable`
- E `cause` guarda o erro original

#### Cenário: Detalhe inexistente
- QUANDO `getMovieDetail(id)` recebe 404
- ENTÃO devolve `null` (sem lançar)
- E para qualquer outro `kind` a `TmdbError` é relançada

### Requisito: Parâmetros da listagem
O sistema DEVE montar os parâmetros de `/discover/movie` e `/search/movie` a partir de um
`ListingQuery` de forma pura e determinística, aplicando D13–D17.
Placement: `src/lib/tmdb/params.ts` (`buildDiscoverParams`, `buildSearchParams`,
`buildListingRequest`, `clampPage`, `todayUtc`, `LISTING_SORTS`, `DEFAULT_SORT`, `SORT_BY`,
`RATING_MIN_VOTE_COUNT`, `MAX_PAGE`); chamada em `fetchListing` de `client.ts`.

#### Cenário: Populares
- QUANDO `query` é `null` (ou só espaços), `genreId` é `null`, `sort` é `popularity` e `page` é 1
- ENTÃO o caminho é `/discover/movie`
- E os parâmetros são exatamente `include_adult=false`, `sort_by=popularity.desc`, `page=1`

#### Cenário: Filtro por gênero
- QUANDO `genreId` é 28
- ENTÃO `with_genres=28` é acrescentado ao discover

#### Cenário: Ordenação por nota
- QUANDO `sort` é `rating`
- ENTÃO `sort_by=vote_average.desc` e `vote_count.gte=200`
- E `vote_count.gte` não aparece nas outras ordenações

#### Cenário: Ordenação por data de lançamento
- QUANDO `sort` é `release` e `today` é `"2026-10-07"`
- ENTÃO `sort_by=primary_release_date.desc` e `primary_release_date.lte=2026-10-07`
- E `primary_release_date.lte` não aparece nas outras ordenações
- E `todayUtc()` devolve a data UTC em `YYYY-MM-DD`, calculada na requisição (nunca no módulo)

#### Cenário: Busca por título
- QUANDO `query` é `"matrix"` (após `trim`), mesmo com `genreId` e `sort` preenchidos
- ENTÃO o caminho é `/search/movie`
- E os parâmetros são exatamente `include_adult=false`, `query=matrix`, `page=<n>`
- E nenhum `with_genres`, `sort_by`, `vote_count.gte` ou `primary_release_date.lte` é enviado (D14)

#### Cenário: Página fora dos limites
- QUANDO `page` é 0, negativo, `NaN` ou não finito
- ENTÃO `clampPage` devolve 1
- E para 501 ou mais devolve 500
- E decimais são truncados (2.7 → 2)

### Requisito: Mapeamento DTO → domínio
O sistema DEVE converter as respostas da API nos tipos de domínio `Genre`, `MovieSummary`,
`ListingResult`, `CastMember` e `MovieDetail`, de forma pura, e os componentes DEVEM receber
apenas esses tipos.
Placement: `src/lib/tmdb/mappers.ts` (`toGenres`, `toMovieSummary`, `toListingResult`,
`toCastMember`, `toMovieDetail`, `MAIN_CAST_LIMIT`); tipos em `src/lib/tmdb/types.ts`.

#### Cenário: Item de lista
- QUANDO um item do discover tem `poster_path: null`, `release_date: ""` e `vote_count: 0`
- ENTÃO o `MovieSummary` tem `posterPath: null`, `releaseDate: null` e `voteCount: 0`
- E `id`, `title`, `voteAverage` são copiados

#### Cenário: Total de páginas limitado
- QUANDO `total_pages` é 51 234
- ENTÃO `totalPages` é 500
- E quando `total_pages` é 0, `totalPages` é 1

#### Cenário: Elenco principal
- QUANDO `credits.cast` tem 10 pessoas com `order` embaralhado
- ENTÃO `cast` tem 8 `CastMember` em `order` crescente (0 a 7)
- E com `credits` ausente, `cast` é `[]`

#### Cenário: Campos do detalhe
- QUANDO o detalhe tem `runtime: 136`, `release_date: "1999-03-30"` e dois gêneros
- ENTÃO `runtime` é 136, `releaseDate` é `"1999-03-30"` e `genres` tem dois `Genre`
- E `runtime` 0 ou `null` vira `null`
- E `overview` e `trailer` vêm de `pickOverview` e `pickTrailer`

#### Cenário: Base do snapshot de favoritos
- QUANDO um `MovieSummary` ou um `MovieDetail` é produzido
- ENTÃO ambos expõem `id`, `title`, `posterPath`, `voteAverage`, `voteCount` e `releaseDate` com os mesmos tipos
- E o `FavoriteButton` pode receber qualquer um dos dois sem adaptador

### Requisito: Sinopse com fallback de idioma
O sistema DEVE escolher a sinopse na ordem pt-BR → inglês → idioma original → qualquer tradução
não vazia → nenhuma, devolvendo `{ text, language }` com `language` em ISO 639-1, ou `null`.
Placement: `src/lib/tmdb/pickOverview.ts` (`pickOverview(detail, requestedLanguage)`); chamada em
`toMovieDetail`; o aviso de idioma é montado pelo `Overview` no `detalhe-filme`.

#### Cenário: Sinopse em português
- QUANDO `overview` da resposta em `pt-BR` é não vazia
- ENTÃO o resultado é `{ text: <overview>, language: "pt" }`

#### Cenário: Só em inglês
- QUANDO `overview` é vazia e `translations` tem `en-US` com `data.overview` não vazia
- ENTÃO o resultado é `{ text: <overview en-US>, language: "en" }`
- E havendo `en-GB` e `en-US`, `en-US` é preferida

#### Cenário: Idioma original
- QUANDO `overview` é vazia, não há tradução `en` e há tradução no `original_language` (ex.: `ja`)
- ENTÃO o resultado usa essa tradução com `language: "ja"`

#### Cenário: Qualquer tradução
- QUANDO não há pt, nem en, nem o idioma original com texto
- ENTÃO a primeira tradução não vazia, na ordem do array, é usada com seu `iso_639_1`

#### Cenário: Nenhuma sinopse
- QUANDO `overview` é vazia ou só espaços e nenhuma tradução tem texto (ou `translations` está ausente)
- ENTÃO o resultado é `null`

### Requisito: Trailer apenas quando houver
O sistema DEVE escolher um único trailer do YouTube entre `videos.results`, priorizando
`official`, depois idioma `pt` > `en` > outros, depois `published_at` mais recente, ou devolver
`null` quando não houver `Trailer` no YouTube.
Placement: `src/lib/tmdb/pickTrailer.ts` (`pickTrailer(videos)`); chamada em `toMovieDetail`;
`TrailerEmbed` omite a seção com `null`.

#### Cenário: Sem trailer
- QUANDO `videos` é `undefined`, `[]` ou só contém `Teaser`, `Clip` ou vídeos fora do YouTube
- ENTÃO o resultado é `null`

#### Cenário: Oficial primeiro
- QUANDO há um `Trailer` oficial `en` e um `Trailer` não oficial `pt`
- ENTÃO o oficial `en` é escolhido

#### Cenário: Português entre oficiais
- QUANDO há dois `Trailer` oficiais, um `pt` e um `en`
- ENTÃO o `pt` é escolhido

#### Cenário: Mais recente como desempate
- QUANDO há dois `Trailer` oficiais `en` com `published_at` diferentes
- ENTÃO o mais recente é escolhido
- E o resultado é exatamente `{ key, name }`

### Requisito: URLs de imagem
O sistema DEVE montar URLs de pôster e de foto de elenco em `image.tmdb.org/t/p/<tamanho><path>`,
com `w342` para o card, `w500` para o detalhe e `w185` para o elenco, devolvendo `null` sem caminho.
Placement: `src/lib/tmdb/images.ts` (`posterUrl`, `profileUrl`, `POSTER_SIZE`, `PROFILE_SIZE`,
`TMDB_IMAGE_BASE`); domínio liberado em `next.config.ts > images.remotePatterns` (`setup-catalogo`).

#### Cenário: Com caminho
- QUANDO `posterUrl("/abc.jpg", POSTER_SIZE.card)` é chamada
- ENTÃO devolve `https://image.tmdb.org/t/p/w342/abc.jpg`
- E `POSTER_SIZE.detail` produz `/w500/` e `profileUrl("/p.jpg")` produz `/w185/`

#### Cenário: Sem caminho
- QUANDO o caminho é `null`, `undefined` ou `""`
- ENTÃO devolve `null`
- E a UI mostra o placeholder `bg-surface-200`

### Requisito: Verificação das pendências com a API real
O sistema DEVE fornecer `scripts/tmdb-probe.mjs` que, com `.env.local`, faz as chamadas reais das
três pendências de `.work/design/decisoes.md` e imprime um resumo sem expor o token; o resultado
DEVE ficar registrado em `design.md` (decisão 13) e em `decisoes.md` (D17, D18, D19).
Placement: `scripts/tmdb-probe.mjs`; registro em `.work/changes/tmdb-client/design.md` e
`.work/design/decisoes.md`; fallbacks (se necessários) em `getMovieDetail` de `src/lib/tmdb/client.ts`.

#### Cenário: Sonda com token
- QUANDO `node --env-file=.env.local scripts/tmdb-probe.mjs` roda com token válido
- ENTÃO imprime três blocos: detalhe de `603` com `append_to_response` (status, `overview`, translations, vídeos com idioma e país), a mesma chamada sem `include_video_language` (diferença de vídeos) e `/discover/movie?page=501` (status e `status_message`)
- E sai com código 0 sem imprimir o token

#### Cenário: Sonda sem token
- QUANDO a sonda roda sem `TMDB_API_READ_TOKEN`
- ENTÃO sai com código 1 e a mensagem nomeia a variável

#### Cenário: Translations confirmadas
- QUANDO a resposta de `/movie/603?append_to_response=credits,videos,translations` traz `translations.translations`
- ENTÃO `getMovieDetail` continua com uma única chamada
- E a tabela da decisão 13 e D18 registram "confirmado" com a data

#### Cenário: Translations não anexadas (fallback)
- QUANDO a resposta não traz `translations`
- ENTÃO `getMovieDetail` faz uma segunda chamada `/movie/{id}` com `language=en-US` apenas quando `overview` vem vazia
- E injeta o resultado como tradução `en-US` antes de `pickOverview`

#### Cenário: Vídeos em inglês com language=pt-BR
- QUANDO a chamada com `include_video_language=pt-BR,pt,en,null` devolve vídeos `en` junto com os pt-BR e os pt-PT
- ENTÃO `getMovieDetail` continua com uma única chamada e D19 registra o observado
- E o valor do parâmetro é `pt-BR,pt,en,null`, não `pt,en,null`: verificado em 2026-10-07 que `pt` sozinho casa só com pt-PT e deixa os vídeos pt-BR de fora

#### Cenário: Vídeos ausentes (fallback)
- QUANDO `videos.results` vem vazio para `pt-BR` e o parâmetro não tem efeito
- ENTÃO `getMovieDetail` faz uma segunda chamada `/movie/{id}/videos` com `language=en-US` e usa esses resultados em `pickTrailer`

#### Cenário: Página 501
- QUANDO `/discover/movie?page=501` responde
- ENTÃO o status e o `status_message` são registrados em D17 (observado em 2026-10-07: HTTP 400, "Invalid page: Pages start at 1 and max at 500"; o esperado era 422)
- E nada muda no código: `clampPage` já limita a 500
