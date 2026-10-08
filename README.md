# Catálogo.

Catálogo de filmes sobre a API pública do TMDB, feito para o teste técnico de Desenvolvedor Frontend da UpFlow (enunciado em [`DESAFIO.md`](DESAFIO.md)).

## Rotas e requisitos

| Rota | Requisito do enunciado | O que a tela faz |
| --- | --- | --- |
| `/` | Listagem de populares com paginação | 20 filmes por página, com "Anterior", "Próxima" e "Página X de N". |
| `/` | Busca por título | Campo que atualiza a URL (`?q=`) enquanto se digita. |
| `/` | Filtro por gênero | Select com os gêneros do TMDB (`?genre=`). |
| `/` | Ordenação | Popularidade, nota e data de lançamento (`?sort=`). |
| `/movie/[id]` | Detalhe do filme | Sinopse com fallback de idioma, nota, elenco principal (até 8 pessoas) e trailer quando há. |
| `/favoritos` | Favoritos persistidos no client | Lista dos filmes salvos neste navegador. O coração de cada card, o botão do detalhe e a contagem no header fazem parte do mesmo requisito. |

## Como rodar

Pré-requisitos: Git, Node.js 22.22.2 ou superior da linha 22 (o `.nvmrc` fixa o 22; o `engines` aceita `^22.22.2 || ^24.15.0 || >=26.0.0`, o intervalo que o Vitest 5 e o jsdom 30 exigem) e npm.

```bash
git clone https://github.com/jeffersonlucindo/teste-upflow.git
cd teste-upflow
npm ci
cp .env.example .env.local          # bash, zsh, Git Bash
```

No PowerShell, a cópia é `Copy-Item .env.example .env.local`.

Em `.env.local`, preencha `TMDB_API_READ_TOKEN` com o **API Read Access Token (v4)** da sua conta em <https://www.themoviedb.org/settings/api>. Depois:

```bash
npm run dev
```

Abra <http://localhost:3000>.

**Sem token.** Em desenvolvimento, `/` e `/movie/<id>` mostram a tela de erro com a mensagem "Defina TMDB_API_READ_TOKEN em .env.local (API Read Access Token v4 do TMDB)."; em produção o texto é genérico ("Tente novamente em instantes."). `/favoritos` funciona sem token, e `npm run build` e `npm run check` passam sem `.env.local` e sem rede.

Para conferir o token sem subir a aplicação:

```bash
node --env-file=.env.local scripts/tmdb-probe.mjs        # ou: ... tmdb-probe.mjs <id do filme>
```

A sonda faz três chamadas reais (detalhe do filme 603 com elenco, vídeos e traduções; a mesma chamada sem o filtro de idioma dos vídeos; a página 501 do discover) e imprime um resumo de cada uma. Sai com código 1 se o token faltar ou for recusado e nunca imprime o token.

### Segurança do token

- O token vai no header `Authorization: Bearer`, nunca na URL: uma `api_key` na query string apareceria em logs de acesso e de erro.
- Só `src/lib/tmdb/client.ts` lê `TMDB_API_READ_TOKEN`, e lê a cada chamada, não no carregamento do módulo. Por isso o build passa sem `.env.local`.
- `client.ts` começa com `import "server-only"`: se um componente client importar o cliente, o build falha em vez de levar o token para o bundle do browser.
- A variável nunca usa o prefixo `NEXT_PUBLIC_`, e `.env.local` está no `.gitignore`. Só o `.env.example`, sem valor, é versionado.
- Não há route handler servindo de proxy: os Server Components chamam o TMDB direto, então nenhum endpoint do app expõe a API com o token do servidor.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack). |
| `npm run build` | Build de produção. Passa sem `.env.local` e sem rede. |
| `npm run start` | Serve o build de produção. |
| `npm run lint` | ESLint (flat config, `eslint-config-next`). O `next build` do Next 16 não roda lint. |
| `npm run typecheck` | `next typegen` (tipos de rota) e `tsc --noEmit`. |
| `npm run test` | Vitest em execução única (`vitest run`). |
| `npm run test:watch` | Vitest em modo watch. |
| `npm run tokens:check` | Confere `tokens.json` contra o `@theme` e proíbe cor literal em `src/`. |
| `npm run check` | `tokens:check`, `lint`, `typecheck` e `test` em sequência. |
| `npm run e2e` | Playwright: faz o build, sobe o servidor na porta 3100 e roda os testes de ponta a ponta e de layout em 1280 e 390 px. Na primeira vez, rode `npx playwright install chromium`. |

A sonda do TMDB (`node --env-file=.env.local scripts/tmdb-probe.mjs [id]`) não é um script npm, porque precisa do `.env.local`.

## Flags

| Variável | Valores | Efeito |
| --- | --- | --- |
| `CATALOGO_CACHE_COMPONENTS` | `1` ou `true` (sem distinguir maiúsculas) | Liga `cacheComponents` e `partialPrefetching` juntos no `next.config.ts`. Qualquer outro valor, ou a ausência da variável, mantém os dois desligados. |

Desligado é o padrão: o comportamento é o mais previsível e o build não depende de nada externo. O código é escrito para valer nos dois modos, por isso não usa `"use cache"` nem `cacheLife`. Para testar o modo ligado:

```bash
CATALOGO_CACHE_COMPONENTS=1 npm run build     # bash
CATALOGO_CACHE_COMPONENTS=1 npm run dev
```

```powershell
$env:CATALOGO_CACHE_COMPONENTS="1"; npm run build
```

A variável também pode ir no `.env.local`, que é carregado antes de o `next.config.ts` ser avaliado.

O que muda no resumo do `npm run build`:

| Rota | Flag desligada | Flag ligada |
| --- | --- | --- |
| `/` | `ƒ` (dinâmica) | `◐` (shell estático com conteúdo transmitido) |
| `/movie/[id]` | `ƒ` | `◐` |
| `/favoritos` | `○` (estática) | `○` |

Nenhum dos dois modos chama o TMDB durante o build: toda leitura de `params` e `searchParams` e todo `fetch` ficam sob `<Suspense>`, os componentes que buscam chamam `await connection()` antes, e não há `generateStaticParams`. Id de filme inválido responde 404 nos dois modos, e o filme que o TMDB não conhece responde 200 com a tela "Filme não encontrado" (ver "UI e Design System").

## Estrutura

