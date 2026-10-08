# Design — readme-entrega

## Contexto
Ao fim do `detalhe-filme` o repositório tem os cinco changes anteriores aplicados e finalizados:
o projeto Next.js 16.4 do `setup-catalogo` (shell, Design System no `@theme`, `Button`/`ButtonLink`,
Vitest 5, `scripts/check-tokens.mjs`, toggle `CATALOGO_CACHE_COMPONENTS`, `.env.example`), a porta
TMDB em `src/lib/tmdb/` com a sonda `scripts/tmdb-probe.mjs` (`tmdb-client`), a listagem em `/`
com `src/lib/listing/`, `src/lib/format/`, `src/components/movies/` e `src/components/ui/`
(`listagem-filmes`), os favoritos em `src/lib/favorites/` e `src/components/favorites/`
(`favoritos`) e o detalhe em `src/app/movie/[id]/` e `src/components/movie-detail/`
(`detalhe-filme`). Nenhum arquivo de `src/` muda neste change.

`README.md` está no estado que o pilar 8 produz: o esqueleto do `setup-catalogo` (decisão 14 do
design dele: título e uma frase com o aviso "Estado atual"; "Como rodar"; "Scripts"; "Flags";
"Estrutura" com pastas "previsto"; "Processo"; "Decisões técnicas e trade-offs" com D1–D11, D33,
D34 e D40, um parágrafo por decisão iniciado por `**D<n>.**`; "Melhorias futuras" vazio) mais o que
cada finish acrescentou, conforme a lista "Decisões para o README" ao fim de "Riscos / Trade-offs"
de cada `design.md`:
- `tmdb-client` (decisão 14 e task 6.1): D12, D13, D15, D16, D17, D18, D19, D20, D21, D23 com o
  resultado da sonda em D18/D19; a linha da sonda em "Como rodar"; a subseção "Segurança do
  token"; "type guard mínimo" em "Melhorias futuras".
- `listagem-filmes`: D14, D17, D21, D22, D23, D24, D25, D26, D27, D28, D35, D36, D37, D42.
- `favoritos`: D29, D30, D31, D32, D36, D43, mais a nota do `FavoriteButton` sem adaptador.
- `detalhe-filme`: D18, D19, D21, D23, D35, D36, D37, D38, D39, D40, D42, D43, mais as notas sobre
  `generateMetadata` memoizada e transmitida, status HTTP do not-found em streaming e ausência de
  `generateStaticParams`.

Consequências desse acúmulo, confirmadas na leitura dos cinco designs: dez ids têm mais de um dono
(D17, D18, D19, D21, D23, D35, D36, D37, D42, D43) e por isso dois ou três parágrafos; D41 não tem
dono no README (a coluna "Onde" de `decisoes.md` aponta para `.work/backlog.md`); D43 e D34 apontam
para `readme-entrega` ("O que ficou de fora" e "Acessibilidade"); "Como rodar" diz que "nenhuma
página chama o TMDB"; "Processo" vem antes de "Decisões". `.work/backlog.md` linha 6 fixa o critério
de pronto: clone limpo + `npm ci` + `.env.local` + `npm run dev` funcionando; README com execução,
decisões D1–D43 consolidadas, trade-offs, flags, processo, melhorias futuras; checklist de teclado,
contraste e 390/1280 px; repositório compartilhado.

Registros em `.work/` que os applies anteriores fazem e que o README precisa refletir (conferidos
na task 1.3, não refeitos aqui): `decisoes.md` D17/D18/D19 e a tabela "Pendências de verificação"
com o resultado da sonda (task 5.5 do `tmdb-client`) e D30 com `voteCount` (task 7.1 do
`favoritos`); `components.md` com `ListingTransition` (`components/movies/`), `ErrorState` em
`components/ui/` e `MovieCardData` com os oito campos, inclusive `posterPath`/`releaseDate` (task 9.1
do `listagem-filmes`), `FavoriteButton` com `movie: FavoriteMovie` e `FavoriteSnapshot` com
`voteCount` (task 7.1 do `favoritos`), `BackLinkLoader` e `MovieDetails`/`MovieHeader` sem `from?`
(task 7.1 do `detalhe-filme`);
`backlog.md` com L1–L7 `done` pelos finishes 1–5.

Fontes deste change: `DESAFIO.md › Entrega` (README obrigatório com execução, decisões e
trade-offs; compartilhamento pelos dois e-mails; plataforma à escolha) e `› Avaliação`;
`.work/config.yaml` (`providers.git_host: github` com `org`, `repo`, `remote: origin` e `host_hint`;
bloco `git`: features em `feature/<change>` a partir de `origin/develop`, PR para `develop`, `main`
só recebe promoções de `develop`; `apply.validation`
com cinco comandos e build sem token e sem rede; `layout.docs_root: docs` para as evidências;
pilares 7 e 8); `.work/design/tokens/README.md › Acessibilidade` (seis pares de contraste medidos:
15,8 · 12,2 · 6,2 · 10,4 · 3,1 · 1,7); `.work/design/components.md › Acessibilidade`. Não há tela
nem código: o hook `design_context` não se aplica; `architecture` e `naming` servem só para
descrever a estrutura final com os nomes reais.

