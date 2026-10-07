# Catálogo.

Catálogo de filmes sobre a API pública do TMDB, feito para o teste técnico de Desenvolvedor Frontend da UpFlow (enunciado em [`DESAFIO.md`](DESAFIO.md)).

> **Estado atual:** a listagem em `/` (populares, busca, filtro por gênero, ordenação e paginação) e os favoritos (coração no card, contagem no header e a página `/favoritos`) estão implementados sobre o cliente do TMDB em `src/lib/tmdb/`. A página de detalhe em `/movie/[id]` ainda não foi implementada.

## Como rodar

Pré-requisitos: Node.js 22 (o `.nvmrc` fixa a versão; qualquer Node >= 20.9 funciona) e npm.

```bash
npm ci
cp .env.example .env.local          # bash, zsh, Git Bash
npm run dev
```

No PowerShell, a cópia é `Copy-Item .env.example .env.local`.

Abra <http://localhost:3000>.

Em `.env.local`, preencha `TMDB_API_READ_TOKEN` com o **API Read Access Token (v4)** da sua conta em <https://www.themoviedb.org/settings/api>. O token é lido só no servidor e nunca recebe o prefixo `NEXT_PUBLIC_`. Sem `.env.local`, `npm run build` passa e `/favoritos` funciona, mas a listagem em `/` mostra a tela de erro pedindo a variável.

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

## Flags

| Variável | Valores | Efeito |
| --- | --- | --- |
| `CATALOGO_CACHE_COMPONENTS` | `1` ou `true` (sem distinguir maiúsculas) | Liga `cacheComponents` e `partialPrefetching` juntos no `next.config.ts`. Qualquer outro valor, ou a ausência da variável, mantém os dois desligados. |

Desligado é o padrão. O código é escrito para valer nos dois modos, por isso não usa `"use cache"` nem `cacheLife`. Para testar o modo ligado:

```bash
CATALOGO_CACHE_COMPONENTS=1 npm run build     # bash
```

```powershell
$env:CATALOGO_CACHE_COMPONENTS="1"; npm run build
```

A variável também pode ir no `.env.local`, que é carregado antes de o `next.config.ts` ser avaliado.

## Estrutura

```
src/
├── app/                      rotas, layouts e arquivos de rota (Server Components)
│   ├── fonts/                .woff2 self-hosted e licenças OFL
│   ├── fonts.ts              next/font/local: heading e body
│   ├── globals.css           @theme com os tokens de cor e estilos base
│   ├── layout.tsx            html pt-BR, Header e container
│   ├── page.tsx              /            (listagem: título e dois <Suspense>)
│   ├── error.tsx             erro do segmento, com "Tentar novamente"
│   ├── favoritos/page.tsx    /favoritos   (estática; a lista vem do navegador)
│   └── movie/[id]/           /movie/[id]  (previsto)
├── components/
│   ├── layout/               Header, NavLink
│   ├── ui/                   Button, ButtonLink, EmptyState, ErrorState
│   ├── movies/               FilterBar, FilterBarLoader, MovieResults, MovieGrid, MovieCard,
│   │                         MovieGridSkeleton, Pagination, ListingTransition
│   ├── favorites/            FavoriteButton, FavoritesBadge, FavoritesList (ilhas client)
│   └── movie-detail/         previsto
└── lib/
    ├── tmdb/                 única porta para a API do TMDB
    │   ├── client.ts         server-only: getGenres, fetchListing, getMovieDetail
    │   ├── types.ts          tipos de domínio e formato cru da API (sufixo Dto)
    │   ├── errors.ts         TmdbError com kind
    │   ├── params.ts         parâmetros de /discover/movie e /search/movie
    │   ├── mappers.ts        resposta da API → tipos de domínio
    │   ├── pickOverview.ts   sinopse com fallback de idioma
    │   ├── pickTrailer.ts    escolha do trailer
    │   ├── images.ts         URLs de pôster e de foto do elenco
    │   └── fixtures/         respostas de exemplo usadas nos testes
    ├── listing/
    │   └── params.ts         URL da listagem ↔ estado (q, genre, sort, page)
    ├── favorites/
    │   ├── store.ts          formato, validação e store sobre o localStorage
    │   └── useFavorites.ts   hook com useSyncExternalStore
    └── format/               nota ("7,2") e ano de lançamento
e2e/                          testes de ponta a ponta e de layout (Playwright)
├── support/                  gates de layout, tokens e pré-requisito do TMDB
└── *.spec.ts                 um arquivo por fluxo
playwright.config.ts          build de produção, projetos desktop (1280 px) e mobile (390 px)
scripts/check-tokens.mjs      guardrail do Design System
scripts/tmdb-probe.mjs        confere o token e o comportamento real da API
```