```
src/
├── app/                      rotas, layouts e arquivos de rota (Server Components)
│   ├── fonts/                .woff2 self-hosted e licenças OFL
│   ├── fonts.ts              next/font/local: heading e body
│   ├── globals.css           @theme com os tokens de cor e estilos base
│   ├── layout.tsx            html pt-BR, skip-link, Header e container
│   ├── page.tsx              /            (listagem: título e dois <Suspense>)
│   ├── error.tsx             erro do segmento, com "Tentar novamente"
│   ├── not-found.tsx         "Página não encontrada" (rota sem correspondência e id inválido)
│   ├── favoritos/page.tsx    /favoritos   (estática; a lista vem do navegador)
│   └── movie/[id]/           /movie/[id]  (detalhe: page, not-found e error do segmento)
├── proxy.ts                  404 real para /movie/<id> inválido
├── components/
│   ├── layout/               Header, NavLink
│   ├── ui/                   Button, ButtonLink, EmptyState, ErrorState
│   ├── movies/               FilterBar, FilterBarLoader, ListingTitle, MovieResults, MovieGrid,
│   │                         MovieCard, MovieGridSkeleton, Pagination, PaginationPending,
│   │                         ListingTransition
│   ├── favorites/            FavoriteButton, FavoritesBadge, FavoritesList (ilhas client)
│   └── movie-detail/         BackLink, BackLinkLoader, MovieDetails, MovieHeader, RatingChip,
│                             Overview, CastList, CastCard, TrailerEmbed, DetailSkeleton
└── lib/
    ├── tmdb/                 única porta para a API do TMDB
    │   ├── client.ts         server-only: getGenres, fetchListing, getMovieDetail
    │   ├── types.ts          tipos de domínio e formato cru da API (sufixo Dto)
    │   ├── errors.ts         TmdbError com kind
    │   ├── params.ts         parâmetros de /discover/movie e /search/movie
    │   ├── mappers.ts        resposta da API → tipos de domínio
    │   ├── pickOverview.ts   sinopse com fallback de idioma
    │   ├── pickTrailer.ts    escolha do trailer
    │   ├── images.ts         URLs de pôster e de foto do elenco (só caminho no formato do TMDB)
    │   ├── parseMovieId.ts   id da rota de detalhe (só inteiro positivo)
    │   └── fixtures/         respostas de exemplo usadas nos testes
    ├── listing/
    │   ├── params.ts         URL da listagem ↔ estado (q, genre, sort, page)
    │   ├── resolveGenre.ts   gênero desconhecido vira "Todos"
    │   ├── emptyState.ts     qual estado vazio a listagem mostra
    │   └── backHref.ts       href de "Voltar à listagem" a partir do ?from= do detalhe
    ├── favorites/
    │   ├── store.ts          formato, validação e store sobre o localStorage
    │   └── useFavorites.ts   hook com useSyncExternalStore
    └── format/               nota ("7,2"), ano, duração ("2h 16min"), nome do idioma e a linha
                              "Ano · Duração · Gêneros"
e2e/                          testes de ponta a ponta e de layout (Playwright)
├── support/                  gates de layout, tokens e pré-requisito do TMDB
└── *.spec.ts                 um arquivo por fluxo
playwright.config.ts          build de produção, projetos desktop (1280 px) e mobile (390 px)
scripts/check-tokens.mjs      guardrail do Design System
scripts/tmdb-probe.mjs        confere o token e o comportamento real da API
```

Os testes unitários ficam ao lado do arquivo testado (`NavLink.test.tsx`, `params.test.ts`). Não há pasta `utils/` ou `helpers/` genérica, nem `index.ts` em `lib/tmdb/`: cada import aponta o módulo exato (`@/lib/tmdb/client`, `@/lib/tmdb/images`), o que deixa visível quem depende do lado servidor.

### Fronteira server × client

Tudo é Server Component, exceto dez arquivos com `"use client"`, cada um com um motivo:

| Arquivo | Por que é client |
| --- | --- |
| `components/layout/NavLink.tsx` | Lê o pathname para marcar o link ativo. |
| `components/movies/FilterBar.tsx` | Lê e escreve a URL (busca com debounce, selects). |
| `components/movies/ListingTransition.tsx` | Compartilha o estado da transição entre a barra e os resultados. |
| `components/movies/PaginationPending.tsx` | `useLinkStatus` só existe no client; mostra que o link da paginação clicado está carregando. Fica dentro de cada link, e `Pagination` continua Server Component. |
| `components/favorites/FavoriteButton.tsx`, `FavoritesBadge.tsx`, `FavoritesList.tsx` | Leem e gravam o `localStorage`. |
| `components/ui/ErrorState.tsx`, `app/error.tsx`, `app/movie/[id]/error.tsx` | Fronteiras de erro, que o React exige no client. |

`src/lib/tmdb/client.ts` é o único módulo com `import "server-only"` e o único que lê o token. `MovieCard` não tem diretiva: é renderizado no servidor pela listagem e no client pela lista de favoritos.

## Decisões técnicas e trade-offs

Cada parágrafo traz a decisão, a alternativa considerada e o que se perde com a escolha.

**Em resumo**

- **Busca exclusiva.** Com texto na busca, gênero e ordenação não se aplicam: o `/search/movie` não filtra nem ordena.
- **Uma porta para o TMDB, no servidor.** Só `src/lib/tmdb/client.ts` fala com a API e lê o token; os componentes recebem tipos de domínio.
- **A URL é o estado da listagem.** `q`, `genre`, `sort` e `page` ficam na URL; link compartilhado, recarregar e voltar funcionam sem código extra.
- **Favoritos em `localStorage`, com `useSyncExternalStore`.** Um store próprio guarda um resumo de cada filme; `/favoritos` não chama a API.
- **Código válido com e sem `cacheComponents`.** Só `fetch` com cache, nada de `"use cache"`; a flag `CATALOGO_CACHE_COMPONENTS` liga o modo novo sem fork.

### Trade-off principal: busca exclusiva

**Com a busca preenchida, gênero e ordenação não se aplicam.** O endpoint `/search/movie` só aceita `query`, `page`, `language`, `region`, `year`, `primary_release_year` e `include_adult`: não filtra por gênero nem ordena. Por isso, com texto na busca, os dois selects ficam desabilitados, descritos pelo aviso "Gênero e ordenação não se aplicam à busca por título (limitação da API)." e saem da URL (`/?q=m&genre=28` vira busca pura). Filtrar e ordenar localmente os 20 itens da página deixaria páginas quase vazias com "Próxima" ativa e reordenaria por nota um conjunto que veio por relevância. Buscar algumas páginas, filtrar e paginar no client seria o melhor produto e ficou de fora por prazo.

**"Populares" é o `/discover/movie` ordenado por popularidade.** A listagem usa sempre o discover, com `sort_by=popularity.desc` e `include_adult=false`, em vez de `/movie/popular` sem filtros e discover com filtros. Um caminho só, e gênero e ordenação compõem sobre ele. A ordem difere um pouco da lista oficial de populares.

### Stack e scaffold

**Next.js 16.4, App Router, React 19.3 e TypeScript strict.** É a versão estável atual do npm; a alternativa era a 15.5. O preço são convenções novas: `params` e `searchParams` são `Promise`, `proxy` substitui `middleware`, o `next build` não roda lint e o Turbopack é o bundler padrão. A documentação consultada é a da versão instalada, em `node_modules/next/dist/docs/`.