Das "Perguntas em aberto" de `decisoes.md`, a plataforma do remoto já foi resolvida em 2026-10-07
(GitHub, `jeffersonlucindo/desafio-up-flow`, privado, `main` + `develop`); a task 5.1 só executa a
promoção e o compartilhamento e o finish anota a data. O dia da contagem não muda o conteúdo.

## Objetivos
- [#L8] fechado: README que cumpre `DESAFIO.md › Entrega` e a linha 6 do backlog, com execução
  verificada em clone limpo, D1–D43 consolidadas por área (decisão, alternativas, trade-off, uma
  vez cada), flags, estrutura, testes, acessibilidade com checklist executado (teclado, contraste,
  390 px e 1280 px nas três telas), "O que ficou de fora", "Melhorias futuras" e "Processo".
- Cada afirmação do README verificada neste apply ou lida da evidência de um finish anterior;
  nada copiado de `decisoes.md` sem conferir no código.
- Repositório publicado e compartilhado com marcos.oliveira@upflow.me e mario.morais@upflow.me.
- `apply.validation` verde ao final (nada em `src/` muda) e a conferência final com
  `CATALOGO_CACHE_COMPONENTS=1` (pilar 7, D42).

## Não-objetivos
- Código de aplicação, scripts, dependências, `next.config.ts`, `.env.example`, `package.json`.
- Reabrir decisões (nenhum D<n> muda); refazer registros de `components.md`/`decisoes.md` que
  pertencem aos applies anteriores (conferidos; completados só se faltarem, como registro daquele
  change, com nota na evidência).
- Deploy; CI; domínio; badges (a plataforma do remoto já está decidida: GitHub).
- Specs (decisão 11); documentação além do README (sem `CONTRIBUTING`, sem wiki; `docs/` é da
  fase evidence); README em inglês; capturas de tela dentro do README (ficam na evidência).
- Correções de acessibilidade descobertas pelo checklist (subir `border-strong`, mover o foco ao
  remover um favorito, lite embed): registradas em "Acessibilidade"/"Melhorias futuras", não
  feitas (D34, D38, D43).

## Abordagem
- Consolidar, não reescrever do zero: o texto dos parágrafos existentes (escritos por cada finish
  com o `design.md` do change na mão) é a base; este change reorganiza por área, funde as
  duplicatas mantendo as facetas de cada change (lado da API × lado da UI), corrige remissões e
  completa o que falta. Prioridade de fonte para cada parágrafo: README já escrito pelo finish >
  `design.md` do change > `decisoes.md`; números (`revalidate`, debounce, chave do `localStorage`,
  limites) conferidos no código.
- Verificar antes de afirmar: tudo que o README diz que "funciona" vem de uma task deste apply
  (clone limpo, checklist, build nos dois modos) ou da evidência de um finish anterior (resultado
  da sonda, status do not-found por modo, caminho do `generateMetadata`, cortes de D43).
- Ordem das tasks: inspeção → seções do README que não dependem de medição → checklist (precisa do
  `next dev`) → seções que dependem do checklist → clone limpo seguindo o README recém-escrito →
  entrega → validação. O README é escrito antes do clone para que o clone teste o texto final.
- Estilo fixado pelo `setup-catalogo` e mantido: pt-BR com acentuação, prosa curta, um parágrafo
  por decisão iniciado por `**D<n>.**`, sem emoji, comandos em bash e PowerShell quando a sintaxe
  difere, links relativos para arquivos do repo, nenhum token real.

## Decisões técnicas
1. **Estrutura final do README** (placement: `README.md` na raiz; aplica L8 e o pilar 8) — ordem,
   conteúdo e o que cada seção absorve do esqueleto e dos finishes:
   | # | Seção | Conteúdo | Absorve |
   |---|---|---|---|
   | 1 | `# Catálogo.` | uma frase e o link para `DESAFIO.md` | título do esqueleto; sai o bloco "Estado atual" |
   | 2 | Rotas e requisitos | tabela rota × requisito (L2–L7) × o que faz: `/` (L2–L5 e o coração de L7), `/movie/[id]` (L6 e o botão de L7), `/favoritos` (L7) | nova: mapeia o enunciado ao código em dez linhas |
   | 3 | Como rodar › Segurança do token | pré-requisitos; `git clone`; Node 22; `npm ci`; `.env.local` (bash e PowerShell); token; `npm run dev`; parágrafo "Sem token"; sonda opcional; subseção D12 | "Como rodar" do esqueleto + linha da sonda e "Segurança do token" do `tmdb-client` |
   | 4 | Scripts | tabela dos scripts npm + o comando da sonda | esqueleto |
   | 5 | Flags | `CATALOGO_CACHE_COMPONENTS`: o que liga, por que desligado, como testar, o que muda no resumo do build, status do not-found em streaming | esqueleto + notas dos changes 3 e 5 |
   | 6 | Estrutura › Fronteira server × client | árvore final de `src/` e `scripts/`; ilhas client nomeadas; porta única `client.ts`; remissão a `components.md` | esqueleto, sem "previsto" |
   | 7 | Decisões técnicas e trade-offs › Trade-off principal › A. Stack e scaffold › B. Dados (TMDB) › C. Estado › D. UI e Design System › E. Processo | 43 parágrafos (decisão 2) | esqueleto + cinco finishes |
   | 8 | Testes | o que tem teste unitário por domínio, o que não tem e por quê, totais da execução | D7 do esqueleto + as decisões de testes dos quatro designs |
   | 9 | Acessibilidade › Checklist executado | práticas do app, D34 por extenso, limites conhecidos, tabela do checklist | D34 do esqueleto + checklist deste change |
   | 10 | O que ficou de fora | busca multipágina (D14 c), itens de D43 efetivamente cortados, não-objetivos deliberados | nova (D43 › "Onde") |
   | 11 | Melhorias futuras | lista consolidada com o change de origem | esqueleto (vazio) + "type guard" do `tmdb-client` + D38 + anotações dos designs |
   | 12 | Processo › Como foi criado › Entrega | devflow-core no Claude Code; `.work/` e o ferramental local (não versionado); os seis changes na ordem; fluxo de branches (`feature/<change>` → PR → `develop` → `main`); evidências; D8; D3; GitHub (URL) e data do compartilhamento | "Processo" do esqueleto + D41 + entrega |
   "Processo" vai para o fim (no esqueleto vinha antes de "Decisões") porque quem avalia precisa
   primeiro rodar, depois entender a arquitetura e só então o método; "Rotas e requisitos" entra
   logo após o título porque é o índice do enunciado. "Como foi criado" (D3, coluna "Onde" de
   `decisoes.md`) vira subseção de "Processo", e não seção própria: são duas frases. Alternativas
   descartadas: manter as cinco levas com um índice no topo (não dedupla nem corrige remissões);
   um arquivo por área em `docs/` (o enunciado pede *um* README e `docs/` é das evidências);
   tabela única com as 43 decisões (ilegível em Markdown com três colunas de prosa).
2. **Mapa D1–D43 → seção e regra de fusão** (regra de `artifacts.design`: listar as decisões que
   vão para o README; aqui são todas):
   | Seção | Decisões | Dono(s) anteriores no README |
   |---|---|---|
   | Trade-off principal | D14, D13 | `listagem-filmes` (UI de D14), `tmdb-client` (API de D13 e D14) |
   | A. Stack e scaffold | D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11 | `setup-catalogo` (parágrafos já no README; D2 remete a Flags, D7 a Testes, D8 a Processo, D3 a "Como foi criado") |
   | B. Dados (TMDB) | D12, D15, D16, D17, D18, D19, D20, D21, D22, D23 (D13 e D14 ficam no trade-off principal, com remissão) | `tmdb-client` (D12, D15–D21, D23), `listagem-filmes` (D17 UI, D21 UI, D22, D23 `w342`), `detalhe-filme` (D18 UI, D19 UI, D21 UI, D23 `w500`/`w185`) |
   | C. Estado | D24, D25, D26, D27, D28, D29, D30, D31, D32 | `listagem-filmes` (D24–D28), `favoritos` (D29–D32) |
   | D. UI e Design System | D33, D34, D35, D36, D37, D38, D39, D40 | `setup-catalogo` (D33, D34, D40), `listagem-filmes` (D35–D37), `favoritos` (D36), `detalhe-filme` (D35–D40) |
   | E. Processo | D41, D42, D43 | nenhum (D41); `listagem-filmes` e `detalhe-filme` (D42); `favoritos` e `detalhe-filme` (D43) |
   | Segurança do token | remissão a D12 | `tmdb-client` |
   | Testes | remissão a D7 + inventário | `setup-catalogo`; decisões 12 (`tmdb-client`), 16 (`listagem-filmes`), 12 (`favoritos`), 16 (`detalhe-filme`) |
   | Acessibilidade | D34 por extenso, D35 (remissão), checklist | `setup-catalogo`, `readme-entrega` |
   | O que ficou de fora | D43 (remissão), D14 (c) | `readme-entrega` |
   | Melhorias futuras | D38 (remissão) + lista | `detalhe-filme`, `tmdb-client`, `listagem-filmes`, `favoritos` |
   | Processo | D8, D41, D42 (remissões), D3 | `setup-catalogo`; D41 pela primeira vez |
   Cobertura: A tem 11 ids (D1–D11), B tem 10 mais os 2 do trade-off (D12–D23), C tem 9
   (D24–D32), D tem 8 (D33–D40), E tem 3 (D41–D43): 43. Regra de fusão: um id com mais de um dono
   vira **um** parágrafo na forma "decisão (lado da API ou do dado) · consequência na UI", com o
   change que aplicou cada faceta entre parênteses; um id nunca aparece em duas seções; onde outra
   seção detalha (D12 → "Segurança do token", D7 → "Testes", D34 → "Acessibilidade", D43 → "O que
   ficou de fora", D38 → "Melhorias futuras", D2 → "Flags", D8 e D41 → "Processo"), o parágrafo da
   área tem a decisão em duas frases e a remissão. A revisão final confere com
   `grep -oE '\*\*D[0-9]+\.' README.md | sort -u | wc -l` igual a 43 e `sort | uniq -d` vazio.
3. **Forma de cada parágrafo de decisão** — `**D<n>. <Título curto>.** Decisão. Alternativa(s)
   descartada(s). O que se ganha e o que se perde. (change que aplicou)`. É o formato que o
   `setup-catalogo` fixou em D1–D11 e que os finishes seguiram; mantido para o avaliador ler os 43
   do mesmo jeito. Os parágrafos de D1–D11, D33, D34 e D40 já escritos são mantidos com ajustes de
   remissão; os dos finishes 2–5 são fundidos pela regra da decisão 2. Fatos que só a evidência de
   um finish tem e que o README precisa citar: resultado real da sonda para D18 (`translations` via
   `append_to_response`: confirmado em uma chamada, ou fallback com segunda chamada `language=en-US`
   quando `overview` vem vazia) e D19 (`include_video_language`: com efeito, sem efeito observável,
   ou fallback `/movie/{id}/videos?language=en-US`); status HTTP observado do not-found com e sem a
   flag (task 6.2 do `detalhe-filme`); qual caminho de `generateMetadata` ficou (dinâmica
   transmitida ou `metadata` estática "Filme", risco do `detalhe-filme`); o que de D43 foi
   efetivamente cortado em cada change (testes de componente cortáveis, contagem de resultados,
   `next/image`). A task 1.3 lê tudo isso antes de escrever.
4. **"Como rodar" verificado em clone limpo** (critério 1 da linha 6 do backlog; D4) — a
   sequência exata do README é a sequência executada na task 4.1, nesta ordem: pré-requisitos (Git,
   Node 22 pelo `.nvmrc` — qualquer `>= 20.9` funciona —, npm); `git clone <url>` e `cd`; `npm ci`;
   `cp .env.example .env.local` (PowerShell: `Copy-Item .env.example .env.local`); preencher
   `TMDB_API_READ_TOKEN` com o API Read Access Token v4 de `themoviedb.org/settings/api`;
   `npm run dev`; `http://localhost:3000`. Parágrafo "Sem token": em desenvolvimento, `/` e
   `/movie/<id>` mostram o estado de erro com a mensagem que nomeia `TMDB_API_READ_TOKEN` (D21; em
   produção o texto é genérico), `/favoritos` funciona, e `npm run build`, `npm run check` e a
   validação inteira passam sem `.env.local` e sem rede (pilar 7). Linha da sonda como diagnóstico
   opcional: `node --env-file=.env.local scripts/tmdb-probe.mjs` imprime o resumo das três
   chamadas sem exibir o token (`tmdb-client` decisão 13). O clone limpo é feito de
   `git clone -b develop "$(pwd)" <tmp>` porque o apply acontece antes da fase commit e, pelo fluxo
   de `config.yaml > git`, os changes 1–5 estão integrados em `develop` (ainda não promovidos a
   `main`); o `README.md` em edição é copiado por cima (não altera comportamento). O finish pode
   repetir o clone de `origin/main` depois da promoção (task 5.1); o critério do backlog é o deste
   apply. Alternativa descartada: `npm install` nas instruções (ignora o lockfile; D4 fixou
   `npm ci`).
5. **Flags** (D2, D42) — a seção mantém a tabela do esqueleto e ganha o que os changes 3 e 5
   observaram: o que a flag liga (`cacheComponents` + `partialPrefetching`, juntos porque o
   segundo sem o primeiro falha a validação do config); por que desligada por padrão
   (previsibilidade, build offline, código escrito na interseção dos dois modelos, sem
   `"use cache"` nem `cacheLife`); como testar (build e `next dev` em bash e PowerShell, ou a
   variável no `.env.local`, lido antes de o `next.config.ts` ser avaliado); o que muda no resumo
   do build (`/` e `/movie/[id]` passam de `ƒ` para `◐` ou o símbolo registrado na evidência do
   `detalhe-filme`; `/favoritos` é `○` nos dois modos; nenhum fetch no build em nenhum modo, porque
   `connection()`, `await searchParams` e `await params` ficam sob `<Suspense>` e não há
   `generateStaticParams`); e a nota do not-found em streaming (com a flag o shell já saiu com 200
   e a UI de not-found chega no buraco com `noindex`; o valor observado por modo vem da evidência).
6. **Trade-off principal: busca exclusiva** (D14, D13; destaque no topo de "Decisões") — a
   escolha mais visível para quem usa o app merece a primeira subseção, antes das áreas:
   `/search/movie` só aceita `query, page, language, region, year, primary_release_year,
   include_adult` (referência oficial), então gênero e ordenação não se aplicam à busca; com `q`
   preenchido os dois selects ficam desabilitados com o hint "Gênero e ordenação não se aplicam à
   busca por título (limitação da API)." e saem da URL (o parser faz `/?q=m&genre=28` virar busca
   pura). Alternativas: (a) filtrar e ordenar localmente a página de 20 (páginas quase vazias com
   "Próxima" ativo; reordenar por nota um conjunto ordenado por relevância); (c) buscar até três
   páginas, filtrar e paginar localmente (melhor produto; ficou de fora por prazo, D43, e está em
   "O que ficou de fora"). Na mesma subseção, D13: "populares" é `/discover/movie` com
   `sort_by=popularity.desc` e `include_adult=false`, não `/movie/popular`, para que filtro e
   ordenação componham num caminho só; a ordem difere um pouco do endpoint oficial. Os dois ids
   ficam só aqui; B. Dados remete.
7. **"Segurança do token"** (D12; subseção de "Como rodar") — fica onde o token é configurado,
   e não na área de dados, porque é o que o avaliador procura ao colar o token: Bearer no header
   `Authorization` (nunca `api_key` na URL, que vaza em log); lido em `src/lib/tmdb/client.ts` na
   chamada, único módulo com `import "server-only"` — importar o cliente de um client component
   falha o build (guardrail de D12); nunca `NEXT_PUBLIC_`; `.env.local` ignorado pelo git
   (`.env*` com exceção de `.env.example`); a sonda não imprime o token. O parágrafo D12 em B. Dados
   tem a decisão e remete para cá.
8. **"Testes"** (D7) — seção própria porque o critério do backlog e o pilar 3 tornam o inventário
   relevante e porque o esqueleto só tinha a regra. Conteúdo: o que tem teste unitário, por domínio
   (`lib/tmdb`: `errors`, `params`, `images`, `pickOverview`, `pickTrailer`, `mappers` com fixtures,
   `parseMovieId`;
   `lib/listing`: `params`, `backHref`; `lib/format`: `rating`, `releaseYear`, `runtime`,
   `languageName`, `movieMeta`; `lib/favorites`: `store`, `useFavorites`; componentes: `NavLink`,
   `Button`, `FilterBar`, `Pagination`, `Overview` e os cortáveis que não foram cortados —
   `MovieCard`, `EmptyState`, `FavoriteButton`, `FavoritesBadge`, `FavoritesList`, `CastList`,
   `TrailerEmbed`, `MovieHeader` — lidos do repositório na task 1.2); o que não tem e por quê
   (async Server Components não rodam no Vitest: `MovieResults`, `FilterBarLoader`,
   `MovieDetails`, `BackLinkLoader`, páginas, `error.tsx`, `not-found.tsx`; `client.ts` importa
   `server-only`) e como esses são verificados (critérios de browser das tasks de cada change; a
   sonda exercita as mesmas URLs do cliente); os totais de arquivos e de testes da execução de
   `npm run test` na validação. Alternativa descartada: relatório de cobertura (não há `coverage`
   configurado; adicionar seria código deste change).
9. **"Acessibilidade" com o checklist executado** (D34; D35 por remissão; critério 3 da linha 6)
   — a seção diz o que o app faz (elementos nativos; `label` envolvendo `input`/`select`; `form
   role="search"`; `nav aria-label`; `ul role="list"`; `aria-pressed` no favorito; `aria-current`
   na nav; `aria-label` só em botão com ícone; `aria-busy` na região em transição; `role="status"`
   nos skeletons; `aria-describedby` do hint; `lang` na sinopse em outro idioma; `title` no iframe;
   `figure`/`figcaption`; um `h1` por página; foco visível global em `focus-ring`; controles com
   44 px e o coração de 40 px do protótipo), D34 por extenso e os limites conhecidos (foco vai
   para o `body` ao remover um card em `/favoritos`; flash do coração após hidratar; setas num
   `<select>` fechado disparam uma navegação por tecla no Windows — comportamento nativo, a
   registrar se observado). Checklist, uma linha por item e por tela, com data e resultado:
   - **Teclado** (ordem esperada, lida de `components.md` e dos designs): `/` — logo → Explorar →
     Favoritos → campo de busca → Gênero → Ordenar por → por card: link do pôster → coração → link
     do título → Anterior → Próxima; em modo busca os selects são pulados (`disabled`); Enter no
     campo aplica a busca. `/movie/603` — logo → nav → "Voltar à listagem" → "Adicionar aos
     favoritos" → iframe do trailer. `/favoritos` — logo → nav (Favoritos com "N favoritos" no
     nome) → por card: pôster → coração → título; Espaço/Enter no coração alterna `aria-pressed` e
     o rótulo. Estados: "Tentar novamente" e as ações do `EmptyState` focáveis. Anel âmbar visível
     em todos.
   - **Contraste** (pares em uso, calculados pela fórmula WCAG 2.1 a partir de `tokens.json`;
     confirmados no devtools na task 3.2; os seis da tabela de `tokens/README.md` são repetidos):
     | Par (uso) | Esperado | Limite |
     |---|---|---|
     | `text-primary` / `bg-base` (títulos, texto corrente de botões neutros) | 15,8:1 | 4,5:1 |
     | `text-primary` / `surface-100` (input, select, nav ativa, título do `EmptyState`) | 14,1:1 | 4,5:1 |
     | `text-primary` / `surface-200` (chip de nota) | 12,9:1 | 4,5:1 |
     | `text-primary` / `border-subtle` (badge de contagem) | 11,7:1 | 4,5:1 |
     | `text-primary` / `bg-overlay` (coração inativo sobre o pôster, ícone) | 15,3:1 | 3:1 |
     | `text-secondary` / `bg-base` (sinopse) | 12,2:1 | 4,5:1 |
     | `text-muted` / `bg-base` (labels, meta do card, nav inativa, "Página X de N", hint, aviso de idioma) | 7,6:1 | 4,5:1 |
     | `text-muted` / `surface-100` (placeholder, descrição do `EmptyState`, "Carregando gêneros…") | 6,8:1 | 4,5:1 |
     | `text-muted` / `surface-200` | 6,2:1 | 4,5:1 |
     | `accent` / `bg-base` (hover do título e do "Voltar", ponto do logo, anel de foco) | 10,4:1 | 4,5:1 (texto) · 3:1 (anel) |
     | `on-accent` / `accent` (botões primários, coração ativo no botão `full`) | 10,4:1 | 4,5:1 |
     | `accent` / `bg-overlay` (coração ativo sobre o pôster, ícone) | medir (≈ 10:1) | 3:1 |
     | `text-subtle` / `surface-200` (rótulos "Pôster"/"Foto", `aria-hidden`) | 3,1:1 | herdado, D34 |
     | `border-strong` / `bg-base` (borda do botão outline) | 1,7:1 | herdado, D34 |
     | `border-subtle` / `bg-base` e `surface-100` / `bg-base` (contorno e fundo de input/select) | 1,4:1 e 1,1:1 | herdado; não citado em D34 |
     O último par é um registro novo, não uma reabertura de D34: D34 trata de `text-subtle` e
     `border-strong`; a borda dos inputs usa `border-subtle`, ainda mais baixa. O README diz que o
     campo é identificado pelo `label` visível acima, pelo placeholder e pelo anel de foco de
     10,4:1, e lista subir a borda como melhoria; corrigir mudaria o visual do protótipo, mesmo
     motivo de D34.
   - **390 px e 1280 px** nas três telas (critérios das tasks 8.6 do `listagem-filmes`, 6.5 do
     `favoritos` e 6.6 do `detalhe-filme`, agora numa passada final): a 390 px nenhuma tela tem
     overflow horizontal (`document.documentElement.scrollWidth === 390`), grid de 2 colunas,
     header e `FilterBar` quebram linha, paginação quebra linha, detalhe empilha com elenco em 2
     colunas, gutter de 16 px; a 1280 px a estrutura bate com os PNGs (cinco colunas de cards no
     lugar das quatro do protótipo, consequência do `minmax(200px)` de `components.md`, registrada
     em `listagem-filmes/design.md › Riscos`; D35 não fixa o número de colunas), detalhe em duas
     colunas. Inclui skeleton,
     `EmptyState` e erro.
   Alternativa descartada: ferramenta automática (axe, Lighthouse) como critério — útil, mas
   adicionaria dependência ou passo fora do repositório; o checklist manual é o que o backlog
   pede e cabe no dia 5. Se for rodado por conveniência, o resultado entra na evidência, não no
   critério.
