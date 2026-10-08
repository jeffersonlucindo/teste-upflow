# correcoes-entrega

## Resumo:
Sétimo change do catálogo: corrige o que a revisão da entrega `v0.1.0` (2026-10-08) encontrou
antes de o repositório ser compartilhado. São três frentes. **Código**: a corrida entre a busca e
os selects no `FilterBar`, o `posterPath` adulterado que derruba `/favoritos`, o 404 genérico em
inglês, o status 200 para id de filme inválido, o gênero desconhecido na URL, o `engines` do
`package.json` abaixo do que o toolchain exige e o `TMDB_LANGUAGE` que só valia pela metade; mais
quatro ajustes de acessibilidade e feedback (skip-link, `h1` nas telas de erro e de não
encontrado, título da listagem durante a busca, indicador de carregamento na paginação).
**README**: URL de clone do repositório de entrega, duas contagens erradas, resumo das decisões
principais e uma seção "Processo" que passa a dizer como o projeto foi feito. **Registros**: D8 e
a regra de README revisadas, referências a uma pasta que não é entregue, e o change
`setup-catalogo`, que ficou sem arquivar. Entrega o [#L9].

## Parent item(ns) relacionado(s):
- [#L9] Correções da revisão da entrega (`.work/backlog.md`). Os requisitos L1–L8 continuam
  `done`: nenhum deles é reaberto, e os comportamentos que já atendiam o enunciado não mudam.

## Tasks
Ver `tasks.md`: 1) reprodução dos defeitos; 2) listagem; 3) favoritos e imagens; 4) detalhe e
404; 5) shell e acessibilidade; 6) projeto (`engines`); 7) README; 8) registros; 9) E2E;
10) validação.

## Por quê
A revisão rodou tudo o que o README manda e aprovou os requisitos, mas apontou defeitos que
contradizem o próprio README: ele afirma que "dados inválidos não quebram a tela", e um
`posterPath` adulterado no `localStorage` derruba `/favoritos` sem recuperação; ele manda clonar
`desafio-up-flow`, e a entrega é `teste-upflow`. Há uma corrida real no componente mais complexo
(`src/components/movies/FilterBar.tsx:112-119`: `pushFilter` não cancela o timer do debounce, e
digitar e trocar o gênero em menos de 350 ms descarta o gênero). Uma aplicação em pt-BR responde
"This page could not be found." em `/naoexiste`. E o README omitia o processo de trabalho
enquanto a trilha em `.work/` o mostrava, o que a revisão leu como omissão. Como "todo artefato
entregue será analisado" (`DESAFIO.md › Avaliação`), esses pontos pesam mais do que o tamanho
deles sugere, e todos cabem em um change curto com a validação completa.

## O que muda
- **Listagem.** `pushFilter` cancela a busca pendente e limpa o campo: vale a última ação.
  Gênero que não existe na lista do TMDB vira "Todos", como já acontece com `sort` inválido. O
  `h1` passa a dizer "Resultados da busca" quando há `q`. Os links da paginação mostram que a
  página está carregando.
- **Favoritos e imagens.** `src/lib/tmdb/images.ts` só monta URL para caminho no formato do TMDB
  (`/arquivo.ext`); qualquer outro vira `null` e a UI mostra o placeholder. `parseFavorites`
  grava o item com `posterPath: null` em vez de descartá-lo.
- **404.** Novo `src/app/not-found.tsx` em português. Novo `src/proxy.ts` restrito a
  `/movie/:id`: id que não é inteiro positivo canônico recebe 404 de verdade, antes de a
  resposta começar. Filme com id válido que o TMDB não tem continua respondendo 200 com a tela
  "Filme não encontrado" (trade-off mantido e documentado).
- **Idioma.** A sinopse sabe se veio no idioma pedido (`MovieOverview.fallback`), o trailer
  prioriza o idioma configurado e `include_video_language` é derivado de `TMDB_LANGUAGE`. A
  interface continua em pt-BR; o README passa a dizer que a variável troca só os dados.
- **Acessibilidade.** Skip-link "Pular para o conteúdo" no layout; `EmptyState` ganha o nível do
  título, e as telas que substituem a página inteira (erro, não encontrado) usam `h1`.
- **Projeto.** `engines.node` passa a refletir o que `vitest` 5 e `jsdom` 30 exigem
  (`^22.22.2 || ^24.15.0 || >=26.0.0`); README e `.nvmrc` conferidos.
- **README.** URL e pasta de clone do repositório de entrega; "sete módulos" → oito; "dois
  contrastes" → quatro; resumo de cinco linhas no topo de "Decisões técnicas e trade-offs";
  parágrafo do not-found, "O que ficou de fora" e "Melhorias futuras" atualizados com o que este
  change resolve; pré-requisito de Node corrigido; seção nova "Processo".
