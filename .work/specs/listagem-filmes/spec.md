## Requisitos ADICIONADOS

### Requisito: URL como única fonte da listagem
O sistema DEVE representar o estado da listagem apenas na URL de `/` com as chaves `q`, `genre`,
`sort` e `page`, convertendo-as de forma pura e determinística para o `ListingQuery` do domínio e de
volta, omitindo os valores padrão.
Placement: `src/lib/listing/params.ts` (`parseListingParams`, `buildListingSearch`,
`buildListingHref`, `DEFAULT_LISTING_QUERY`, `ListingSearchParams`); consumidores: `MovieResults`
(`await searchParams`), `FilterBar` (`useSearchParams`), `Pagination` (`hrefFor`), `MovieCard` (`from`).

#### Cenário: URL vazia
- QUANDO `parseListingParams` recebe `{}` ou `new URLSearchParams("")`
- ENTÃO devolve `{ query: null, genreId: null, sort: "popularity", page: 1 }`
- E `buildListingHref` desse objeto devolve `/`

#### Cenário: Chaves válidas
- QUANDO a URL é `/?genre=28&sort=rating&page=3`
- ENTÃO `query` é `null`, `genreId` é 28, `sort` é `rating` e `page` é 3
- E `buildListingHref` devolve `/?genre=28&sort=rating&page=3`, nesta ordem de chaves

#### Cenário: Valores inválidos
- QUANDO `genre` é `abc`, `0` ou negativo, `sort` é `foo`, `page` é `abc`, `0`, negativo ou `501`
- ENTÃO `genreId` é `null`, `sort` é `popularity` e `page` é 1 (ou 500 para `501`, via `clampPage`)
- E `page=2.7` vira 2

#### Cenário: Array do Next
- QUANDO o objeto `searchParams` do Next traz `page: ["3", "4"]`
- ENTÃO a primeira ocorrência é usada (`page` é 3)

#### Cenário: Busca exclusiva nos dois sentidos
- QUANDO a URL é `/?q=m&genre=28&sort=rating`
- ENTÃO o resultado tem `query: "m"`, `genreId: null` e `sort: "popularity"` (D14)
- E `buildListingHref({ query: "m", genreId: 28, sort: "rating", page: 1 })` devolve `/?q=m`

#### Cenário: Round-trip
- QUANDO qualquer `x` passa por `parseListingParams(new URLSearchParams(buildListingSearch(x)))`
- ENTÃO o resultado é igual a `parseListingParams(x)`
- E espaços em `q` sobrevivem (`the matrix` → `q=the+matrix` → `"the matrix"`)

### Requisito: Listagem de filmes populares com paginação
O sistema DEVE mostrar em `/` os filmes populares (discover por `popularity.desc`, D13) da página da
URL, com paginação "Anterior · Página X de N · Próxima" por links, desabilitando os limites e tratando
página acima do total sem erro.
Placement: `src/components/movies/MovieResults.tsx` (RSC async; chama `fetchListing` de
`src/lib/tmdb/client.ts`, endpoint `GET /discover/movie`), `src/components/movies/Pagination.tsx` (RSC),
`src/app/page.tsx` (Suspense com `MovieGridSkeleton`).

#### Cenário: Primeira página
- QUANDO o usuário abre `/`
- ENTÃO 20 cards são renderizados com pôster, título e meta
- E "Anterior" é um `span` com `aria-disabled="true"` e "Próxima" é um link para `/?page=2`
- E o texto do meio é "Página 1 de N" com N igual a `totalPages` (no máximo 500)

#### Cenário: Página intermediária
- QUANDO o usuário abre `/?genre=28&page=3`
- ENTÃO "Anterior" leva a `/?genre=28&page=2` e "Próxima" a `/?genre=28&page=4`
- E os demais parâmetros da URL são preservados nos dois links

#### Cenário: Última página e página única
- QUANDO `page` é igual a `totalPages`
- ENTÃO "Próxima" é um `span` com `aria-disabled="true"`
- E quando `totalPages` é 1, os dois lados são `span` desabilitados e o texto é "Página 1 de 1"