Os testes ficam ao lado do arquivo testado (`NavLink.test.tsx`, `params.test.ts`). Não há pasta `utils/` ou `helpers/` genérica, nem `index.ts` em `lib/tmdb/`: cada import aponta o módulo exato (`@/lib/tmdb/client`, `@/lib/tmdb/images`), o que deixa visível quem depende do lado servidor.

## Decisões técnicas e trade-offs

Decisões aplicadas até aqui, cada uma com a alternativa considerada e o que se perde com a escolha.

**Next.js 16.4, App Router, React 19.3 e TypeScript strict.** É a versão estável atual do npm; a alternativa era a 15.5. O preço são convenções novas: `params` e `searchParams` são `Promise`, `proxy` substitui `middleware`, o `next build` não roda lint e o Turbopack é o bundler padrão. A documentação consultada é a da versão instalada, em `node_modules/next/dist/docs/`.

**`cacheComponents` desligado por padrão, com toggle.** `CATALOGO_CACHE_COMPONENTS` liga `cacheComponents` e `partialPrefetching` juntos, porque o segundo sem o primeiro falha a validação do config e o primeiro sem o segundo gera warning. O padrão desligado dá previsibilidade e build offline; o toggle demonstra shell estático e prefetch parcial sem fork de código. O custo é escrever na interseção dos dois modelos, sem `"use cache"` nem `cacheLife`.

**Scaffold com `create-next-app@16.4.0` em diretório temporário.** A CLI recusa uma pasta que já tenha outros arquivos, então o projeto foi gerado fora e movido para a raiz. Isso dá lockfile novo e nada herdado, ao custo de um passo manual.

**npm com `package-lock.json` versionado.** `engines.node >= 20.9`, `.nvmrc` com 22 e `npm ci` nas instruções. O pnpm é mais rápido, mas exigiria corepack de quem avalia.

**Tailwind CSS v4 via PostCSS.** Usa `@tailwindcss/postcss` em `postcss.config.mjs`, o caminho documentado e que também funciona com `--webpack`. A CLI 16.4 gera por padrão o loader `@tailwindcss/turbopack` em `turbopack.rules`; ele foi trocado pelo PostCSS, abrindo mão de um dev ligeiramente mais rápido. O `@source not "../../.work"` em `globals.css` impede o Tailwind de varrer arquivos de documentação fora de `src/`.

**`src/` organizado por domínio.** `app/` para rotas, `components/<domínio>/` e `lib/<domínio>/`, com o teste ao lado do arquivo. Fica claro quem é dono de cada arquivo; o custo é um nível a mais de pasta.

**Vitest 5 com Testing Library (jsdom).** `npm run test` é execução única, sem watch. Funções puras e componentes client ou shared têm teste unitário. Server Components assíncronos não são testáveis no Vitest, então ficam para os testes de ponta a ponta.

**Playwright para ponta a ponta e layout.** `npm run e2e` roda contra o build de produção, em 1280 e 390 px, e cobre o que o Vitest não alcança: Server Components assíncronos, navegação e o layout renderizado. Os testes chegam a cada tela como o usuário chega (pelo header, pelo card, pela busca) e usam dados reais do TMDB, com asserções sobre estrutura e comportamento, não sobre um título específico. Em cada tela, `e2e/support/layout.ts` confere que toda cor computada é um token de `tokens.json`, que não há rolagem horizontal, que os controles têm 44 px de altura, que as fontes são as declaradas e que o foco por teclado mostra o anel. É a versão em runtime do `tokens:check`, que só vê o código-fonte. O custo é uma devDependency, o download do Chromium e alguns segundos de build por execução; como as telas com dados precisam de token e de rede, o `e2e` fica fora do `check`, e sem token esses testes aparecem como pulados, não como aprovados. Comparação de screenshot por diff de pixel foi descartada: os dados do TMDB mudam a cada dia.

**`scripts/check-tokens.mjs`.** Script próprio, sem dependências, que confere `tokens.json` contra o `@theme` e falha se houver cor literal em `src/`. É um guardrail barato e visível para o Design System; custa manter o script. A alternativa era stylelint ou nenhuma verificação.