**`cacheComponents` desligado por padrão, com toggle.** `CATALOGO_CACHE_COMPONENTS` liga `cacheComponents` e `partialPrefetching` juntos, porque o segundo sem o primeiro falha a validação do config e o primeiro sem o segundo gera warning. O padrão desligado dá previsibilidade e build offline; o toggle demonstra shell estático e prefetch parcial sem fork de código. O custo é escrever na interseção dos dois modelos, sem `"use cache"` nem `cacheLife`. Detalhes em "Flags".

**Scaffold com `create-next-app@16.4.0` em diretório temporário.** A CLI recusa uma pasta que já tenha outros arquivos, então o projeto foi gerado fora e movido para a raiz. Isso dá lockfile novo e nada herdado, ao custo de um passo manual. Nenhum código foi copiado do protótipo de referência.

**npm com `package-lock.json` versionado.** `engines.node` em `^22.22.2 || ^24.15.0 || >=26.0.0`, a interseção do que o Vitest 5 e o jsdom 30 exigem (o Next e o Vite aceitam menos), `.nvmrc` com 22 e `npm ci` nas instruções. Só a aplicação em produção (`next start`) rodaria no Node 20.9; o `npm run check` não. O pnpm é mais rápido, mas exigiria corepack de quem avalia.

**Tailwind CSS v4 via PostCSS.** Usa `@tailwindcss/postcss` em `postcss.config.mjs`, o caminho documentado e que também funciona com `--webpack`. A CLI 16.4 gera por padrão o loader `@tailwindcss/turbopack` em `turbopack.rules`; ele foi trocado pelo PostCSS, abrindo mão de um dev ligeiramente mais rápido. Uma diretiva `@source not` em `globals.css` impede o Tailwind de varrer arquivos de documentação fora de `src/`.

**`src/` organizado por domínio.** `app/` para rotas, `components/<domínio>/` e `lib/<domínio>/`, com o teste ao lado do arquivo. Fica claro quem é dono de cada arquivo; o custo é um nível a mais de pasta.

**Vitest 5 com Testing Library (jsdom).** `npm run test` é execução única, sem watch. Funções puras e componentes client ou shared têm teste unitário. Server Components assíncronos não são testáveis no Vitest, então ficam para os testes de ponta a ponta. O inventário está em "Testes".

**Playwright para ponta a ponta e layout.** `npm run e2e` roda contra o build de produção, em 1280 e 390 px, e cobre o que o Vitest não alcança: Server Components assíncronos, navegação e o layout renderizado. Os testes chegam a cada tela como o usuário chega (pelo header, pelo card, pela busca) e usam dados reais do TMDB, com asserções sobre estrutura e comportamento, não sobre um título específico. Em cada tela, `e2e/support/layout.ts` confere que toda cor computada é um token de `tokens.json`, que não há rolagem horizontal, que os controles têm 44 px de altura, que as fontes são as declaradas e que o foco por teclado mostra o anel. É a versão em runtime do `tokens:check`, que só vê o código-fonte. O custo é uma devDependency, o download do Chromium e alguns segundos de build por execução; como as telas com dados precisam de token e de rede, o `e2e` fica fora do `check`, e sem token esses testes aparecem como pulados, não como aprovados. Comparação de screenshot por diff de pixel foi descartada: os dados do TMDB mudam a cada dia.

**`scripts/check-tokens.mjs`.** Script próprio, sem dependências, que confere `tokens.json` contra o `@theme` e falha se houver cor literal em `src/`. É um guardrail barato e visível para o Design System; custa manter o script. A alternativa era stylelint ou nenhuma verificação.

**`.gitattributes` com `* text=auto eol=lf`.** Evita diff de CRLF entre Windows e Linux. O `AGENTS.md` que o `next dev` gera é commitado para a árvore não ficar suja a cada execução.

**Fontes self-hosted via `next/font/local`.** Plus Jakarta Sans (variável, títulos) e IBM Plex Sans 400, 500 e 600 (corpo) estão em `src/app/fonts/` com as licenças OFL-1.1. Os arquivos foram extraídos uma vez dos pacotes `@fontsource-variable/plus-jakarta-sans` e `@fontsource/ibm-plex-sans` com `npm pack`, e os pacotes não são dependência. O `next/font/google` foi descartado porque baixa CSS e fontes durante o build, o que quebraria o build sem rede. O custo são cerca de 100 KB de binários no repositório.

### Dados (TMDB)

**Uma porta só, restrita ao servidor.** Todo acesso à API passa por `src/lib/tmdb/client.ts`, com `import "server-only"` e Bearer no header (os cuidados com o token estão em "Segurança do token"). As alternativas eram a `api_key` na URL, que vaza em log, e um route handler como proxy, que acrescenta um salto sem ganho quando quem chama já é um Server Component. Os outros oito módulos da pasta são puros e podem ser importados de qualquer lado; os componentes recebem tipos de domínio (`MovieSummary`, `MovieDetail`, `Genre`, `CastMember`) e nunca o JSON cru. O custo é que `client.ts` não tem teste unitário, porque `server-only` lança fora de um Server Component: a lógica fica nas funções puras, testadas com fixtures, e o cliente é exercitado pela sonda e pelas páginas.

**Corte de votos só na ordenação por nota.** Com `sort=rating` a requisição leva `vote_count.gte=200` (constante `RATING_MIN_VOTE_COUNT`). Sem o corte, o topo é ocupado por filmes com um voto e nota 10. Aplicar o corte também nas outras ordenações esconderia filmes de nicho, então ele não vai.

**Corte de data só na ordenação por lançamento.** Com `sort=release` a requisição leva `primary_release_date.lte=<hoje em UTC>`, para a lista não começar por filmes anunciados para anos à frente. A data é calculada na requisição, nunca no carregamento do módulo, e muda a URL uma vez por dia: o cache dessa listagem tem um bucket diário.

**Limite de 500 páginas.** O discover não passa da página 500. A sonda pediu a 501 e a API respondeu HTTP 400 (`Invalid page: Pages start at 1 and max at 500`), não o 422 que se esperava. Por isso `totalPages` é limitado a 500 no mapper e a página pedida passa por `clampPage` antes de virar parâmetro: a chamada inválida nunca sai. Quando a API informa `total_pages` 0, o mapper garante pelo menos 1, para a paginação mostrar "Página 1 de 1". Na tela, uma página acima do total de um filtro mostra "Esta página não existe" com link para a última, em vez de redirecionar: uma resposta só, sem risco de laço, e a URL digitada continua visível. O custo é não alcançar resultados além da página 500 (10 000 filmes).