#### Cenário: Página acima do total
- QUANDO a URL pede uma página maior que `totalPages` (a API devolve `results: []`)
- ENTÃO o sistema mostra o `EmptyState` "Esta página não existe" com a descrição "A lista tem N páginas." (ou "1 página")
- E a ação "Ir para a última página" leva à mesma URL com `page=<totalPages>`
- E nenhuma segunda requisição nem redirect acontece

#### Cenário: Carregamento
- QUANDO os resultados ainda não chegaram (primeiro load ou navegação direta)
- ENTÃO o fallback é o `MovieGridSkeleton` com 8 cards, `role="status"` e o texto oculto "Carregando filmes"
- E o `h1` e a barra de filtros permanecem visíveis (sem `loading.tsx`)

### Requisito: Busca por título
O sistema DEVE buscar filmes pelo título digitado no campo "Buscar por título", atualizando a URL com
`q` por `router.replace` depois de 350 ms sem digitação (ou imediatamente com Enter), mantendo os
cards antigos com `aria-busy` até os novos chegarem, e DEVE mostrar um estado vazio com "Limpar busca"
quando não houver resultado.
Placement: `src/components/movies/FilterBar.tsx` (client; `SEARCH_DEBOUNCE_MS = 350`),
`src/components/movies/ListingTransition.tsx` (client; `aria-busy` e opacidade na região),
`src/components/movies/MovieResults.tsx` (endpoint `GET /search/movie` via `fetchListing`).

#### Cenário: Debounce
- QUANDO o usuário digita "mat" em menos de 350 ms
- ENTÃO `router.replace` não é chamado antes de 350 ms após a última tecla
- E é chamado uma única vez com `/?q=mat` e `{ scroll: false }`

#### Cenário: Enter aplica na hora
- QUANDO o usuário pressiona Enter no campo
- ENTÃO o debounce pendente é cancelado e `router.replace` é chamado imediatamente
- E a submissão nativa do `form` é prevenida

#### Cenário: Limpar o campo
- QUANDO a URL é `/?q=matrix` e o usuário apaga o texto
- ENTÃO `router.replace("/")` é chamado após o debounce
- E gênero e ordenação voltam a ficar habilitados

#### Cenário: Texto igual ao da URL
- QUANDO o texto trimado é igual ao `q` já presente na URL
- ENTÃO nenhuma navegação é disparada

#### Cenário: Cards antigos durante a troca
- QUANDO a navegação disparada pelo `FilterBar` está pendente
- ENTÃO a região dos resultados tem `aria-busy="true"` e opacidade reduzida, com o status oculto "Atualizando resultados…" fora da região ocupada
- E o skeleton não é exibido (os cards anteriores ficam até os novos chegarem)
- E os selects mostram a opção escolhida antes de a URL mudar

#### Cenário: Busca superada por outra navegação
- QUANDO uma busca já enviada ainda está pendente e o usuário troca o gênero ou a página
- ENTÃO a URL final é a da última ação e o campo de busca fica vazio, acompanhando a URL
- E a mesma busca pode ser enviada de novo

#### Cenário: Gênero escolhido antes de a busca ser enviada
- QUANDO o usuário digita no campo de busca e, antes de 350 ms, escolhe um gênero ou uma ordenação
- ENTÃO o filtro vence: o timer da busca é cancelado, a URL passa a ter `genre` (ou `sort`) e não tem `q`
- E o campo de busca fica vazio
- E nenhuma navegação de busca acontece depois

#### Cenário: Busca enviada sem filtro em seguida
- QUANDO o usuário digita e espera 350 ms sem tocar nos selects
- ENTÃO a URL passa a ter `q`, sem `genre` nem `sort`

#### Cenário: Voltar e avançar
- QUANDO o usuário usa o botão voltar e a URL muda de `/?q=matrix` para `/`
- ENTÃO o campo passa a mostrar vazio e os resultados voltam aos populares
- E as teclas digitadas entre um commit e a chegada da nova URL não são perdidas

#### Cenário: Sem resultado
- QUANDO a busca por "zzzzqqqq" devolve zero filmes
- ENTÃO o `EmptyState` mostra "Nenhum filme encontrado para “zzzzqqqq”"
- E a ação "Limpar busca" leva a `/`

#### Cenário: Contagem em modo busca
- QUANDO a busca devolve resultados
- ENTÃO uma linha "N resultado(s) para “<q>”" aparece acima do grid, com N formatado em pt-BR

