# Design — correcoes-entrega

## Contexto
- A entrega `v0.1.0` passou por uma revisão em 2026-10-08. Os requisitos do enunciado foram
  aprovados; os achados que este change trata estão resumidos em `proposal.md › Por quê`.
- Padrões que valem aqui (pilares de `.work/config.yaml > context`): Server Components por
  padrão e leitura da URL sob `<Suspense>` (1); funções puras testadas em `src/lib/<domínio>/`
  (2, 3); URL como única fonte do estado da listagem (4); só tokens de cor (5); toda tela com
  loading, vazio e erro (6); `npm run check` e `npm run build` verdes sem token e sem rede, e
  build com `CATALOGO_CACHE_COMPONENTS=1` quando o change toca página (7).
- Código inspecionado:
  - `src/components/movies/FilterBar.tsx:98-119`: `handleQueryChange` agenda `commitQuery` em
    `timerRef`; `pushFilter` não toca no timer. Se o usuário digita e troca o gênero antes de
    350 ms, o `router.push` do gênero sai e, em seguida, o timer dispara `router.replace` para a
    busca pura, que apaga o gênero.
  - `src/lib/tmdb/images.ts:9-11`: `imageUrl` concatena qualquer `path`. `"/../../etc.jpg"` vira
    uma URL fora de `/t/p/**`, o `next/image` recusa (`next.config.ts > remotePatterns`) e lança
    no render. Em `/favoritos` o valor vem do `localStorage`, então "Tentar novamente" repete o
    erro.
  - `src/lib/favorites/store.ts:41-54`: `isFavoriteSnapshot` aceita qualquer string em
    `posterPath`.
  - `src/components/movie-detail/MovieDetails.tsx:21,25`: os dois `notFound()` acontecem dentro
    do `<Suspense>`, depois de a resposta começar. `node_modules/next/dist/docs/.../not-found.md`
    confirma: depois que o streaming começa, o status fica 200.
  - Não existe `src/app/not-found.tsx`: rota sem correspondência usa a tela padrão do Next, em
    inglês.
  - `src/lib/listing/params.ts:24-27`: `parseGenreId` aceita qualquer inteiro ≥ 1. O `<select>`
    sem `option` correspondente mostra "Todos" e a lista vem vazia.
  - `src/components/movie-detail/Overview.tsx:11` compara com `"pt"` fixo;
    `src/lib/tmdb/pickTrailer.ts:3` ordena por `pt` fixo; `client.ts:28` fixa
    `VIDEO_LANGUAGES = "pt-BR,pt,en,null"`.
  - `package.json`: `engines.node: ">=20.9"`. Instalados: `vitest` 5.0.3 exige
    `^22.12.0 || ^24.0.0 || >=26.0.0`; `jsdom` 30.1.2 exige `^22.22.2 || ^24.15.0 || >=26.0.0`.
  - `src/app/page.tsx:21`: `h1` "Filmes populares" fixo no shell.
    `src/components/ui/EmptyState.tsx`: título sem nível configurável.
- `README.md`: linhas 21-22 (clone), 202 ("sete módulos"), 256 ("dois contrastes"), 266
  (not-found com 200), 394 (melhoria "Status 404 real").
- Documentação do Next lida para este change: `proxy.md` (matcher constante, `rewrite`,
  runtime Node), `not-found.md` (status antes e depois do streaming), `use-link-status.md`.

## Objetivos
- Cada defeito de comportamento da revisão reproduzido por um teste que falha antes e passa
  depois.
- Nenhum requisito L1–L8 muda de comportamento para quem usa a aplicação do jeito previsto.
- README correto na primeira instrução e franco sobre o processo.
- Validação completa verde nos dois modos de cache e E2E verde.

## Não-objetivos
- Combinar busca com gênero e ordenação (continua o trade-off principal do README).
- 404 real para id válido que o TMDB não conhece: exigiria buscar o filme antes de a resposta
  começar, no `proxy` ou fora do `<Suspense>`, e as duas formas custam o shell estático.
- Trocar `reset()` por `retry()` nos `error.tsx`, testar `client.ts`, validar respostas do TMDB
  em runtime, CI, deploy.
- Traduzir a interface: `TMDB_LANGUAGE` continua trocando só os dados.
- Migrar o histórico e publicar o repositório de entrega: acontece depois do merge, fora do
  change.

## Abordagem
- Correções pequenas, cada uma no módulo que já é dono do comportamento: a regra entra em uma
  função pura de `src/lib/` com teste, e o componente só a usa.