**Sinopse em uma chamada, com fallback de idioma.** O detalhe usa `/movie/{id}?append_to_response=credits,videos,translations`, uma chamada só (cerca de 40 KB a mais). A sonda confirmou que `translations` vem na mesma resposta (51 idiomas no filme 603). Para um filme sem sinopse em pt-BR (ids 20000 e 500000), a API devolve `overview` vazio em vez de cair em inglês, e a tradução `en-US` vem preenchida. `pickOverview` segue a ordem: o idioma pedido (pt-BR por padrão), inglês, idioma original e a primeira tradução não vazia. Devolve também o idioma do texto e se ele é um fallback (não veio no idioma pedido), para a tela avisar, e `null` quando não há texto nenhum. Na tela são três casos: no idioma pedido, só o texto; em outro idioma, o aviso "Sinopse disponível apenas em inglês." (o nome do idioma vem de `Intl.DisplayNames`, e vira "outro idioma" para um código desconhecido) antes do texto, com o atributo `lang` no parágrafo para o leitor de tela trocar a pronúncia; sem texto nenhum, "Sinopse não disponível.". A alternativa era uma segunda chamada com `language=en-US` quando o texto viesse vazio, que dobra as requisições nesses casos.

**Trailer escolhido no servidor.** `pickTrailer` aceita só `site=YouTube` e `type=Trailer` (Teaser, clipes e Vimeo ficam de fora) e ordena por oficial, depois idioma (o pedido, depois `en`, depois os outros) e depois pela data de publicação mais recente. O detalhe pede `include_video_language=pt-BR,pt,en,null` (derivado de `TMDB_LANGUAGE`: com `es-ES` vai `es-ES,es,en,null`), que não aparece na referência oficial mas tem efeito, como a sonda mostrou: no filme 603, sem o parâmetro vêm só os 2 vídeos pt-BR; com ele vêm os mesmos 2 e mais 29 en-US. O `pt-BR` precisa estar escrito na lista: o valor `pt` sozinho casa só com os vídeos de Portugal (pt-PT), e com `pt,en,null` os brasileiros somem da resposta. Brasil e Portugal chegam com o mesmo `iso_639_1` (`pt`), então a ordenação não distingue um do outro. No 603 os dois trailers pt-BR não são oficiais e quem ganha é o oficial em inglês mais recente; um trailer oficial em português passaria à frente dele. Sem trailer o componente omite a seção, e Teaser não entra como substituto porque o enunciado pede o trailer.

**`TMDB_LANGUAGE` troca o idioma dos dados, não o da interface.** A variável (padrão `pt-BR`) vai em todas as chamadas como `language`, e a sinopse e o trailer a tratam como "idioma pedido": a sinopse nele aparece sem aviso, e o trailer nele passa à frente do inglês. Os textos da interface (rótulos, avisos, mensagens) continuam em português, sem camada de tradução; o aviso "Sinopse disponível apenas em …" continua em português com o nome do idioma da sinopse. Custo: com outro idioma, a tela mistura dados em um idioma e interface em outro.

**Cache somente no `fetch`.** Cada requisição usa `cache: "force-cache"` com `next: { revalidate }`: 86 400 s (24 h) para gêneros e 3 600 s (1 h) para listagens e detalhe, com as constantes em `client.ts`. É o único mecanismo que vale com e sem `cacheComponents`, e uma requisição com header `Authorization` só entra no cache do Next com `force-cache` explícito. Perde-se a granularidade por função de `"use cache"` e os perfis de `cacheLife`. Dentro de um mesmo render, chamadas repetidas à mesma URL (o detalhe em `generateMetadata` e na página) viram uma requisição só.

**Erros classificados.** Toda falha vira `TmdbError` com `kind`: `config` (token ausente; a mensagem nomeia a variável e o arquivo), `unauthorized` (401 e 403), `not_found` (404), `rate_limited` (429) e `unavailable` (demais status, falha de rede e corpo que não é JSON). O detalhe de um filme inexistente devolve `null` em vez de lançar, e a página decide pelo `not-found`. Em produção o Next redige a mensagem de erros do servidor, então a tela de erro mostra um texto genérico e o `kind` serve ao log. Na rota de detalhe, o id é validado antes de qualquer chamada: `parseMovieId` aceita só inteiro positivo em forma canônica, então `/movie/abc`, `/movie/0` e `/movie/0603` nem chegam ao TMDB e respondem 404 (`0603` é recusado de propósito, para cada filme ter um endereço só; o status vem do `proxy`, em "UI e Design System"). Os demais erros sobem para o `error.tsx` do segmento, cujo "Tentar novamente" refaz os dados do servidor com `router.refresh()` e limpa o erro com `reset()`; o Next 16.4 passou a recomendar a prop `retry()`, que faz as duas coisas, e `reset()` continua suportada. Não há retry automático em 429.

**`connection()` antes de buscar.** Os gêneros não dependem da URL, então o componente que os carrega chama `await connection()` para o `fetch` não entrar no shell nem rodar no build. Os resultados também chamam, depois de ler a URL: com a flag, o `partialPrefetching` resolve `searchParams` ao prerenderizar o destino de um link, e a ordenação por data lê o relógio. Sem isso o `next dev` acusava `blocking-prerender-current-time`. O custo é não haver prefetch dos resultados por link.

**Imagens por `next/image` com tamanhos fixos.** `posterUrl()` e `profileUrl()` montam `image.tmdb.org/t/p/<tamanho><caminho>` com `w342` no card, `w500` no detalhe e `w185` no elenco, e devolvem `null` quando o filme não tem imagem ou quando o caminho não tem o formato do TMDB (`/arquivo.ext`: sem subpasta, query nem `..`), caso em que a UI mostra um placeholder. A checagem fica em `images.ts`, o único lugar que monta URL de imagem, e vale para a API e para o `localStorage`: um `posterPath` adulterado, que o `next/image` recusaria lançando no render, vira um card sem pôster. A regex é estrita de propósito e foi conferida contra as fixtures e a listagem real; se o TMDB mudar o formato do caminho, o pôster some até ela ser ajustada. O domínio está liberado em `images.remotePatterns` só para `/t/p/**`. O pôster do detalhe usa `preload`, por ser a maior imagem da página (a prop `priority` está deprecada no Next 16). As imagens têm `alt=""`, porque o link do card, o título ao lado ou o `figcaption` já nomeiam o que mostram. A alternativa era `<img>` puro, sem `sizes`, lazy loading e formatos modernos.

**Sem validação do JSON em runtime.** Os tipos da API seguem a referência oficial e foram conferidos contra a resposta real pela sonda; não há zod nem type guard. Se o TMDB mudar um campo, o sintoma é um valor ausente na tela, não um erro classificado.

### Estado