**`.gitattributes` com `* text=auto eol=lf`.** Evita diff de CRLF entre Windows e Linux. O `AGENTS.md` que o `next dev` gera é commitado para a árvore não ficar suja a cada execução.

**Fontes self-hosted via `next/font/local`.** Plus Jakarta Sans (variável, títulos) e IBM Plex Sans 400, 500 e 600 (corpo) estão em `src/app/fonts/` com as licenças OFL-1.1. Os arquivos foram extraídos uma vez dos pacotes `@fontsource-variable/plus-jakarta-sans` e `@fontsource/ibm-plex-sans` com `npm pack`, e os pacotes não são dependência. O `next/font/google` foi descartado porque baixa CSS e fontes durante o build, o que quebraria o build sem rede. O custo são cerca de 100 KB de binários no repositório.

**Tokens no `@theme` com nomes 1:1.** `--color-text-muted` vira a classe `text-text-muted`, e `--color-*: initial` remove a paleta padrão do Tailwind. O nome fica redundante de ler, mas é rastreável até `tokens.json` e o `check-tokens` não precisa de mapeamento.

**Dois contrastes herdados do protótipo foram mantidos.** `text-subtle` (3,1:1) só aparece em texto decorativo com `aria-hidden`, e o placeholder de input usa `text-muted`. `border-strong` (1,7:1) continua na borda do botão outline: o texto (15,8:1) e o anel de foco (10,4:1) identificam o controle. Subir a borda para 3:1 mudaria a aparência do botão.

**`Button` e `ButtonLink` em `components/ui/`.** Variantes `primary` (`bg-accent text-on-accent`) e `outline` (`border-border-strong bg-bg-base text-text-primary`), ambas com 44 px de altura mínima. As classes de botão ficam em um lugar só, o que evita que botão e link divirjam.

### Dados do TMDB

**Uma porta só, restrita ao servidor.** Todo acesso à API passa por `src/lib/tmdb/client.ts`, com `import "server-only"` e Bearer no header. As alternativas eram a `api_key` na URL, que vaza em log, e um route handler como proxy, que acrescenta um salto sem ganho quando quem chama já é um Server Component. Os outros sete módulos da pasta são puros e podem ser importados de qualquer lado; os componentes recebem tipos de domínio (`MovieSummary`, `MovieDetail`, `Genre`, `CastMember`) e nunca o JSON cru. O custo é que `client.ts` não tem teste unitário, porque `server-only` lança fora de um Server Component: a lógica fica nas funções puras, testadas com fixtures, e o cliente é exercitado pela sonda e pelas páginas.

**"Populares" é o `/discover/movie` ordenado por popularidade.** A listagem usa sempre o discover, com `sort_by=popularity.desc` e `include_adult=false`, em vez de `/movie/popular` sem filtros e discover com filtros. Um caminho só, e gênero e ordenação compõem sobre ele. A ordem difere um pouco da lista oficial de populares.

**Corte de votos só na ordenação por nota.** Com `sort=rating` a requisição leva `vote_count.gte=200` (constante `RATING_MIN_VOTE_COUNT`). Sem o corte, o topo é ocupado por filmes com um voto e nota 10. Aplicar o corte também nas outras ordenações esconderia filmes de nicho, então ele não vai.

**Corte de data só na ordenação por lançamento.** Com `sort=release` a requisição leva `primary_release_date.lte=<hoje em UTC>`, para a lista não começar por filmes anunciados para anos à frente. A data é calculada na requisição, nunca no carregamento do módulo, e muda a URL uma vez por dia: o cache dessa listagem tem um bucket diário.

**Cache somente no `fetch`.** Cada requisição usa `cache: "force-cache"` com `next: { revalidate }`: 86 400 s (24 h) para gêneros e 3 600 s (1 h) para listagens e detalhe, com as constantes em `client.ts`. É o único mecanismo que vale com e sem `cacheComponents`, e uma requisição com header `Authorization` só entra no cache do Next com `force-cache` explícito. Perde-se a granularidade por função de `"use cache"` e os perfis de `cacheLife`. Dentro de um mesmo render, chamadas repetidas à mesma URL (o detalhe em `generateMetadata` e na página) viram uma requisição só.

**Erros classificados.** Toda falha vira `TmdbError` com `kind`: `config` (token ausente; a mensagem nomeia a variável e o arquivo), `unauthorized` (401 e 403), `not_found` (404), `rate_limited` (429) e `unavailable` (demais status, falha de rede e corpo que não é JSON). O detalhe de um filme inexistente devolve `null` em vez de lançar, e a página decide pelo `not-found`. Em produção o Next redige a mensagem de erros do servidor, então a tela de erro mostra um texto genérico e o `kind` serve ao log. Não há retry automático em 429.