- Para cada defeito, primeiro o teste que o reproduz (grupo 1 de `tasks.md`), depois a correção.
- As duas ilhas client novas são mínimas e ficam registradas aqui (decisões 4 e 8).
- README e registros por último, com os números finais de teste.
- Evidências e documentos deste change **não citam hash de commit**: o histórico é migrado para
  o repositório de entrega e os hashes mudam. Referência a commit é feita pelo título.

## Decisões técnicas
1. **Última ação vence entre busca e filtro** — em `FilterBar.tsx`, `pushFilter` faz
   `clearTimeout(timerRef.current)`, zera o campo (`inputRef.current.value = ""`) e ajusta
   `committedRef.current = null` antes do `router.push`. Os selects só estão habilitados fora do
   modo busca, então um filtro escolhido significa "sem busca": o texto digitado e ainda não
   enviado é descartado, e a tela fica coerente com a URL. Alternativa: enviar a busca pendente
   e ignorar o filtro (o comportamento atual, visto como defeito porque a escolha explícita some
   sem aviso). Teste em `FilterBar.test.tsx` com relógio falso: digitar, trocar o gênero antes de
   350 ms, avançar o relógio; o destino tem `genre` e não tem `q`, e não há segunda navegação.
2. **Gênero desconhecido vira o padrão (D47)** — função pura nova
   `resolveGenreId(genreId, genres)` em `src/lib/listing/resolveGenre.ts`: devolve o id se ele
   está na lista, senão `null`. `MovieResults` chama `getGenres()` (mesmo `fetch` com
   `force-cache` do `FilterBarLoader`, memoizado no render) e aplica antes de `fetchListing`; os
   hrefs da paginação saem do estado já resolvido. É a regra de `parseSort`: valor inválido vira
   o padrão, sem tela de erro. Alternativa: estado vazio "Gênero não encontrado" (mais uma tela
   para um caso que só existe com URL editada à mão). `parseListingParams` continua puro e sem
   I/O. Se `getGenres()` falhar, o erro sobe para o `error.tsx`, como já sobe o da listagem.
3. **Título da listagem segue a URL** — `src/components/movies/ListingTitle.tsx`, Server
   Component assíncrono que recebe a Promise `searchParams` e renderiza o `h1`: "Resultados da
   busca" com `q`, "Filmes populares" sem. Em `page.tsx` ele entra sob `<Suspense>` com o `h1`
   "Filmes populares" como fallback (mesmas classes: sem salto de layout). Segue o padrão de
   `MovieResults`: a página não lê a URL. O `metadata.title` da home não muda.
4. **Indicador de carregamento na paginação** — `src/components/movies/PaginationPending.tsx`
   (`"use client"`), que usa `useLinkStatus()` e fica dentro de cada `ButtonLink` de
   `Pagination`. Enquanto a navegação está pendente, mostra um indicador com `text-current`
   (sem cor literal) e um texto só para leitor de tela. `Pagination` continua Server Component e
   continua funcionando sem JavaScript. **Ilha client nova**, fora da lista do pilar 1: o motivo
   é que `useLinkStatus` só existe no client; entra em `components.md`. Conferir em
   `use-link-status.md` a exigência de ser descendente do `Link` e o comportamento com prefetch.
   É o primeiro item a cortar se algo neste change apertar: é melhoria, não defeito.
5. **Caminho de imagem validado na origem (D48)** — em `images.ts`, `isTmdbImagePath(path)`
   aceita só `^/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|svg)$`; `imageUrl` devolve `null` para o
   resto. A defesa fica no único lugar que monta URL de imagem, então protege os cards, o
   detalhe e o elenco de uma vez, venha o valor da API ou do `localStorage`. Em `store.ts`,
   `toFavoriteSnapshot` grava `posterPath: null` quando o caminho não passa (o favorito é
   mantido, sem pôster); `isFavoriteSnapshot` não muda. Alternativa: descartar o item (perde um
   favorito legítimo por causa de um campo cosmético). `store.ts` importa de `images.ts`, que é
   puro e sem `server-only`.