### Requisito: Filtro por gênero
O sistema DEVE oferecer o select "Gênero" (padrão "Todos") com os gêneros de `getGenres()` carregados
fora do shell e DEVE filtrar a listagem por `genre=<id>` com `router.push`, zerando a página.
Placement: `src/components/movies/FilterBarLoader.tsx` (RSC async; `await connection()` antes de
`getGenres()`, endpoint `GET /genre/movie/list`), `src/components/movies/FilterBar.tsx` (select
`name="genre"`), `src/app/page.tsx` (Suspense com fallback `<FilterBar genres={[]} disabled />`).

#### Cenário: Gêneros carregados
- QUANDO `FilterBarLoader` renderiza
- ENTÃO `connection()` é aguardado antes de `getGenres()`
- E o select lista "Todos" seguido dos gêneros no idioma de `TMDB_LANGUAGE`

#### Cenário: Fallback enquanto carrega
- QUANDO a barra ainda está no fallback do `Suspense`
- ENTÃO os três controles estão desabilitados e o select de gênero mostra apenas "Carregando gêneros…"
- E o fallback não chama `useSearchParams()` (renderizável no prerender)

#### Cenário: Escolher um gênero
- QUANDO o usuário escolhe "Ação" (id 28) estando em `/?sort=rating&page=3`
- ENTÃO `router.push("/?genre=28&sort=rating")` é chamado (página zerada, ordenação preservada)
- E voltar retorna à URL anterior

#### Cenário: Gênero sem resultado
- QUANDO a URL traz um `genre` que existe na lista do TMDB, mas não tem filmes
- ENTÃO o `EmptyState` mostra "Nenhum filme encontrado" com a ação "Limpar filtros" para `/` (escolha em `resolveEmptyState`, `src/lib/listing/emptyState.ts`)
- E um id que não está na lista não chega a este estado: vira "Todos" (ver "Gênero desconhecido na URL")

### Requisito: Gênero desconhecido na URL
O sistema DEVE tratar um `genre` que não está na lista de gêneros do TMDB como ausência de filtro.
Placement: `resolveGenreId` (`src/lib/listing/resolveGenre.ts`), usado por `MovieResults` (que só
chama `getGenres()` quando a URL traz `genre`) e por `FilterBar` (para que o próximo filtro
escolhido não leve o id desconhecido adiante nos links).

#### Cenário: Id de gênero inexistente
- QUANDO a página é aberta em `/?genre=999999`
- ENTÃO a lista mostra os filmes populares
- E o select "Gênero" mostra "Todos"
- E os links da paginação não levam `genre`

### Requisito: Ordenação por popularidade, nota e data de lançamento
O sistema DEVE oferecer o select "Ordenar por" com exatamente as opções "Popularidade",
"Nota" e "Data de lançamento" (valores `popularity`, `rating`, `release` de `LISTING_SORTS`) e DEVE
aplicar a ordenação pela URL com `router.push`, zerando a página.
Placement: `src/components/movies/FilterBar.tsx` (select `name="sort"`, `SORT_LABELS`); tradução para
`sort_by`, `vote_count.gte` e `primary_release_date.lte` em `src/lib/tmdb/params.ts` (D13, D15, D16).

#### Cenário: Opções e padrão
- QUANDO a barra renderiza sem `sort` na URL
- ENTÃO o select mostra "Popularidade" selecionada e as três opções nessa ordem

#### Cenário: Ordenar por nota
- QUANDO o usuário escolhe "Nota"
- ENTÃO `router.push("/?sort=rating")` é chamado
- E a lista resultante aplica o corte de 200 votos (D15), sem filme de poucos votos no topo

#### Cenário: Ordenar por data de lançamento
- QUANDO o usuário escolhe "Data de lançamento"
- ENTÃO `router.push("/?sort=release")` é chamado
- E o primeiro card não tem data futura (D16, `todayUtc()` calculado na requisição)

#### Cenário: Voltar à popularidade
- QUANDO o usuário escolhe "Popularidade" estando em `/?sort=rating`
- ENTÃO `router.push("/")` é chamado (default omitido)

