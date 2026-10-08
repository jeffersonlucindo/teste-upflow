# Tasks — correcoes-entrega

## Contexto
- Proposal: .work/changes/correcoes-entrega/proposal.md
- Design: .work/changes/correcoes-entrega/design.md
- Decisões: .work/design/decisoes.md (D8 revisada; D45–D48 novas) · Contratos: .work/design/components.md · Docs da versão instalada: node_modules/next/dist/docs/ (`proxy.md`, `not-found.md`, `use-link-status.md`)
- Ambiente: Windows 11, Node 22, npm. Os grupos 1 e 9 e a verificação de status do grupo 4 precisam de `.env.local` com `TMDB_API_READ_TOKEN` e de rede; a Validação roda sem token e sem rede.
- Regra deste change: evidências e documentos não citam hash de commit (design, "Abordagem").

## 1. Reprodução
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [x] 1.1 Reproduzir os defeitos de comportamento antes de corrigir [#L9]
  - Inspecionar: `src/components/movies/FilterBar.tsx:98-119`; `src/lib/tmdb/images.ts`; `src/lib/favorites/store.ts:41-54`; `src/components/movie-detail/MovieDetails.tsx`; `src/lib/listing/params.ts:24-27`
  - Criar/Alterar: nada em `src/`; com `npm run dev`, anotar para a evidência o resultado atual de: digitar "mat" e trocar o gênero em menos de 350 ms; `/favoritos` com um item de `posterPath: "/../../etc.jpg"` no `localStorage`; `curl -I` em `/naoexiste`, `/movie/abc` e `/movie/999999999`; `/?genre=999999`
  - Critério: os quatro comportamentos da revisão observados e anotados (o que a tela mostra e o status HTTP)

## 2. Listagem
- [x] 2.1 `FilterBar`: última ação vence entre busca pendente e filtro [#L9]
  - Inspecionar: `src/components/movies/FilterBar.tsx` (`timerRef`, `committedRef`, `pushFilter`); `src/components/movies/FilterBar.test.tsx` (como o debounce é testado hoje); design decisão 1
  - Criar/Alterar: `FilterBar.tsx`: em `pushFilter`, cancelar o timer, limpar o campo e zerar `committedRef` antes do `router.push`; `FilterBar.test.tsx`: caso novo com relógio falso (digitar, trocar gênero antes de 350 ms, avançar o relógio)
  - Critério: o teste novo falha sem a correção e passa com ela; o destino tem `genre` e não tem `q`; nenhuma segunda navegação depois de 350 ms; os testes existentes do debounce continuam verdes
- [x] 2.2 Gênero desconhecido na URL vira "Todos" [#L9]
  - Inspecionar: `src/lib/listing/params.ts` (`parseSort`); `src/components/movies/MovieResults.tsx`; `src/components/movies/FilterBarLoader.tsx` (`getGenres`); design decisão 2
  - Criar/Alterar: `src/lib/listing/resolveGenre.ts` com `resolveGenreId` e `resolveGenre.test.ts` (id presente, ausente, `null`, lista vazia); `MovieResults.tsx`: buscar os gêneros e resolver o id antes de `fetchListing`, usando o estado resolvido nos hrefs
  - Critério: `/?genre=999999` mostra os populares com o select em "Todos"; `/?genre=16` continua filtrando; `parseListingParams` sem alteração
- [x] 2.3 Título da listagem durante a busca [#L9]
  - Inspecionar: `src/app/page.tsx`; `src/components/movies/MovieResults.tsx` (padrão de receber a Promise `searchParams`); design decisão 3
  - Criar/Alterar: `src/components/movies/ListingTitle.tsx` (Server Component assíncrono); `page.tsx`: `ListingTitle` sob `<Suspense>` com o `h1` atual como fallback
  - Critério: `/?q=matrix` mostra "Resultados da busca" e `/` mostra "Filmes populares"; um `h1` por página; sem salto de layout na troca
- [x] 2.4 Indicador de carregamento na paginação [#L9]
  - Inspecionar: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-link-status.md`; `src/components/movies/Pagination.tsx`; `src/components/ui/Button.tsx` (`ButtonLink`); `src/components/movies/Pagination.test.tsx`; design decisão 4
  - Criar/Alterar: `src/components/movies/PaginationPending.tsx` (`"use client"`, `useLinkStatus`) e teste ao lado; `Pagination.tsx`: usar o indicador dentro dos dois links
  - Critério: com a rede lenta, o link clicado mostra o indicador até a página chegar; `Pagination` continua Server Component; só tokens de cor (`npm run tokens:check`); os links funcionam sem JavaScript

## 3. Favoritos e imagens
- [x] 3.1 Caminho de imagem validado em `images.ts` [#L9]
  - Inspecionar: `src/lib/tmdb/images.ts`; `src/lib/tmdb/images.test.ts`; `src/lib/tmdb/fixtures/` (formato real de `poster_path` e `profile_path`); `next.config.ts > images.remotePatterns`; design decisão 5
  - Criar/Alterar: `images.ts`: `isTmdbImagePath` exportada e `imageUrl` devolvendo `null` para caminho fora do formato; `images.test.ts`: `"/../../etc.jpg"`, caminho sem barra inicial, com `?`, com barra dupla, URL absoluta, extensão desconhecida, e os caminhos das fixtures
  - Critério: todos os caminhos das fixtures continuam gerando URL; os adulterados devolvem `null`
- [x] 3.2 Favorito com pôster inválido é mantido sem pôster [#L9]
  - Inspecionar: `src/lib/favorites/store.ts` (`toFavoriteSnapshot`, `parseFavorites`); `src/lib/favorites/store.test.ts`
  - Criar/Alterar: `store.ts`: `toFavoriteSnapshot` grava `posterPath: null` quando `isTmdbImagePath` recusa; `store.test.ts`: payload com `posterPath` adulterado mantém o item e zera o pôster
  - Critério: `/favoritos` com o payload da task 1.1 mostra o card com o placeholder de pôster, sem tela de erro

## 4. Detalhe e 404
- [x] 4.1 `not-found.tsx` na raiz, em português [#L9]
  - Inspecionar: `src/app/movie/[id]/not-found.tsx`; `src/components/ui/EmptyState.tsx`; `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`; design decisão 6
  - Criar/Alterar: `src/app/not-found.tsx` com `metadata.title`
  - Critério: `/naoexiste` e `/movie` mostram "Página não encontrada" dentro do layout, com status 404
- [x] 4.2 404 real para id de filme inválido [#L9]
  - Inspecionar: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`; `src/lib/tmdb/parseMovieId.ts`; `src/components/movie-detail/MovieDetails.tsx`; design decisão 7
  - Criar/Alterar: `src/proxy.ts` (função `proxy` e `config.matcher`) e `src/proxy.test.ts` para a decisão por id; nada muda em `MovieDetails.tsx`
  - Critério: com `npm run build && npm run start`, `curl -I` devolve 404 em `/movie/abc`, `/movie/0603`, `/movie/0` e `/movie/603abc`, e 200 em `/movie/603`; o mesmo com `CATALOGO_CACHE_COMPONENTS=1`; `/movie/999999999` continua 200 com "Filme não encontrado"; se o `rewrite` não der 404, aplicar a alternativa da decisão 7 e registrar em "Ajustes do apply"
- [x] 4.3 Sinopse e trailer seguem `TMDB_LANGUAGE` [#L9]
  - Inspecionar: `src/lib/tmdb/{pickOverview,pickTrailer,client,mappers,types}.ts` e os testes de cada um; `src/components/movie-detail/Overview.tsx` e `Overview.test.tsx`; design decisão 8
  - Criar/Alterar: `types.ts` (`MovieOverview.fallback`); `pickOverview.ts`; `pickTrailer.ts` (segundo parâmetro); `client.ts` (`include_video_language` derivado do idioma); `mappers.ts` (repassar o idioma); `Overview.tsx`; testes: casos com `es-ES` e `en-US` além dos de `pt-BR`
  - Critério: com `pt-BR` todas as asserções existentes passam sem alteração de valor esperado; com `es-ES`, sinopse em espanhol não mostra aviso e trailer em espanhol vem antes do inglês

## 5. Shell e acessibilidade
- [x] 5.1 Skip-link no layout [#L9]
  - Inspecionar: `src/app/layout.tsx`; `src/app/globals.css` (tokens e foco); `e2e/shell.spec.ts` (ordem de foco conferida hoje); design decisão 10
  - Criar/Alterar: `layout.tsx`: link "Pular para o conteúdo" e `id`/`tabIndex` no `main`
  - Critério: o primeiro Tab em qualquer página foca o link, visível; Enter leva o foco ao `main`; invisível sem foco; sem cor literal
- [x] 5.2 `h1` nas telas de erro e de não encontrado [#L9]
  - Inspecionar: `src/components/ui/EmptyState.tsx` e `EmptyState.test.tsx`; `src/components/ui/ErrorState.tsx`; `src/app/error.tsx`, `src/app/movie/[id]/{error,not-found}.tsx`; usos de `EmptyState` em `MovieResults.tsx` e `FavoritesList.tsx`; design decisão 9
  - Criar/Alterar: `EmptyState.tsx` (`headingLevel`, padrão 2); `ErrorState.tsx` e os dois `not-found.tsx` com nível 1; testes do nível
  - Critério: cada tela tem exatamente um `h1` (listagem, busca vazia, favoritos vazio, erro, filme não encontrado, página não encontrada)

## 6. Projeto
- [x] 6.1 `engines.node` alinhado ao toolchain [#L9]
  - Inspecionar: `package.json`; `.nvmrc`; campo `engines` de `node_modules/{next,vite,vitest,jsdom}/package.json`; design decisão 11
  - Criar/Alterar: `package.json` (`engines.node`); `package-lock.json` atualizado só no bloco `engines` da raiz (`npm install --package-lock-only`)
  - Critério: `npm ci` sem aviso `EBADENGINE` no Node da `.nvmrc`; o diff do lockfile não muda versões de pacote

## 7. README
- [x] 7.1 Clone, Node, contagens e textos que mudaram [#L9]
  - Inspecionar: `README.md` linhas 16-45, 202, 256, 266, "Flags", "Testes", "O que ficou de fora", "Melhorias futuras"; `ls src/lib/tmdb/*.ts` sem testes (contagem de módulos); tabela de contrastes em "Acessibilidade"; design decisão 13
  - Criar/Alterar: `README.md`: URL e pasta do clone; pré-requisito de Node; "oito módulos"; "Quatro contrastes"; parágrafo do not-found; `TMDB_LANGUAGE` como idioma dos dados; parágrafos das decisões 1, 2, 5 e 7 nas áreas correspondentes; "Melhorias futuras" sem os itens resolvidos; contagens de teste finais
  - Critério: `grep -n "desafio-up-flow" README.md` vazio; cada número do README bate com a saída de `npm run test` e de `npm run e2e`; cada contagem citada bate com a tabela ou a pasta a que se refere
- [x] 7.2 Resumo das decisões e seção "Processo" [#L9]
  - Inspecionar: `README.md › Decisões técnicas e trade-offs`; design decisões 12 e 13
  - Criar/Alterar: bloco "Em resumo" com cinco linhas no topo da seção de decisões; seção "Processo" no fim, com os três parágrafos da decisão 12
  - Critério: a seção "Processo" não cita ferramenta do fluxo, comando, arquivo de configuração nem agente; diz que houve assistência de IA, o que são `.work/` e `docs/` e que o repositório foi migrado

## 8. Registros
- [x] 8.1 Decisões, regra de README e contratos [#L9]
  - Inspecionar: `.work/design/decisoes.md` (D8 e o fim da tabela); `.work/config.yaml > context` (bloco "README" e a linha sobre o que é versionado); `.work/design/components.md`
  - Criar/Alterar: `decisoes.md`: D8 revisada, D45 (processo no README), D46 (404 por proxy), D47 (gênero desconhecido), D48 (caminho de imagem); `config.yaml`: regra de README conforme D45; `components.md`: `ListingTitle`, `PaginationPending`, `EmptyState.headingLevel`, not-found da raiz
  - Critério: cada decisão nova tem alternativa e trade-off; `components.md` lista as duas ilhas client novas
- [x] 8.2 Comentário do ESLint e índice de design [#L9]
  - Inspecionar: `eslint.config.mjs:15`; `.work/design/README.md:100-101`
  - Criar/Alterar: os dois trechos, sem citar pasta ou ferramenta que não é entregue
  - Critério: `npm run lint` verde
- [x] 8.3 Referências a `.claude/` e `.work/prompts/` [#L9]
  - Inspecionar: saída de `git grep -n "\.claude" -- .work docs README.md eslint.config.mjs ":!*.html" ":!.work/config.yaml"` (arquivos em `.work/changes/archive/*/{tasks,design}.md`, `.work/changes/setup-catalogo/`, `.work/design/{README,decisoes}.md`, `docs/entrega/work-items/{setup-catalogo,readme-entrega}/evidence/`); design decisão 15
  - Criar/Alterar: trocar a menção ao caminho por "ferramental local, não versionado" ou remover a frase; `git rm .work/prompts/explore-inicial.md`
  - Critério: o mesmo `git grep` devolve vazio; nenhum resultado de evidência (números, status, comandos de validação) foi alterado
- [x] 8.4 Arquivar o `setup-catalogo` [#L9]
  - Inspecionar: `.work/changes/setup-catalogo/.devflow.yaml`; `.work/specs/` (se a spec do change já foi sincronizada); `git grep -l "changes/setup-catalogo" -- .work docs README.md ":!*.html"`; design decisão 16
  - Criar/Alterar: `git mv` para `.work/changes/archive/2026-10-07-setup-catalogo/`; `phase: finish`; caminhos corrigidos nos arquivos listados
  - Critério: `ls .work/changes` mostra só `archive/` e este change; o `git grep` acima só encontra o caminho arquivado

## 9. E2E
- [x] 9.1 E2E dos comportamentos corrigidos [#L9]
  - Inspecionar: `e2e/listagem-filmes.spec.ts`, `e2e/favoritos.spec.ts`, `e2e/detalhe-filme.spec.ts:98-116` (ids inválidos), `e2e/shell.spec.ts`; `e2e/support/{layout,tmdb}.ts`; regras de `.work/config.yaml > qa.default.dimensions.e2e`; design decisão 17
  - Criar/Alterar: `e2e/correcoes-entrega.spec.ts` (digitar e trocar gênero em seguida; `/?genre=999999`; título na busca; favorito com pôster adulterado; `/naoexiste`; skip-link); `e2e/detalhe-filme.spec.ts`: ids inválidos esperam status 404 e o título da raiz; `e2e/shell.spec.ts` se a ordem de foco mudou
  - Critério: `npm run e2e` verde nos projetos desktop e mobile, sem teste pulado

## 10. Validação
- [x] 10.1 Rodar `apply.validation` de `.work/config.yaml` sem `.env.local` e sem rede: `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` [#L9]
- [x] 10.2 `CATALOGO_CACHE_COMPONENTS=1 npm run build` verde, sem insight de blocking-route em `next dev` com a flag nas rotas `/`, `/movie/603` e `/naoexiste` [#L9]
- [x] 10.3 `npm run e2e` com `.env.local`; conferir que os números do README são os desta execução [#L9]