6. **`not-found.tsx` na raiz** — `src/app/not-found.tsx` com `EmptyState` (`icon="search"`,
   título "Página não encontrada", descrição "O endereço pode estar errado.", ação "Voltar à
   listagem" para `/`) e `metadata.title` próprio. Renderiza dentro do layout: header, tema e
   fontes iguais aos do resto. `global-not-found` não se aplica (há um layout raiz só).
7. **404 real para id inválido (D46)** — `src/proxy.ts` com `config.matcher = "/movie/:id"`
   (constante, como a doc exige). Usa `parseMovieId`, a mesma função do `MovieDetails`: id
   inválido → `NextResponse.rewrite` para um caminho sem rota, e o Next responde 404 com o
   `not-found.tsx` da raiz, antes de qualquer streaming. Id válido → `NextResponse.next()`.
   O proxy não chama o TMDB nem lê o token. Consequência visível: `/movie/abc` passa a mostrar
   "Página não encontrada" (raiz) em vez de "Filme não encontrado" (segmento), com status 404.
   O `notFound()` de `MovieDetails` para id inválido continua como segunda barreira. Verificar
   no apply com `curl -I` nos dois modos de cache; se o `rewrite` para caminho sem rota não
   devolver 404 nesta versão, a alternativa é `NextResponse.rewrite(url, { status: 404 })` para
   uma rota estática de não encontrado, e a escolha fica em "Ajustes do apply". Alternativas
   descartadas: `await params` e `notFound()` no nível da página (põe a leitura de `params` no
   shell e quebra o modo `cacheComponents`); `generateMetadata` com `notFound()` (o metadata é
   transmitido, o status já saiu).
8. **Idioma configurado de ponta a ponta nos dados** — `MovieOverview` ganha
   `fallback: boolean`, preenchido por `pickOverview` (`false` quando o texto veio no idioma
   pedido). `Overview` troca `overviewNotice(language)` por uma decisão baseada em `fallback`.
   `pickTrailer(videos, requestedLanguage)` ordena idioma pedido → `en` → outros.
   `VIDEO_LANGUAGES` vira função de `config.language` (`pt-BR` → `pt-BR,pt,en,null`; `es-ES` →
   `es-ES,es,en,null`; `en-US` → `en-US,en,null`). Com `pt-BR` o resultado é idêntico ao atual,
   e as fixtures existentes continuam valendo. O texto do aviso continua em português.
9. **Nível do título em `EmptyState`** — prop `headingLevel?: 1 | 2`, padrão `2`.
   `ErrorState` e os dois `not-found.tsx` passam `1`: nessas telas a página inteira foi
   substituída e não há outro `h1`. Os estados vazios dentro da listagem e dos favoritos ficam
   em `2`, sob o `h1` da página. Mesmas classes nos dois níveis.
10. **Skip-link** — em `layout.tsx`, primeiro elemento do `body`: link "Pular para o conteúdo"
    para `#conteudo`, visível só com foco (`sr-only focus:not-sr-only`), com `bg-surface-100`,
    `text-text-primary` e `outline-focus-ring`. O `main` ganha `id="conteudo"` e
    `tabIndex={-1}`. Sem ilha client.
11. **`engines.node`** — `"^22.22.2 || ^24.15.0 || >=26.0.0"`, a interseção do que `next`,
    `vite`, `vitest` e `jsdom` instalados declaram (quem restringe é o `jsdom`). `.nvmrc` fica
    em `22`. O README troca "qualquer Node >= 20.9 funciona" pelo intervalo real. Só a
    aplicação em produção (`next start`) rodaria em 20.9; o `npm run check` não.
12. **README: seção "Processo" (D45, revisa D8)** — seção curta, no fim, com três parágrafos:
    (a) o projeto foi desenvolvido com assistência de IA, em um fluxo em que cada etapa nasce
    de uma proposta escrita (o quê, como, tarefas e cenários) antes do código, passa por
    validação automática e revisão, e termina com evidências; as decisões e a revisão final são
    do autor; (b) o que são `.work/` (trilha de decisões: design, changes, specs) e `docs/`
    (evidências por requisito e por tarefa, incluindo capturas de tela, o que explica o volume);
    (c) o repositório de entrega foi migrado de um repositório de trabalho privado: os commits
    mantêm data e autoria originais, e os pull requests foram recriados na migração. A seção
    **não** descreve a ferramenta do fluxo, seus comandos, configuração ou agentes. A regra
    anterior ("o README trata só do código") cai porque a trilha versionada ao lado tornava a
    omissão pior do que a menção.
13. **README: demais ajustes** — clone `https://github.com/jeffersonlucindo/teste-upflow.git` e
    `cd teste-upflow`; "oito módulos" (conferir a contagem em `src/lib/tmdb/` no apply); "Quatro
    contrastes" (conferir contra a tabela de "Acessibilidade"); bloco "Em resumo" com cinco
    linhas no topo de "Decisões técnicas e trade-offs" (busca exclusiva; uma porta para o TMDB
    no servidor; URL como estado; favoritos em `localStorage` com `useSyncExternalStore`; código
    válido com e sem `cacheComponents`); parágrafo do not-found reescrito (404 real para id
    inválido, 200 para filme inexistente e por quê); `TMDB_LANGUAGE` descrito como idioma dos
    dados; "Melhorias futuras" sem os itens resolvidos aqui; contagens de teste atualizadas.
14. **Registros** — `.work/design/decisoes.md`: D8 revisada (só `.work/` é versionado; README
    tem "Processo") e D45–D48 novas. `.work/config.yaml > context`: regra de README e a linha
    sobre o que é versionado. `.work/design/components.md`: `ListingTitle`, `PaginationPending`,
    `EmptyState.headingLevel`, not-found da raiz. `.work/design/README.md:100-101` e
    `eslint.config.mjs` (comentário): sem citar pasta ou ferramenta que não é entregue.
15. **Referências ao ferramental local** — nos arquivos listados em `tasks.md` 8.3, a menção ao caminho
    é trocada por "ferramental local, não versionado" (ou removida quando a frase só existia por
    causa dela). O sentido histórico do registro é mantido; nenhum resultado de evidência muda.
    `.work/prompts/explore-inicial.md` sai do repositório: é um roteiro de sessão, não uma
    decisão do projeto.
16. **Arquivar o `setup-catalogo`** — mover `.work/changes/setup-catalogo/` para
    `.work/changes/archive/2026-10-07-setup-catalogo/`, `phase: finish` no `.devflow.yaml`, e
    corrigir os caminhos nos arquivos que o citam (lista em `tasks.md` 8.4). A spec
    `projeto-base` é sincronizada em `.work/specs/` se ainda não estiver.
17. **E2E** — `e2e/correcoes-entrega.spec.ts` para o que é novo (corrida, gênero desconhecido,
    título na busca, pôster adulterado, `/naoexiste`, skip-link); `e2e/detalhe-filme.spec.ts`
    ajustado nos casos de id inválido (status 404 e título da raiz); `e2e/shell.spec.ts` se o
    skip-link mudar a ordem de foco que ele confere. Regras de `qa.default.dimensions.e2e`.

## Riscos / Trade-offs
- O `rewrite` do proxy pode não devolver 404 como esperado nesta versão → verificação com
  `curl -I` é critério da task; alternativa registrada na decisão 7.
- O proxy passa a rodar em toda requisição de `/movie/:id` → faz só um teste de regex, sem I/O;
  o matcher não cobre `_next`, imagens nem as outras rotas.
- `/movie/abc` muda de "Filme não encontrado" para "Página não encontrada" → aceito: o status
  correto vale mais que a mensagem específica, e o caso só existe com URL digitada errada.
- `getGenres()` em `MovieResults` acrescenta uma dependência à listagem → mesma requisição já
  feita e cacheada pela barra de filtros; falha dela já derrubava a barra.
- Descartar o texto digitado ao escolher um filtro pode surpreender → é o comportamento
  coerente com a busca exclusiva, e o campo vazio mostra o que aconteceu.
- Regex de caminho de imagem estrita demais esconderia um pôster legítimo → conferir contra as
  fixtures de `src/lib/tmdb/fixtures/` e contra a listagem real no E2E.
- Reescrever menções em evidências antigas altera registros históricos → só o caminho citado
  muda, nunca o resultado; a regra fica na decisão 15.
- Decisões para o README: 1 (última ação vence), 2, 5, 7, 8, 11 e 12, nos parágrafos da área
  correspondente.

## Ajustes do apply
- **Reprodução (task 1.1).** Com `next dev`: `/naoexiste` respondia 404 com a tela padrão em inglês ("could not be found"); `/movie/abc` e `/movie/999999999` respondiam 200; `/?genre=999999` mostrava "Nenhum filme encontrado". A corrida do `FilterBar` e o `posterPath` adulterado foram reproduzidos por teste que falhava antes da correção (`FilterBar.test.tsx`, dois casos; `store.test.ts`, cinco casos), não por inspeção manual no browser. Os testes de `images.ts` e `resolveGenre.ts` foram escritos junto da correção, sem rodada vermelha antes.
- **Decisão 7 (proxy).** O `rewrite` para um caminho sem rota (`/_nao-encontrado`) devolveu 404 nos dois modos de cache; a alternativa com `status` explícito não foi necessária. `curl -I` em `next start`: 404 em `/movie/abc`, `/movie/0603`, `/movie/0` e `/movie/603abc`; 200 em `/movie/603` e em `/movie/999999999`; também 404 em `/naoexiste` e `/movie`. Com a flag, o `next start` precisa da mesma variável do build, senão a rota dinâmica responde 500 (`DYNAMIC_SERVER_USAGE`); com a variável nos dois, tudo igual ao modo padrão.
- **Decisão 2 (gênero).** `getGenres()` só é chamado em `MovieResults` quando a URL traz `genre`. O `FilterBar` também aplica `resolveGenreId` ao estado lido da URL: sem isso, o próximo filtro escolhido levaria o id desconhecido adiante nos links.
- **Decisão 8 (idioma).** `MovieOverview.fallback` é obrigatório; as asserções existentes de `pickOverview`, `mappers` e dos fixtures de componentes ganharam a chave `fallback` (valores esperados iguais, `false` com `pt-BR` e `true` nos fallbacks). `overviewNotice` passou a receber a sinopse inteira. `VIDEO_LANGUAGES` saiu de `client.ts` (que é `server-only`) e virou `videoLanguages(language)` em `params.ts`, puro e testado. Os testes existentes de `pickTrailer` seguem inalterados por um alias local que fixa `pt-BR`.
- **Decisão 10 (skip-link).** O padding do link só vale com foco (`focus:px-4 focus:py-3`); com o padding fixo ele deixava de ser invisível sem foco. O `main` leva `focus:outline-none`, por ser alvo de foco programático.
- **Decisão 9 (`h1`).** Como `EmptyState` mantém as mesmas classes nos dois níveis, o `h1` de "Página não encontrada" usa a fonte do corpo, e o E2E não confere `--font-heading` nele.
- **E2E.** O teste "gênero sem resultado mostra Limpar filtros" de `listagem-filmes.spec.ts` foi removido: com a decisão 2, `/?genre=999999` deixou de produzir o estado vazio, que agora só apareceria com um gênero real sem filmes. O estado "Limpar filtros" continua no código e sem cobertura de ponta a ponta. O cenário do gênero desconhecido está em `correcoes-entrega.spec.ts`. Em `detalhe-filme.spec.ts`, os ids inválidos esperam 404 e a tela da raiz, e o filme inexistente confere 200 e `h1` único. O teste da corrida foi quebrado de propósito (sem o cancelamento do timer) e ficou vermelho; o código foi restaurado.
- **Decisão 11 (`engines`).** `npm install --package-lock-only` acrescentou entradas opcionais não relacionadas (`@emnapi`); foi descartado e o `package-lock.json` recebeu só a mudança do bloco `engines` da raiz, à mão.
- **Registros (8.3 e 8.4).** As linhas com o comando do gerador de HTML viraram "(com o ferramental local, não versionado)". O comentário de `eslint.config.mjs` perdeu a menção ao nome do fluxo. Ao arquivar o `setup-catalogo`, a spec `projeto-base` foi copiada (idêntica) para `.work/specs/projeto-base/`, porque ainda não estava sincronizada.
- **README.** O texto de "Dois contrastes" virou "Quatro contrastes" com os quatro pares da tabela de "Acessibilidade". No checklist de teclado, em vez de reobservar as quatro telas à mão, entrou a nota de que o primeiro Tab foca o skip-link, conferida pelo E2E.
- **Decisão 8 (`lang` da sinopse).** O aviso segue `fallback`, mas o atributo `lang` do parágrafo segue o idioma do texto contra o do documento: sinopse em qualquer idioma diferente de `pt` leva `lang`, mesmo sem aviso (por exemplo `TMDB_LANGUAGE=es-ES` com a sinopse em espanhol dentro de `<html lang="pt-BR">`).
- **QA, iteração 1.** O ponto de `PaginationPending` saiu do fluxo (posicionamento absoluto na folga do `px-5`, com o link `relative`): o rótulo fica centrado e a largura do botão não muda, com ou sem indicador. A escolha do estado vazio da listagem virou a função pura `resolveEmptyState` (`src/lib/listing/emptyState.ts`), usada por `MovieResults` e testada.
- **Contagem de tasks.** `total_tasks` é 23 (o `tasks.md` tem 23 itens).