**A URL é a única fonte do estado.** `q`, `genre`, `sort` e `page` ficam na URL de `/`, e `src/lib/listing/params.ts` converte nos dois sentidos, omitindo os padrões (`/`, e não `/?page=1`). Valor inválido vira o padrão e a página é limitada a 500. Um `genre` que não está na lista de gêneros do TMDB também vira "Todos": `resolveGenreId` é aplicado nos resultados e na barra, e o link da paginação não leva o id. O parser continua puro e sem I/O; o custo é que os resultados dependem de `getGenres()`, a mesma chamada cacheada que a barra já faz. A alternativa era um estado vazio "Gênero não encontrado", mais uma tela para um caso que só existe com a URL editada à mão. O parser devolve o mesmo objeto que `fetchListing` recebe: um formato só para URL, componentes e API. Link compartilhado, recarregar e o botão voltar funcionam sem código extra; o custo é um parser com testes. A alternativa era guardar os filtros em `useState`.

**`replace` com debounce na digitação, `push` nos selects e na paginação.** A busca atualiza a URL 350 ms depois da última tecla, ou na hora com Enter, sem criar uma entrada de histórico por tecla. Trocar gênero, ordenação ou página cria entrada, e o voltar desfaz. Vale a última ação: se o usuário digita e escolhe um gênero ou uma ordenação antes dos 350 ms, a busca pendente é descartada, o campo é limpo e só o filtro vai para a URL. Os selects só estão habilitados fora do modo busca, então escolher um filtro significa "sem busca"; a alternativa, enviar a busca pendente depois do filtro, apagava a escolha explícita sem aviso. O campo é não controlado: a URL que volta do servidor não sobrescreve o que foi digitado nesse meio-tempo, e ele só é reescrito quando a URL muda por outro caminho.

**Transição compartilhada em vez de skeleton a cada troca.** As navegações da barra rodam dentro de uma transição cujo estado é compartilhado com a região dos resultados por um Context mínimo (`ListingTransition`), já que as duas ficam em `<Suspense>` irmãos. Durante a troca os cards anteriores continuam na tela, esmaecidos e com `aria-busy`, e os selects já mostram a opção escolhida. O skeleton só aparece na primeira carga. Os links da paginação não passam por essa transição, então não esmaecem o grid.

**A página não lê a URL.** `page.tsx` renderiza o título (`ListingTitle`, que lê a URL sob `<Suspense>` e mostra "Resultados da busca" quando há `q`; o fallback é o `h1` "Filmes populares", com as mesmas classes) e dois `<Suspense>` irmãos: a barra de filtros e os resultados. A barra lê `useSearchParams()` por conta própria e os resultados recebem a `Promise` de `searchParams`. Assim o título, a barra desabilitada e o skeleton de 8 cards formam um shell que não depende da requisição, e não há `loading.tsx`, que esconderia o título e a barra a cada carga. Por consequência, o fallback da barra não pode ler a URL: ao abrir `/?q=matrix` com `cacheComponents` ligado, o campo aparece vazio por um instante.

**Paginação por links no servidor.** "Anterior" e "Próxima" são `<Link>` renderizados no servidor; nos limites viram um texto com `aria-disabled`. Funciona sem JavaScript. Enquanto a página seguinte não chega, o link clicado mostra um ponto pulsante e um texto só para leitor de tela (`useLinkStatus` numa ilha client mínima, `PaginationPending`); o ponto fica fora do fluxo, na folga do botão, para a largura não mudar e o rótulo continuar centrado.

**Store próprio sobre `localStorage`, com `useSyncExternalStore`.** `src/lib/favorites/store.ts` tem as regras em funções puras (validar, ordenar, alternar) e um store criado por fábrica, que recebe a `Storage` por parâmetro; os testes injetam uma que funciona, uma que lança e uma que falha só na gravação. `useFavorites()` é o único hook e não usa `useState` nem `useEffect`. As alternativas eram Context com `useEffect`, que re-renderiza todos os consumidores e exige um provider no layout, e Zustand com `persist`, uma dependência para um store só. A armadilha do caminho escolhido é que `getSnapshot` precisa devolver a mesma referência enquanto nada muda: o store lê a string gravada a cada chamada e só refaz o parse quando ela muda, o que também o corrige sozinho se a chave for alterada por fora.

**Guardar um resumo do filme, não só o id.** Cada favorito grava `id`, `title`, `posterPath`, `voteAverage`, `voteCount`, `releaseDate` e `savedAt` na chave `catalogo.favorites.v1`, dentro de `{ version: 1, items }`, do mais recente para o mais antigo. Com isso `/favoritos` é uma página estática que não chama o TMDB. O preço é que os dados envelhecem: a nota e o pôster salvos não acompanham mudanças na API. Guardar só os ids exigiria uma chamada por filme e um route handler para não expor o token. O caminho do pôster e a data são gravados como vieram da API; a URL da imagem e o ano são derivados na hora de montar o card. O que a origem tiver a mais, como elenco e sinopse, não é gravado.

**O servidor renderiza a página sem favoritos.** Ele não conhece o `localStorage`, então o HTML sai com todos os corações desligados e sem badge, e o primeiro render no browser repete isso para a hidratação bater; os favoritos entram no render seguinte. O badge fica oculto até lá e com total zero, então nunca pisca "0", e a lista de `/favoritos` não mostra o estado vazio antes de saber se há itens. O que não dá para evitar sem cookie é o coração dos filmes já salvos aparecer vazio por um instante depois de recarregar, e um clique feito antes da hidratação não ter efeito. Saber se já hidratou também sai de `useSyncExternalStore` (falso no servidor, verdadeiro no browser), em vez do `useState` com `useEffect` que as regras do React Compiler no ESLint reprovam.

**A data de inclusão nasce no clique.** O botão recebe o filme sem `savedAt` e o store carimba o momento ao gravar. O card é renderizado no servidor pela listagem e nenhum componente pode ler o relógio durante o render, o que também mantém `/favoritos` estática com `cacheComponents` ligado. O botão aceita o item da listagem, o detalhe do filme e os dados do card sem adaptador, porque os três têm os seis campos do resumo.

**Dados inválidos não quebram a tela.** O payload é validado por type guards próprios, sem biblioteca de schema: são sete campos. JSON ilegível, versão desconhecida ou formato errado viram lista vazia; um item inválido é descartado sozinho, sem levar os outros; de um id repetido fica o salvo por último. Nada é gravado durante a leitura, que acontece no render: o conteúdo corrompido é sobrescrito na próxima vez que o usuário favoritar. Um `posterPath` fora do formato de caminho do TMDB não descarta o item: ele é mantido com `posterPath: null` e o card mostra o placeholder, porque perder um favorito legítimo por um campo cosmético seria pior.