### Requisito: Busca exclusiva
O sistema DEVE desabilitar gênero e ordenação enquanto `q` estiver preenchido, mostrando o hint
"Gênero e ordenação não se aplicam à busca por título (limitação da API)." e removendo `genre` e
`sort` da URL.
Placement: `src/components/movies/FilterBar.tsx` (modo busca, `aria-describedby`);
`src/lib/listing/params.ts` (normalização D14).

#### Cenário: Entrar em modo busca
- QUANDO a URL passa a ter `q`
- ENTÃO os selects de gênero e ordenação ficam `disabled` com `aria-describedby` apontando para o hint
- E o hint está visível no `form`

#### Cenário: Busca sobre um filtro ativo
- QUANDO o usuário está em `/?genre=28&sort=rating` e digita "matrix"
- ENTÃO a URL vira `/?q=matrix` (sem `genre` nem `sort`)
- E os selects voltam ao padrão ("Todos", "Popularidade") desabilitados

### Requisito: Cards de filme
O sistema DEVE renderizar cada filme como um card com pôster (`next/image` `w342`) ou placeholder,
título, meta "Nota X,X · AAAA" com as variantes sem ano e sem votos, e link para `/movie/{id}` que
carrega os parâmetros da listagem em `?from=` quando houver.
Placement: `src/components/movies/MovieCard.tsx` (shared; `MovieCardData` com oito campos: `posterPath` e
`releaseDate` de origem para o snapshot de favoritos, `posterUrl` e `releaseYear` derivados, mais `id`,
`title`, `voteAverage`, `voteCount`; `toMovieCardData`),
`src/components/movies/MovieGrid.tsx` (shared; `ul role="list"`), `src/lib/format/rating.ts`,
`src/lib/format/releaseYear.ts`, `src/lib/tmdb/images.ts` (`posterUrl`, `POSTER_SIZE.card`).

#### Cenário: Card completo
- QUANDO o filme tem `posterPath`, `voteAverage: 7.2`, `voteCount: 10` e `releaseDate: "1999-03-30"`
- ENTÃO o pôster é `https://image.tmdb.org/t/p/w342<posterPath>` com `sizes` definido
- E a meta é "Nota 7,2 · 1999" e o link do pôster tem `aria-label="Ver detalhes de <título>"`

#### Cenário: Sem pôster, sem data, sem votos
- QUANDO `posterPath` é `null`
- ENTÃO o bloco mostra o rótulo "Pôster" com `aria-hidden` sobre `surface-200`
- E sem `releaseDate` a meta é só "Nota 7,2"; com `voteCount: 0` a meta começa por "Sem nota"

#### Cenário: Link com e sem `from`
- QUANDO a listagem está em `/` (estado padrão)
- ENTÃO o link do card é `/movie/603`
- E quando a listagem está em `/?q=matrix&page=2`, o link é `/movie/603?from=q%3Dmatrix%26page%3D2`

#### Cenário: Posição do botão de favorito
- QUANDO o `FavoriteButton` for ligado pelo change `favoritos`
- ENTÃO ele entra como irmão do `<Link>` do pôster (nunca dentro), posicionado em `top-2.5 right-2.5`
- E o card continua válido sem ele neste change

### Requisito: Erro de API e token ausente
O sistema DEVE capturar qualquer `TmdbError` lançada na listagem em `src/app/error.tsx`, mantendo o
`Header`, mostrando o `EmptyState` "Não foi possível carregar os filmes" com "Tentar novamente", e
DEVE exibir a mensagem real apenas em desenvolvimento.
Placement: `src/app/error.tsx` (client, default export), `src/components/ui/ErrorState.tsx` (client),
`src/components/ui/EmptyState.tsx` (shared).

#### Cenário: Token ausente em desenvolvimento
- QUANDO `TMDB_API_READ_TOKEN` não está definida e o usuário abre `/` com `next dev`
- ENTÃO o `EmptyState` de erro mostra a mensagem que nomeia `TMDB_API_READ_TOKEN`
- E o `Header` continua visível

#### Cenário: Erro em produção
- QUANDO uma `TmdbError` (`unauthorized`, `rate_limited`, `unavailable`) ocorre em produção
- ENTÃO a descrição é "Tente novamente em instantes." (o Next redige a mensagem do servidor, D21)