10. **"O que ficou de fora" e "Melhorias futuras"** (D43, D38, D14 c) — duas seções para duas
    perguntas diferentes: o que foi decidido não fazer (e por quê), e o que faria sentido fazer a
    seguir. "O que ficou de fora": busca multipágina (alternativa (c) de D14, já fora antes do
    corte); os itens da ordem de corte de D43 efetivamente cortados nos applies, lidos da
    evidência (candidatos: testes de componente cortáveis, contagem de resultados em modo busca,
    `next/image` → `<img>`), com a nota de que `?from=` e a sincronização entre abas eram
    cortáveis e foram mantidos por serem critério do backlog (linhas 4 e 5); e os não-objetivos
    deliberados dos designs: `generateStaticParams` (build sem token), route handler/proxy, retry
    automático em 429, elenco completo, galeria, semelhantes e recomendações, `og:image`,
    migração de versão do payload de favoritos, exportar/importar favoritos, contagem no `<title>`,
    skeleton em `/favoritos` antes de hidratar. "Melhorias futuras", com o change de origem: lite
    embed do YouTube (D38, `detalhe-filme`); type guard mínimo nas respostas do TMDB
    (`tmdb-client`); `resolve.alias` para `server-only` e teste de `client.ts` (`tmdb-client`);
    `genres` como Promise com `use()` no fallback do `FilterBar` (`listagem-filmes`);
    `useLinkStatus` nos links da paginação (`listagem-filmes`); validar `genre` contra a lista de
    gêneros (`listagem-filmes`); link único por card (`listagem-filmes`); `minmax(220px)` para
    quatro colunas como no protótipo (`listagem-filmes`); `useIsFavorite(id)` por botão
    (`favoritos`); mover o foco ao remover um card em `/favoritos` (`favoritos`); `MovieCardData`
    como `MovieSummary` puro (`favoritos`); texto `sr-only` no badge no lugar do `aria-label`
    (`favoritos`); `Intl.DurationFormat` quando universal (`detalhe-filme`); `og:image` com o
    pôster (`detalhe-filme`); subir `border-subtle`/`border-strong` para 3:1 (decisão 9);
    busca multipágina (D14 c). Nenhum item aparece nas duas seções.