**Sem `localStorage`, segue em memória.** Acessar, ler ou gravar pode lançar (armazenamento bloqueado, cota cheia). Na primeira exceção o store passa a trabalhar só em memória pelo resto da sessão: favoritar continua alternando o coração e a contagem, sem mensagem de erro, e ao recarregar a lista volta vazia. Não há aviso ao usuário de que nada está sendo salvo.

**Abas sincronizadas pelo evento `storage`.** Favoritar em uma aba atualiza as outras sem recarregar. O evento só dispara nas outras abas, então a aba que gravou avisa os próprios componentes por conta própria. O listener é registrado quando o primeiro componente assina e removido quando o último sai.

**Um botão por card, cada um uma ilha client.** O card continua renderizado no servidor e só o coração hidrata; a listagem passa a ter 20 ilhas pequenas assinando o mesmo store, e um clique re-renderiza os 20 botões, o que é barato nesta escala. A alternativa, um wrapper client em volta do grid, tiraria o card do servidor. O botão é irmão do link do pôster, nunca filho: botão dentro de link é HTML inválido. Tem 40 px, como no protótipo, abaixo dos 44 px dos demais controles, e não tem transição de cor, que só fazia o anel de foco surgir em cinza antes de chegar ao âmbar.

### UI e Design System

**Tokens no `@theme` com nomes 1:1.** `--color-text-muted` vira a classe `text-text-muted`, e `--color-*: initial` remove a paleta padrão do Tailwind. O nome fica redundante de ler, mas é rastreável até `tokens.json` e o `check-tokens` não precisa de mapeamento.

**Quatro contrastes herdados do protótipo foram mantidos.** `text-subtle` (3,1:1) só aparece em texto decorativo com `aria-hidden`, e o placeholder de input usa `text-muted`. `border-strong` (1,7:1) continua na borda do botão outline: o texto (15,8:1) e o anel de foco (10,4:1) identificam o controle. A borda (`border-subtle`, 1,4:1) e o fundo (`surface-100`, 1,1:1) dos campos e selects também ficam abaixo de 3:1, e o `label` visível, o placeholder e o anel de foco identificam o campo. Subir as bordas para 3:1 mudaria a aparência dos controles. Os valores medidos estão em "Acessibilidade".

**Grid de duas colunas no celular.** A 390 px o grid tem duas colunas e os selects dividem uma linha; de 640 px em diante as colunas se ajustam a um mínimo de 200 px, o que dá cinco a 1280 px, contra as quatro do protótipo. O detalhe empilha pôster e texto no celular, com o elenco em duas colunas. O `h1` tem 36 px na listagem e 44 px no detalhe. O contêiner do pôster não usa `overflow-hidden`, que cortava o anel de foco do link; quem arredonda é a imagem.

**Um componente para os estados excepcionais.** `EmptyState` (ícone, título, descrição e ação opcional) atende busca sem resultado, filtro sem resultado, página inexistente, favoritos vazios, erro e filme não encontrado, com quatro ícones nomeados (`search`, `heart`, `alert`, `film`). O título é um `h2` por padrão, sob o `h1` da página; nas telas que substituem a página inteira (erro, filme não encontrado e página não encontrada) é o `h1`, com as mesmas classes. A alternativa era um componente por caso; com um só, todos os estados excepcionais têm a mesma forma.

**Suspense granular em vez de `loading.tsx`.** Cada tela define carregando, vazio e erro. Na listagem, o fallback é a barra com o select de gênero desabilitado e um skeleton de 8 cards; no detalhe, um skeleton com as mesmas caixas do cabeçalho do filme; cada segmento tem o seu `error.tsx`. Um `loading.tsx` esconderia o título, a barra e o link de volta a cada carga.

**A página de detalhe não lê a URL nem busca dados.** `page.tsx` de `/movie/[id]` recebe `params` e `searchParams` e os repassa, sem `await`, a dois `<Suspense>` irmãos: um resolve o link "Voltar à listagem" e o outro busca o filme. O que fica fora deles (o link apontando para `/` e o skeleton) é um shell que não depende da requisição. Não há `generateStaticParams`: nenhum filme é pré-renderizado, e o build passa sem token e sem rede. No resumo do build a rota aparece como `ƒ` (dinâmica) e, com `CATALOGO_CACHE_COMPONENTS=1`, como `◐` (shell estático com conteúdo transmitido). As alternativas eram um `loading.tsx`, que esconderia o link de volta, e pré-renderizar os filmes populares, que exigiria token no build.

**Id inválido responde 404 de verdade; filme que o TMDB não conhece responde 200.** O `notFound()` do detalhe roda dentro do `<Suspense>`, depois de a resposta começar a ser transmitida, e nesse ponto o status já saiu: o Next mantém o 200, mostra "Filme não encontrado" e injeta `<meta name="robots" content="noindex">`. Para o id que nem é um inteiro positivo canônico, um `src/proxy.ts` restrito a `/movie/:id` confere o id com o mesmo `parseMovieId` antes de qualquer render e reescreve para um caminho sem rota, e o Next responde 404 com a tela "Página não encontrada" da raiz. Foi medido com `curl -I` em `next start`, com e sem a flag: 404 em `/movie/abc`, `/movie/0603`, `/movie/0` e `/movie/603abc`, 200 em `/movie/603` e em `/movie/999999999`. O proxy só testa uma regex, sem I/O, e não lê o token nem chama o TMDB. As alternativas descartadas eram ler `params` e chamar `notFound()` no corpo da página (a rota inteira ficaria dinâmica e o shell estático se perderia) e `generateMetadata` com `notFound()` (a metadata é transmitida, o status já saiu). O 404 para id válido que o TMDB não conhece exigiria buscar o filme antes de a resposta começar, no proxy ou fora do `<Suspense>`, e as duas formas custam o shell estático; para um catálogo sem indexação em jogo, a tela correta com `noindex` foi considerada suficiente. Uma consequência: `/movie/abc` mostra "Página não encontrada" (a da raiz) em vez de "Filme não encontrado", porque o status correto vale mais que a mensagem específica para um endereço digitado errado. Qualquer rota sem correspondência (`/naoexiste`) também usa essa tela, em português, dentro do layout, com 404.

**Título da aba pela mesma chamada.** `generateMetadata` chama o mesmo `getMovieDetail` da página; o Next reaproveita a requisição dentro do render. O título é o do filme, "Filme não encontrado" para id inexistente e "Filme" se a busca falhar: a metadata nunca é a origem do erro, quem o mostra é a página. Com a flag ligada essa metadata é transmitida depois do shell.

**Elenco e trailer somem quando não há dados.** O elenco mostra até 8 pessoas em `figure` com `figcaption`, duas colunas no celular. O trailer é um `<iframe>` de `youtube-nocookie.com` (o player não grava cookie antes do play) com `title`, `loading="lazy"` e tela cheia. Sem elenco ou sem trailer, a seção inteira some, inclusive o título dela. A página não carrega nenhum script do YouTube, só o iframe, que ainda assim pesa cerca de 500 KB quando entra na tela.