**Limite de 500 páginas.** O discover não passa da página 500. A sonda pediu a 501 e a API respondeu HTTP 400 (`Invalid page: Pages start at 1 and max at 500`), não o 422 que se esperava. Por isso `totalPages` é limitado a 500 no mapper e a página pedida passa por `clampPage` antes de virar parâmetro: a chamada inválida nunca sai. Quando a API informa `total_pages` 0, o mapper garante pelo menos 1, para a paginação mostrar "Página 1 de 1". O custo é não alcançar resultados além da página 500 (10 000 filmes).

**Sinopse em uma chamada, com fallback de idioma.** O detalhe usa `/movie/{id}?append_to_response=credits,videos,translations`, uma chamada só (cerca de 40 KB a mais). A sonda confirmou que `translations` vem na mesma resposta (51 idiomas no filme 603). Para um filme sem sinopse em pt-BR (ids 20000 e 500000), a API devolve `overview` vazio em vez de cair em inglês, e a tradução `en-US` vem preenchida. `pickOverview` segue a ordem: pt-BR, inglês, idioma original e a primeira tradução não vazia. Devolve também o idioma de origem, para a tela avisar que a sinopse não está em português, e `null` quando não há texto nenhum. A alternativa era uma segunda chamada com `language=en-US` quando o texto viesse vazio, que dobra as requisições nesses casos.

**Trailer escolhido no servidor.** `pickTrailer` aceita só `site=YouTube` e `type=Trailer` (Teaser, clipes e Vimeo ficam de fora) e ordena por oficial, depois idioma (`pt` antes de `en`) e depois pela data de publicação mais recente. O detalhe pede `include_video_language=pt-BR,pt,en,null`, que não aparece na referência oficial mas tem efeito, como a sonda mostrou: no filme 603, sem o parâmetro vêm só os 2 vídeos pt-BR; com ele vêm os mesmos 2 e mais 29 en-US. O `pt-BR` precisa estar escrito na lista: o valor `pt` sozinho casa só com os vídeos de Portugal (pt-PT), e com `pt,en,null` os brasileiros somem da resposta. Brasil e Portugal chegam com o mesmo `iso_639_1` (`pt`), então a ordenação não distingue um do outro. No 603 os dois trailers pt-BR não são oficiais e quem ganha é o oficial em inglês mais recente; um trailer oficial em português passaria à frente dele. Sem trailer o componente omite a seção, e Teaser não entra como substituto porque o enunciado pede o trailer.

**Imagens por `next/image` com tamanhos fixos.** `posterUrl()` e `profileUrl()` montam `image.tmdb.org/t/p/<tamanho><caminho>` com `w342` no card, `w500` no detalhe e `w185` no elenco, e devolvem `null` quando o filme não tem imagem, caso em que a UI mostra um placeholder. O domínio está liberado em `images.remotePatterns` só para `/t/p/**`. A alternativa era `<img>` puro, sem `sizes`, lazy loading e formatos modernos.

**Sem validação do JSON em runtime.** Os tipos da API seguem a referência oficial e foram conferidos contra a resposta real pela sonda; não há zod nem type guard. Se o TMDB mudar um campo, o sintoma é um valor ausente na tela, não um erro classificado.

### Listagem

**A URL é a única fonte do estado.** `q`, `genre`, `sort` e `page` ficam na URL de `/`, e `src/lib/listing/params.ts` converte nos dois sentidos, omitindo os padrões (`/`, e não `/?page=1`). Valor inválido vira o padrão e a página é limitada a 500. O parser devolve o mesmo objeto que `fetchListing` recebe: um formato só para URL, componentes e API. Link compartilhado, recarregar e o botão voltar funcionam sem código extra; o custo é um parser com testes. A alternativa era guardar os filtros em `useState`.

**Busca exclusiva.** Com a busca preenchida, gênero e ordenação ficam desabilitados, descritos por um aviso ligado aos dois selects, e saem da URL. `/search/movie` não aceita gênero nem ordenação. Filtrar e ordenar localmente os 20 itens da página deixaria páginas quase vazias com "Próxima" ativa e reordenaria por nota um conjunto que veio por relevância. Buscar várias páginas e paginar no client seria o melhor produto e ficou fora.