11. **Specs: nenhuma** (regra do pilar 8: "specs só onde há comportamento com cenário — dados,
    estado"; `artifacts.specs` é opcional) — este change não acrescenta comportamento ao sistema:
    o produto é um documento e uma verificação. Os critérios verificáveis (clone limpo, cobertura
    D1–D43, checklist por tela, build nos dois modos) são critérios de task, não cenários de
    sistema, e estão em `tasks.md` grupos 2 a 4 e 6. O único comportamento de sistema que o
    change reexecuta — build sem token e sem rede, com e sem a flag — já está especificado em
    `.work/changes/archive/2026-10-07-setup-catalogo/specs/projeto-base/spec.md` ("Build sem segredos e sem rede"),
    e repeti-lo aqui seria duplicar. `specs/` fica vazia (com `.gitkeep` para a pasta existir no
    git; o render ignora arquivos que não são `.md`). Alternativa descartada: uma capability
    `documentacao-entrega` com cenários "QUANDO seguir o README num clone limpo ENTÃO
    `npm run dev` sobe" — forçaria o formato "O sistema DEVE" sobre um artefato que não é o
    sistema, e os mesmos cenários já estão como Critério nas tasks 4.1 e 2.10.
12. **"Processo", "Como foi criado" e "Entrega"** (D8, D41, D42, D3; `providers.git_host: github` e `config.yaml > git`)
    — "Processo" mantém a tabela de `.work/` e do ferramental local (não versionado) do esqueleto e ganha: o fluxo (devflow-core
    no Claude Code: propose → apply → evidence → commit → pr → finish por change), os seis changes
    na ordem de D41 com uma linha cada e o link para `.work/changes/<nome>/` (ou
    `.work/changes/archive/` se o finish arquivar; o link segue o que existir) e o `change.html`
    de cada um, as evidências em `docs/` (se existirem no momento da escrita), a validação por
    change (D42, os cinco comandos e o segundo build com a flag onde há página) e por que tudo isso
    está versionado (D8: "todo artefato será analisado"; a trilha de decisões é um artefato a
    favor; `.work/design/reference/` fora do git) e o fluxo de branches de `config.yaml > git`
    (cada change em `feature/<change>` a partir de `origin/develop`, PR para `develop`; `main` só
    recebe promoções de `develop`). "Como foi criado": D3 em duas frases (scaffold em diretório
    temporário e movido; nada copiado do bundle de referência). "Entrega": uma linha com a URL do
    repositório no GitHub (`jeffersonlucindo/desafio-up-flow`, privado) e a data do compartilhamento
    com os dois e-mails, preenchida na task 5.1. O passo de entrega segue o fluxo declarado: PR de
    `develop` para `main` (via `gh pr create --base main --head develop`), merge, `git fetch origin`
    e conferência de `origin/main`; o convite dos dois e-mails é feito em Settings › Collaborators
    do GitHub (a API e o `gh` só convidam por usuário, não por e-mail), com permissão de leitura;
    conferir no remoto que `.env.local` e `.work/design/reference/` não subiram e que o README
    renderiza. `providers.github.remote: origin` já está no config e não muda. Alternativa
    descartada: push direto em `main` (viola `git.rules`).
13. **Registro** — no apply: nada em `.work/design/` e `.work/backlog.md` por padrão (os registros
    pendentes dos applies anteriores são conferidos na task 1.3 e completados só se faltarem, com
    nota). No finish: `backlog.md` L8 → `done` (e qualquer L1–L7 ainda `doing`, com nota);
    `decisoes.md › Perguntas em aberto` recebe a data do compartilhamento na linha da plataforma
    (já resolvida); `change.html`
    regenerado (com o ferramental local, não versionado). Evidências em `docs/`
    conforme `layout` do config: saída do clone limpo, tabela do checklist com valores, resumo dos
    dois builds, registro do compartilhamento.

## Riscos / Trade-offs
- Finishes anteriores podem não ter acrescentado exatamente o que a lista "Decisões para o README"
  prometeu → a task 1.1 inventaria o README real; nada é presumido; o que faltar é escrito a
  partir do `design.md` do change.
- Resultado da sonda (D18/D19), status do not-found e caminho do `generateMetadata` são
  desconhecidos no propose → a decisão 3 descreve os dois caminhos de cada um; a task 1.3 lê a
  tabela "Resultado das verificações" do `tmdb-client` e a evidência do `detalhe-filme` antes de
  escrever B. Dados e Flags.
- README longo (estimativa: 300–350 linhas) → ordem pensada para leitura progressiva ("Rotas e
  requisitos" e "Como rodar" no topo; decisões em parágrafos curtos; "Processo" no fim); sem
  índice manual para não desatualizar.
- Clone limpo testa o README antes do commit (o apply precede a fase commit) → `git clone` do
  repositório local traz os changes 1–5; o README em edição é copiado por cima; o finish pode
  repetir após o commit.
- `border-subtle` dos inputs abaixo de 3:1 e não coberto por D34 → registrado no README como
  herdado, com a justificativa (label, placeholder e anel de foco identificam o campo) e como
  melhoria; D34 não é reaberta (corrigir mudaria o visual), mas a lacuna vai para o relatório do
  propose para o autor decidir se atualiza a linha de D34.
- Setas em `<select>` fechado disparam uma navegação por tecla (comportamento nativo do Windows
  com `onChange`) → registrado em "Acessibilidade" se observado na task 3.1; não corrigido aqui
  (seria código do `listagem-filmes`).
- Promoção `develop` → `main` é passo de entrega, não de apply → a task 5.1 abre o PR e confere
  `origin/main`; os convites são manuais (Settings › Collaborators, por e-mail); o README recebe a
  URL e a data no fim; o finish anota a data em `decisoes.md`.
- O clone limpo roda antes da promoção → clonar `-b develop`; o finish pode repetir de
  `origin/main` após o merge.
- Validação pode falhar por regressão de ambiente (`node_modules`, versão do Node) sem que nada
  em `src/` tenha mudado → investigar antes de fechar; o clone limpo da task 4.1 é o teste
  independente do ambiente local.
- "Rotas e requisitos", "Testes", "O que ficou de fora" e "Entrega" não estavam no esqueleto do
  `setup-catalogo` (decisão 14 dele) → acrescentadas por este design porque o backlog (linha 6)
  e o enunciado pedem o conteúdo; registrado como extensão, não como reabertura.
- Decisões para o README (seção "Decisões técnicas e trade-offs" e as seções nomeadas): todas,
  D1–D43, conforme a tabela da decisão 2. Este change é o consolidador: D41 e D43 ganham dono no
  README pela primeira vez; D34 ganha o checklist; D14 e D13 ganham a subseção "Trade-off
  principal".

## Ajustes do apply
Registrados em 2026-10-07, no apply. Nenhuma decisão D<n> foi reaberta.

- **O README segue a regra de `.work/config.yaml > context › README`, e não a estrutura das
  decisões 1, 2, 3 e 12 deste design.** A regra (commit `039e1b3`, D8 revisada em 2026-10-07) diz
  que o README trata só do código: sem seção "Processo", sem menção a devflow, changes, backlog,
  `.work/` ou o ferramental local, sem ids `D<n>`/`L<n>`. Os cinco finishes anteriores já a seguiram: o
  README de partida não tinha nenhum id. Consequências:
  - os parágrafos de decisão têm título em negrito, sem `**D<n>.**`; os critérios das tasks 1.1,
    2.6 e 2.10 que contam ids com `grep` não se aplicam. A cobertura das decisões é conferida pelo
    mapa abaixo;
  - "Rotas e requisitos" descreve o requisito do enunciado, sem `L<n>`;
  - as seções "Processo", "Como foi criado" e "Entrega" não existem. O scaffold (D3) é um
    parágrafo de "Stack e scaffold"; D8 e D41 não têm registro no README (são sobre o fluxo); D42
    aparece em "Testes" como o critério de pronto; D43 em "O que ficou de fora";
  - sem a subseção "Entrega", não há marcador `<plataforma>`/`<data>` para a task 5.1 substituir:
    a URL do repositório está no `git clone` de "Como rodar" e a data do compartilhamento vai para
    `decisoes.md › Perguntas em aberto` no finish;
  - a remissão a `.work/design/components.md` em "Fronteira server × client" foi trocada pela
    tabela das nove ilhas client com o motivo de cada uma.
- **Mapa decisão → seção do README** (substitui a contagem de ids):
  | Seção | Decisões |
  |---|---|
  | Trade-off principal | D14, D13 |
  | Stack e scaffold | D1, D2 (remete a Flags), D3, D4, D5, D6, D7 (remete a Testes), D44, D9, D10, D11 |
  | Segurança do token | D12 |
  | Dados (TMDB) | D12, D15, D16, D17, D18, D19, D20, D21, D22, D23 |
  | Estado | D24, D25, D26, D27, D28, D29, D30, D31, D32 |
  | UI e Design System | D33, D34 (remete a Acessibilidade), D35, D36, D37, D38, D39, D40 |
  | Testes | D7, D44, D42 |
  | Acessibilidade | D34, D35 |
  | O que ficou de fora | D43, D14 (c) |
  | Sem registro no README | D8, D41 |
- **Valores observados** (lidos do código e das evidências dos changes anteriores, não do
  propose): D18 confirmado em uma chamada (51 idiomas em `translations`); D19 com
  `include_video_language=pt-BR,pt,en,null`; página 501 responde HTTP 400; not-found do detalhe
  responde 200 com `noindex` nos dois modos; `/` e `/movie/[id]` são `ƒ` sem a flag e `◐` com
  ela, `/favoritos` é `○`; `generateMetadata` dinâmica e transmitida; nenhum item de D43 cortado.
- **Checklist (grupo 3)** executado em Chromium por script do Playwright contra `next dev`
  (não versionado), mais `npm run e2e` (114 passed). Contrastes calculados pela fórmula WCAG 2.1
  sobre os valores de `globals.css`; todos batem com a tabela da decisão 9 (`accent`/`bg-overlay`
  medido: 10,1:1). Achados novos, registrados em "Acessibilidade › Limites conhecidos" e em
  "Melhorias futuras", não corrigidos (nada em `src/` muda neste change): as telas de erro e de
  not-found não têm `h1` (o título do `EmptyState` é um `<p>`); o iframe do trailer não recebe o
  anel de foco; as setas num `<select>` fechado navegam a cada troca; o foco vai para o `body` ao
  remover um card em `/favoritos`.
- **Clone limpo (task 4.1)** feito de `feature/readme-entrega` (igual a `origin/develop` em
  `43c126f`), porque o `develop` local estava 44 commits atrás. `npm ci` em 27 s, sem `UNMET`;
  `npm run dev` serviu `/`, `/?q=matrix&page=2`, `/movie/603` e `/favoritos` com dados reais;
  `npm run build` e `npm run check` (31 arquivos, 342 testes) verdes sem `.env.local`. O
  `npm audit` aponta 5 avisos `high` em `braces`, dependência transitiva de ferramenta de
  desenvolvimento; não tratado aqui (sem mudança de dependências neste change).
- **Registros dos applies anteriores (task 1.3)**: `decisoes.md` e `components.md` completos;
  nada precisou ser completado. Os `.devflow.yaml` arquivados de `listagem-filmes`, `favoritos` e
  `detalhe-filme` ainda dizem `merge: pending`, embora os PRs 3, 4 e 5 estejam mergeados, e o
  `setup-catalogo` está em `phase: commit`, sem finish: ficam para o finish deste change decidir.
- **Tasks 5.1 e 5.2** ficam abertas no apply: dependem do merge do PR deste change e da promoção
  `develop` → `main`, e são fechadas no finish.