#### Cenário: Tentar novamente
- QUANDO o usuário clica em "Tentar novamente"
- ENTÃO `router.refresh()` e `reset()` são chamados dentro de `startTransition`
- E a listagem é refeita sem recarregar a página

### Requisito: Shell estático e código válido nos dois modos
O sistema DEVE manter `src/app/page.tsx` sem leitura de `searchParams` e com todo fetch sob
`<Suspense>`, de modo que `npm run build` passe sem token e sem rede com e sem
`CATALOGO_CACHE_COMPONENTS=1`, e `next dev` com a flag não reporte blocking-route.
Placement: `src/app/page.tsx` (dois `<Suspense>`), `src/components/movies/FilterBarLoader.tsx`
(`connection()`), `src/components/movies/MovieResults.tsx` (`await searchParams` e `await connection()`),
`src/components/movies/ListingTransition.tsx` (client estático).

#### Cenário: Build sem a flag
- QUANDO `npm run build` roda sem `.env.local` e sem rede
- ENTÃO o build termina com sucesso e `/` aparece como dinâmica (`ƒ`)
- E nenhuma requisição é feita a `api.themoviedb.org`

#### Cenário: Build com a flag
- QUANDO `CATALOGO_CACHE_COMPONENTS=1 npm run build` roda sem `.env.local`
- ENTÃO o build termina com sucesso, `/` aparece como parcialmente estática (`◐`) e `/favoritos` como estática (`○`)
- E o shell contém o `h1`, a barra desabilitada e o skeleton

#### Cenário: Dev com a flag
- QUANDO `next dev` roda com a flag e o usuário abre `/`, `/?q=matrix` e `/?page=2`
- ENTÃO não há insight nem erro de blocking-route, de `useSearchParams` sem Suspense ou de IO síncrono
- E o shell aparece antes dos dois buracos

### Requisito: Título da listagem reflete a busca
O sistema DEVE mostrar no `h1` da listagem "Resultados da busca" quando há `q` e "Filmes populares" quando não há.
Placement: `src/components/movies/ListingTitle.tsx` (RSC async que lê `searchParams`, sob `<Suspense>`
em `src/app/page.tsx`; o fallback é "Filmes populares").

#### Cenário: Busca ativa
- QUANDO a página é aberta em `/?q=matrix`
- ENTÃO o `h1` é "Resultados da busca"

### Requisito: Paginação indica carregamento
O sistema DEVE indicar, no link de paginação clicado, que a página seguinte está carregando, até ela chegar.
Placement: `src/components/movies/PaginationPending.tsx` (client; `useLinkStatus`; ponto fora do
fluxo, posicionado na folga do `px-5` do link, para não mudar a largura do botão).

#### Cenário: Clique em "Próxima"
- QUANDO o usuário clica em "Próxima" e a resposta ainda não chegou
- ENTÃO o link mostra um indicador de carregamento
- E um texto equivalente fica disponível para leitor de tela

### Requisito: Responsividade e acessibilidade da listagem
O sistema DEVE renderizar a listagem a 390 px com grid de duas colunas e sem overflow horizontal, e
DEVE usar elementos nativos com os atributos ARIA decididos.
Placement: `src/components/movies/MovieGrid.tsx` (`grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]`),
`src/components/movies/FilterBar.tsx` (`form role="search"`, `label` envolvendo controles),
`src/components/movies/Pagination.tsx` (`nav aria-label="Paginação"`).

#### Cenário: 390 px
- QUANDO a viewport tem 390 px
- ENTÃO o grid tem 2 colunas, o `form` quebra linha, a paginação quebra linha
- E não há rolagem horizontal; todos os controles têm pelo menos 44 px de altura

#### Cenário: Teclado
- QUANDO o usuário navega por Tab
- ENTÃO a ordem é campo de busca, gênero, ordenação, links dos cards, paginação
- E cada elemento focado mostra o anel `focus-ring`

#### Cenário: Semântica
- QUANDO a página é lida por tecnologia assistiva
- ENTÃO o grid é uma lista (`ul role="list"`), o skeleton e o status de atualização são `role="status"`, o link do pôster tem nome "Ver detalhes de <título>" e os selects desabilitados em modo busca são descritos pelo hint