**A página não lê a URL.** `page.tsx` renderiza o título e dois `<Suspense>` irmãos: a barra de filtros e os resultados. A barra lê `useSearchParams()` por conta própria e os resultados recebem a `Promise` de `searchParams`. Assim o título, a barra desabilitada e o skeleton de 8 cards formam um shell que não depende da requisição, e não há `loading.tsx`, que esconderia o título e a barra a cada carga. Por consequência, o fallback da barra não pode ler a URL: ao abrir `/?q=matrix` com `cacheComponents` ligado, o campo aparece vazio por um instante.

**`connection()` antes de buscar.** Os gêneros não dependem da URL, então o componente que os carrega chama `await connection()` para o `fetch` não entrar no shell nem rodar no build. Os resultados também chamam, depois de ler a URL: com a flag, o `partialPrefetching` resolve `searchParams` ao prerenderizar o destino de um link, e a ordenação por data lê o relógio. Sem isso o `next dev` acusava `blocking-prerender-current-time`. O custo é não haver prefetch dos resultados por link.

**`replace` com debounce na digitação, `push` nos selects e na paginação.** A busca atualiza a URL 350 ms depois da última tecla, ou na hora com Enter, sem criar uma entrada de histórico por tecla. Trocar gênero, ordenação ou página cria entrada, e o voltar desfaz. O campo é não controlado: a URL que volta do servidor não sobrescreve o que foi digitado nesse meio-tempo, e ele só é reescrito quando a URL muda por outro caminho.

**Transição compartilhada em vez de skeleton a cada troca.** As navegações da barra rodam dentro de uma transição cujo estado é compartilhado com a região dos resultados por um Context mínimo (`ListingTransition`), já que as duas ficam em `<Suspense>` irmãos. Durante a troca os cards anteriores continuam na tela, esmaecidos e com `aria-busy`, e os selects já mostram a opção escolhida. O skeleton só aparece na primeira carga. É a única ilha client além da barra e da tela de erro. Os links da paginação não passam por essa transição, então não esmaecem o grid.

**Paginação por links no servidor.** "Anterior" e "Próxima" são `<Link>` renderizados no servidor; nos limites viram um texto com `aria-disabled`. Funciona sem JavaScript. Uma página acima do total mostra "Esta página não existe" com link para a última, em vez de redirecionar: uma resposta só, sem risco de laço, e a URL digitada continua visível.

**Um componente para os estados excepcionais.** `EmptyState` atende busca vazia, filtro sem resultado, página inexistente e erro, com quatro ícones nomeados. `error.tsx` mantém o header e oferece "Tentar novamente", que refaz os dados do servidor com `router.refresh()` e limpa o erro com `reset()`. O Next 16.4 passou a recomendar a prop `retry()`, que faz as duas coisas; `reset()` continua suportada e foi mantida.

**Grid de duas colunas no celular.** A 390 px o grid tem duas colunas e os selects dividem uma linha; de 640 px em diante as colunas se ajustam a um mínimo de 200 px, o que dá cinco a 1280 px, contra as quatro do protótipo. O contêiner do pôster não usa `overflow-hidden`, que cortava o anel de foco do link; quem arredonda é a imagem.

### Favoritos

**Store próprio sobre `localStorage`, com `useSyncExternalStore`.** `src/lib/favorites/store.ts` tem as regras em funções puras (validar, ordenar, alternar) e um store criado por fábrica, que recebe a `Storage` por parâmetro; os testes injetam uma que funciona, uma que lança e uma que falha só na gravação. `useFavorites()` é o único hook e não usa `useState` nem `useEffect`. As alternativas eram Context com `useEffect`, que re-renderiza todos os consumidores e exige um provider no layout, e Zustand com `persist`, uma dependência para um store só. A armadilha do caminho escolhido é que `getSnapshot` precisa devolver a mesma referência enquanto nada muda: o store lê a string gravada a cada chamada e só refaz o parse quando ela muda, o que também o corrige sozinho se a chave for alterada por fora.

**Guardar um resumo do filme, não só o id.** Cada favorito grava `id`, `title`, `posterPath`, `voteAverage`, `voteCount`, `releaseDate` e `savedAt` na chave `catalogo.favorites.v1`, dentro de `{ version: 1, items }`, do mais recente para o mais antigo. Com isso `/favoritos` é uma página estática que não chama o TMDB. O preço é que os dados envelhecem: a nota e o pôster salvos não acompanham mudanças na API. Guardar só os ids exigiria uma chamada por filme e um route handler para não expor o token. O caminho do pôster e a data são gravados como vieram da API; a URL da imagem e o ano são derivados na hora de montar o card. O que a origem tiver a mais, como elenco e sinopse, não é gravado.