**"Voltar à listagem" com `?from=` validado.** O card da listagem leva o estado dela em `?from=`. No detalhe, esse valor passa pelo mesmo parser da listagem e o href é montado pelo app: sempre `/` ou `/?…`, nunca o texto que veio na URL. `from=page%3D999` vira `/?page=500`; uma URL externa ou um valor inválido vira `/`. A alternativa era `router.back()`, que não funciona em link direto e exigiria uma ilha client. Vindo de `/favoritos` não há `from`, e o link volta para `/`.

**`Button` e `ButtonLink` em `components/ui/`.** Variantes `primary` (`bg-accent text-on-accent`) e `outline` (`border-border-strong bg-bg-base text-text-primary`), ambas com 44 px de altura mínima. As classes de botão ficam em um lugar só, o que evita que botão e link divirjam. O chip de nota do detalhe usa as mesmas medidas e não é interativo.

**O link ativo do header lê o pathname sob `<Suspense>`.** Numa rota com parâmetro dinâmico o pathname só existe na requisição, e com `cacheComponents` ligado o build falhava nesta rota por causa do `usePathname()` do header. O `NavLink` passou a lê-lo num componente interno sob `<Suspense>`, com o link sem marca de ativo como fallback, que no detalhe é também o estado final.

**Contagem de favoritos no nome do link.** O badge leva `aria-label` com "1 favorito" ou "N favoritos", que entra no nome acessível do link Favoritos. Não há região `aria-live`: a contagem muda por ação do próprio usuário, que já ouve o estado do botão.

## Testes

`npm run test` roda 409 testes em 35 arquivos (Vitest, jsdom), sem token e sem rede:

| Domínio | Arquivos de teste |
| --- | --- |
| `lib/tmdb` | `errors`, `params`, `images`, `mappers` (com as respostas de exemplo de `fixtures/`), `pickOverview`, `pickTrailer`, `parseMovieId` |
| `lib/listing` | `params` (ida e volta URL ↔ estado), `resolveGenre`, `emptyState` (qual estado vazio a listagem mostra), `backHref` |
| `lib/format` | `rating`, `releaseYear`, `runtime`, `languageName`, `movieMeta` |
| `lib/favorites` | `store` (com `Storage` que funciona, que lança e que falha só ao gravar), `useFavorites` |
| `components/layout` e `components/ui` | `NavLink`, `Button`, `EmptyState`, `ErrorState` |
| `components/movies` | `FilterBar` (debounce, modo busca, última ação vence), `ListingTransition`, `MovieCard`, `Pagination` (limites), `PaginationPending` |
| `proxy` | `src/proxy.test.ts`: quais ids passam e quais são reescritos para o 404 |
| `components/favorites` | `FavoriteButton`, `FavoritesBadge`, `FavoritesList` |
| `components/movie-detail` | `MovieHeader`, `Overview` (os três casos da sinopse), `CastList`, `TrailerEmbed` |

O que não tem teste unitário, e por quê: Server Components assíncronos não rodam no Vitest (`MovieResults`, `FilterBarLoader`, `MovieDetails`, `BackLinkLoader`, as páginas), e `client.ts` importa `server-only`, que lança fora do servidor. Esses são cobertos por `npm run e2e` (a escolha do estado vazio sai de `emptyState`, testada à parte; o estado "Limpar filtros" não tem E2E, porque não há combinação estável de filtros sem resultado no TMDB real): 132 execuções do Playwright (66 testes em cinco specs, cada um em 1280 e em 390 px) contra o build de produção e o TMDB real. A sonda exercita as mesmas URLs do cliente. O estado de erro do detalhe não tem teste de ponta a ponta, porque a falha acontece no servidor: é conferido manualmente com o token vazio, e o componente tem teste unitário (`ErrorState`).

Uma mudança é considerada pronta com `npm run check` e `npm run build` verdes sem `.env.local`, mais o build com `CATALOGO_CACHE_COMPONENTS=1` quando toca uma página.

## Acessibilidade

O que o app faz:

- Elementos nativos (`a`, `button`, `input`, `select`), com `label` visível envolvendo cada campo.
- Um `h1` por página, inclusive nas telas de erro e de não encontrado; skip-link "Pular para o conteúdo" como primeiro foco de toda página, visível só com foco, que leva o foco ao `main`; `form role="search"`, `nav` com `aria-label` ("Principal", "Paginação") e listas com `role="list"`.
- `aria-current="page"` no link ativo do header; `aria-pressed` e rótulo que alterna ("Adicionar aos favoritos" / "Remover dos favoritos") no coração; `aria-label` só em controle que não tem texto.
- `aria-busy` na região dos resultados durante a troca de filtros; texto para leitor de tela "Carregando…" no link de paginação clicado; `role="status"` com texto para leitor de tela nos skeletons; `aria-describedby` ligando os selects ao aviso da busca; `aria-disabled` nos limites da paginação.
- `lang` no parágrafo da sinopse em outro idioma; `title` no iframe do trailer; `figure` com `figcaption` no elenco.
- Foco visível em todo controle: anel de 2 px na cor de destaque, com 2 px de afastamento.
- Controles com 44 px de altura mínima. O coração sobre o pôster tem 40 px, como no protótipo.

Contrastes abaixo do recomendado, todos herdados do protótipo e mantidos:

- `text-subtle` sobre `surface-200` (3,1:1) aparece só nos rótulos decorativos "Pôster" e "Foto", com `aria-hidden`. O placeholder dos campos usa `text-muted` (6,8:1).
- A borda do botão outline (`border-strong`, 1,7:1) não identifica o controle sozinha: o texto (15,8:1) e o anel de foco (10,4:1) identificam.
- A borda dos campos e selects (`border-subtle`, 1,4:1) e o fundo deles (`surface-100`, 1,1:1) também ficam abaixo de 3:1. O campo é identificado pelo `label` visível acima dele, pelo placeholder e pelo anel de foco.

Limites conhecidos:

- Ao remover um card em `/favoritos`, o foco vai para o corpo da página.
- Depois de recarregar, o coração dos filmes já salvos aparece vazio por um instante, até a hidratação.
- Com o foco num select fechado, as setas trocam a opção e cada troca navega (comportamento nativo do navegador com `onChange`).
- O iframe do trailer não recebe o anel de foco do app; o foco passa para o player do YouTube.

### Checklist executado

Conferido em 2026-10-07, em Chromium, sobre `next dev` com dados reais do TMDB.

**Teclado** (só Tab, Enter, Espaço e setas; anel de foco conferido no estilo computado de cada elemento). Desde a revisão de 2026-10-08, o primeiro Tab de qualquer página foca "Pular para o conteúdo" antes do logo, e o teste de ponta a ponta confere isso; as ordens abaixo valem a partir do logo:

| Tela | Ordem de tabulação observada | Resultado |
| --- | --- | --- |
| `/` | logo → Explorar → Favoritos → busca → Gênero → Ordenar por → por card: pôster → coração → título → Anterior → Próxima | OK. Enter no campo aplica a busca; Espaço e Enter no coração alternam `aria-pressed` e o rótulo. |
| `/?q=matrix` | logo → Explorar → Favoritos → busca → cards | OK. Os dois selects, desabilitados, são pulados. |
| `/movie/603` | logo → Explorar → Favoritos → Voltar à listagem → Adicionar aos favoritos → iframe "Trailer: …" | OK, com a ressalva do anel no iframe. |
| `/favoritos` (dois salvos) | logo → Explorar → Favoritos ("2 favoritos" no nome) → por card: pôster → coração → título | OK. Ao remover, o foco vai para o corpo da página. |

**Contraste** (fórmula da WCAG 2.1 sobre os valores dos tokens em `globals.css`; texto pede 4,5:1, ícone e anel de foco pedem 3:1):

| Par | Onde aparece | Medido | Resultado |
| --- | --- | --- | --- |
| `text-primary` / `bg-base` | títulos, texto de botões neutros | 15,8:1 | OK |
| `text-primary` / `surface-100` | campo, selects, link ativo do header | 14,1:1 | OK |
| `text-primary` / `surface-200` | chip de nota | 12,9:1 | OK |
| `text-primary` / `border-subtle` | badge de contagem | 11,7:1 | OK |
| `text-primary` / `bg-overlay` | coração inativo sobre o pôster | 15,3:1 | OK |
| `text-secondary` / `bg-base` | sinopse | 12,2:1 | OK |
| `text-muted` / `bg-base` | labels, metadados do card, link inativo, "Página X de N", avisos | 7,6:1 | OK |
| `text-muted` / `surface-100` | placeholder, descrição dos estados vazios | 6,8:1 | OK |
| `text-muted` / `surface-200` | texto sobre card | 6,2:1 | OK |
| `accent` / `bg-base` | anel de foco, hover de links, ponto do logo | 10,4:1 | OK |
| `on-accent` / `accent` | botões primários | 10,4:1 | OK |
| `accent` / `bg-overlay` | coração ativo sobre o pôster | 10,1:1 | OK |
| `text-subtle` / `surface-200` | rótulos "Pôster" e "Foto" (decorativos) | 3,1:1 | abaixo, herdado |
| `border-strong` / `bg-base` | borda do botão outline | 1,7:1 | abaixo, herdado |
| `border-subtle` / `bg-base` | borda de campos e selects | 1,4:1 | abaixo, herdado |
| `surface-100` / `bg-base` | fundo de campos e selects | 1,1:1 | abaixo, herdado |

**390 px e 1280 px** (`document.documentElement.scrollWidth` igual à largura da janela em todos os casos, ou seja, sem rolagem horizontal):

| Tela | 390 px | 1280 px |
| --- | --- | --- |
| `/` (lista, busca, página 2, busca sem resultado) | grid de 2 colunas; header, barra de filtros e paginação quebram linha | grid de 5 colunas |
| `/movie/603` e `/movie/abc` | pôster e texto empilhados; elenco em 2 colunas | pôster e texto lado a lado; elenco em 5 colunas |
| `/favoritos` (vazio e com dois salvos) | grid de 2 colunas; estado vazio na largura do contêiner | grid de 5 colunas |

Os testes de ponta a ponta repetem em cada execução, nas duas larguras, as verificações de rolagem horizontal, altura mínima dos controles, cores dentro dos tokens e anel de foco.

## O que ficou de fora

Decisões de não fazer, por prazo ou por escopo:

- Busca combinada com gênero e ordenação (buscar algumas páginas, filtrar e paginar no client); ver "Trade-off principal".
- Pré-renderizar filmes com `generateStaticParams`: exigiria token e rede no build.
- Route handler ou proxy para o TMDB: os Server Components chamam a API direto.
- Retry automático quando o TMDB responde 429.
- Status 404 para filme com id válido que o TMDB não conhece (ver "UI e Design System").
- Tradução da interface: `TMDB_LANGUAGE` troca só os dados.
- Elenco completo, galeria de imagens, filmes semelhantes e recomendações no detalhe.
- Migração entre versões do formato dos favoritos, e exportar ou importar a lista.
- Deploy, CI e relatório de cobertura.

Havia uma ordem de corte definida para o caso de faltar prazo (o `?from=` do "Voltar", a sincronização entre abas, o skeleton da barra de filtros, os testes de componente e o `next/image`). Nenhum desses itens precisou ser cortado.

## Melhorias futuras

- Type guard mínimo nas respostas do TMDB, para que uma mudança de formato vire `TmdbError` em vez de campo vazio na tela.
- Teste de `client.ts`, com um alias para `server-only` no Vitest.
- `loading="eager"` no primeiro pôster.
- Grid com mínimo de 220 px, para quatro colunas a 1280 px como no protótipo, e `h1` da listagem em 40 px; hoje são cinco colunas e 36 px.
- Mover o foco para o card seguinte ao remover um favorito em `/favoritos`.
- Avisar quando os favoritos não estão sendo salvos porque o armazenamento do navegador está bloqueado.
- Um seletor por filme (`useIsFavorite(id)`), para um clique re-renderizar só o botão que mudou, se a lista crescer.
- Embed leve do trailer: mostrar a miniatura e carregar o player do YouTube só no clique.
- Status 404 também para o filme que o TMDB não conhece, sem perder o shell estático (hoje o id inválido tem 404 e o inexistente tem 200).
- Subir as bordas de campos, selects e do botão outline para 3:1 de contraste.
- Teste de ponta a ponta do estado de erro do detalhe.
- Passar ao botão de favorito do detalhe só os campos do resumo, em vez do filme inteiro.
- `og:image` com o pôster no detalhe.

## Processo

Este projeto foi desenvolvido com assistência de inteligência artificial, em um fluxo em que cada etapa nasce de uma proposta escrita (o quê, como, tarefas e cenários) antes do código, passa por validação automática e revisão e termina com evidências. As decisões de arquitetura e a revisão final são do autor.

A pasta `.work/` é a trilha de decisões desse fluxo: o design (telas, tokens, inventário de componentes e a tabela de decisões técnicas), os changes (proposta, design, tarefas e cenários de cada etapa, ativos e arquivados) e as especificações. A pasta `docs/` guarda as evidências por requisito e por tarefa, incluindo capturas de tela, o que explica o volume de arquivos. Nenhuma das duas é necessária para rodar a aplicação.

O repositório de entrega foi migrado de um repositório de trabalho privado: os commits mantêm a data e a autoria originais, e os pull requests foram recriados na migração.