- **Registros.** D8 revisada e D45–D48 novas em `.work/design/decisoes.md`; regra de README de
  `.work/config.yaml > context` revisada; menções ao ferramental local em `.work/` e `docs/` reescritas;
  `.work/prompts/` removido; comentário de `eslint.config.mjs` ajustado; `setup-catalogo`
  arquivado; `.work/design/components.md` com os componentes novos; L9 em `.work/backlog.md`.
- Fora de escopo: combinar busca com gênero e ordenação; `retry()` no lugar de `reset()` nos
  `error.tsx`; teste unitário de `client.ts`; validação em runtime das respostas do TMDB; CI e
  deploy; a migração do histórico para o repositório de entrega, feita depois do merge.

## Capacidades
### Novas
- nenhuma.
### Modificadas
- listagem-filmes: última ação vence entre busca e filtros; gênero desconhecido vira o padrão;
  título e paginação refletem o estado.
- favoritos: caminho de pôster inválido não derruba a página nem descarta o favorito.
- detalhe-filme: id inválido responde 404; 404 da aplicação em português; aviso de idioma da
  sinopse e escolha do trailer seguem o idioma configurado.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L9] — Correções da revisão da entrega
  - [#L9] — Reproduzir os defeitos de comportamento antes de corrigir
  - [#L9] — `FilterBar`: última ação vence entre busca pendente e filtro
  - [#L9] — Gênero desconhecido na URL vira "Todos"
  - [#L9] — Título da listagem durante a busca
  - [#L9] — Indicador de carregamento na paginação
  - [#L9] — Caminho de imagem validado em `images.ts`
  - [#L9] — Favorito com pôster inválido é mantido sem pôster
  - [#L9] — `not-found.tsx` na raiz, em português
  - [#L9] — 404 real para id de filme inválido (`proxy.ts`)
  - [#L9] — Sinopse e trailer seguem `TMDB_LANGUAGE`
  - [#L9] — Skip-link no layout
  - [#L9] — `h1` nas telas de erro e de não encontrado
  - [#L9] — `engines.node` alinhado ao toolchain
  - [#L9] — README: clone, Node, contagens e textos que mudaram
  - [#L9] — README: resumo das decisões e seção "Processo"
  - [#L9] — Decisões D8 e D45–D48, regra de README e `components.md`
  - [#L9] — Referências ao ferramental local, `.work/prompts/` e comentário do ESLint
  - [#L9] — Arquivar o `setup-catalogo`
  - [#L9] — E2E dos comportamentos corrigidos
  - [#L9] — Validação (`apply.validation`, build com a flag, E2E)

## Impacto
- Arquivos novos: `src/app/not-found.tsx`, `src/proxy.ts`,
  `src/components/movies/ListingTitle.tsx`, `src/components/movies/PaginationPending.tsx`,
  `src/lib/listing/resolveGenre.ts`, os testes ao lado de cada um e
  `e2e/correcoes-entrega.spec.ts`.
- Arquivos modificados: `src/components/movies/{FilterBar,MovieResults,Pagination}.tsx`,
  `src/app/{page,layout,error}.tsx`, `src/app/movie/[id]/{not-found,error}.tsx`,
  `src/components/ui/{EmptyState,ErrorState}.tsx`,
  `src/components/movie-detail/Overview.tsx`,
  `src/lib/tmdb/{images,pickOverview,pickTrailer,client,mappers,types}.ts`,
  `src/lib/favorites/store.ts`, `e2e/{detalhe-filme,shell}.spec.ts`, `package.json`,
  `package-lock.json` (só o bloco `engines` da raiz), `eslint.config.mjs`, `README.md`,
  `.work/design/{decisoes,components,README}.md`, `.work/config.yaml`, `.work/backlog.md`, os
  arquivos de `.work/changes/` e `docs/` que citam o ferramental local ou o caminho do `setup-catalogo`.
- Arquivos removidos: `.work/prompts/explore-inicial.md`.
- Dependências: nenhuma nova.
- Padrões reutilizados: inspecionados `src/components/movies/FilterBar.tsx` (refs, debounce,
  `useOptimistic`), `src/lib/listing/params.ts` (`parseSort`: valor inválido vira o padrão),
  `src/lib/favorites/store.ts` (`parseFavorites`: item inválido não leva a lista junto),
  `src/lib/tmdb/{images,pickOverview,pickTrailer,parseMovieId,client}.ts`,
  `src/components/movies/{MovieResults,FilterBarLoader,Pagination}.tsx` (leitura da URL sob
  `<Suspense>` e `await connection()`), `src/app/movie/[id]/{page,not-found}.tsx`,
  `src/components/ui/{EmptyState,ErrorState}.tsx`, `src/app/layout.tsx`, `next.config.ts`
  (`remotePatterns`), `e2e/detalhe-filme.spec.ts` (casos de id inválido) e a documentação da
  versão instalada em `node_modules/next/dist/docs/` (`proxy.md`, `not-found.md`,
  `use-link-status.md`). Este change **estende** os padrões existentes: nenhuma camada nova,
  duas ilhas client novas registradas no `design.md`. Telas: as três de `.work/design/screens/`
  já estão implementadas; o change não altera o desenho delas.