**O servidor renderiza a página sem favoritos.** Ele não conhece o `localStorage`, então o HTML sai com todos os corações desligados e sem badge, e o primeiro render no browser repete isso para a hidratação bater; os favoritos entram no render seguinte. O badge fica oculto até lá e com total zero, então nunca pisca "0", e a lista de `/favoritos` não mostra o estado vazio antes de saber se há itens. O que não dá para evitar sem cookie é o coração dos filmes já salvos aparecer vazio por um instante depois de recarregar, e um clique feito antes da hidratação não ter efeito. Saber se já hidratou também sai de `useSyncExternalStore` (falso no servidor, verdadeiro no browser), em vez do `useState` com `useEffect` que as regras do React Compiler no ESLint reprovam.

**A data de inclusão nasce no clique.** O botão recebe o filme sem `savedAt` e o store carimba o momento ao gravar. O card é renderizado no servidor pela listagem e nenhum componente pode ler o relógio durante o render, o que também mantém `/favoritos` estática com `cacheComponents` ligado. O botão aceita o item da listagem, o detalhe do filme e os dados do card sem adaptador, porque os três têm os seis campos do resumo.

**Dados inválidos não quebram a tela.** O payload é validado por type guards próprios, sem biblioteca de schema: são sete campos. JSON ilegível, versão desconhecida ou formato errado viram lista vazia; um item inválido é descartado sozinho, sem levar os outros; de um id repetido fica o salvo por último. Nada é gravado durante a leitura, que acontece no render: o conteúdo corrompido é sobrescrito na próxima vez que o usuário favoritar.

**Sem `localStorage`, segue em memória.** Acessar, ler ou gravar pode lançar (armazenamento bloqueado, cota cheia). Na primeira exceção o store passa a trabalhar só em memória pelo resto da sessão: favoritar continua alternando o coração e a contagem, sem mensagem de erro, e ao recarregar a lista volta vazia. Não há aviso ao usuário de que nada está sendo salvo.

**Abas sincronizadas pelo evento `storage`.** Favoritar em uma aba atualiza as outras sem recarregar. O evento só dispara nas outras abas, então a aba que gravou avisa os próprios componentes por conta própria. O listener é registrado quando o primeiro componente assina e removido quando o último sai.

**Um botão por card, cada um uma ilha client.** O card continua renderizado no servidor e só o coração hidrata; a listagem passa a ter 20 ilhas pequenas assinando o mesmo store, e um clique re-renderiza os 20 botões, o que é barato nesta escala. A alternativa, um wrapper client em volta do grid, tiraria o card do servidor. O botão é irmão do link do pôster, nunca filho: botão dentro de link é HTML inválido. Tem 40 px, como no protótipo, abaixo dos 44 px dos demais controles, e não tem transição de cor, que só fazia o anel de foco surgir em cinza antes de chegar ao âmbar.

**Contagem no nome da aba.** O badge leva `aria-label` com "1 favorito" ou "N favoritos", que entra no nome acessível do link Favoritos. Não há região `aria-live`: a contagem muda por ação do próprio usuário, que já ouve o estado do botão.

**Estado vazio do protótipo.** Sem favoritos, a página usa o mesmo `EmptyState` dos outros estados excepcionais, com o coração, os textos do protótipo e a ação "Explorar filmes".

## Melhorias futuras

- Type guard mínimo nas respostas do TMDB, para que uma mudança de formato vire `TmdbError` em vez de campo vazio na tela.
- Busca combinada com gênero e ordenação, buscando algumas páginas e paginando no client.
- Indicador de carregamento nos links da paginação (`useLinkStatus`) e `loading="eager"` no primeiro pôster.
- Título `h1` em 40 px, como no protótipo; hoje está em 36 px.
- Validar o `genre` da URL contra a lista de gêneros; hoje um id desconhecido cai no estado vazio.
- Mover o foco para o card seguinte ao remover um favorito em `/favoritos`; hoje ele vai para o corpo da página.
- Avisar quando os favoritos não estão sendo salvos porque o armazenamento do navegador está bloqueado.
- Um seletor por filme (`useIsFavorite(id)`), para um clique re-renderizar só o botão que mudou, se a lista crescer.

Demais itens a definir ao final da implementação.
