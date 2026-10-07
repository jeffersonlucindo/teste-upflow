# favoritos

## Resumo:
Quarto change do catálogo: favoritos persistidos no navegador e a tela `/favoritos`
(`.work/design/screens/Favoritos.dc.html`, `screens/pdf/favoritos.png`), mais o coração de favoritar
no card da listagem (`.work/design/screens/Main.dc.html`). Cria `src/lib/favorites/` (`store.ts`:
chave `catalogo.favorites.v1`, payload `{ version: 1, items }`, type guards sem biblioteca, ordem
`savedAt` desc, `try/catch` com fallback em memória, evento `storage` entre abas; `useFavorites.ts`:
`useSyncExternalStore` com snapshot do servidor vazio e referência estável) e
`src/components/favorites/` (`FavoriteButton` com variantes `icon` e `full`, `FavoritesBadge`,
`FavoritesList`); altera `src/components/movies/MovieCard.tsx` (liga o `FavoriteButton` na posição
reservada pelo `listagem-filmes`) e `src/components/layout/Header.tsx` (badge dentro do `NavLink`
Favoritos); reescreve `src/app/favoritos/page.tsx` (RSC estático com `h1`, subtítulo e
`FavoritesList`). Entrega [#L7]. O `FavoriteButton full` fica pronto para o `detalhe-filme`; o
detalhe e o README não são tocados.

## Parent item(ns) relacionado(s):
- [#L7] Favoritos: persistência no client e página/aba que liste os favoritos. A persistência é o
  store sobre `localStorage` (D29, D30, D32) lido por `useFavorites()` sem mismatch de hidratação
  (D31); a página é `/favoritos` (tela 3 do enunciado), com a aba "Favoritos" do header mostrando a
  contagem no `FavoritesBadge`; o coração do card (`Main.dc.html`) e o botão "Adicionar aos
  favoritos" do detalhe são o mesmo `FavoriteButton` em duas variantes. "Os filmes salvos ficam neste
  navegador" (subtítulo do protótipo) é literalmente a decisão D30: nenhuma chamada ao TMDB em
  `/favoritos`, o snapshot do filme é gravado junto.

## Tasks
Ver `tasks.md`: 1) inspeção da base deixada por `setup-catalogo`, `tmdb-client` e `listagem-filmes`;
2) `src/lib/favorites/store.ts` (tipos, type guards, funções puras, store sobre `localStorage`) com
`store.test.ts`; 3) `src/lib/favorites/useFavorites.ts` com `useFavorites.test.tsx`; 4) componentes
`FavoriteButton`, `FavoritesBadge`, `FavoritesList` (com testes); 5) integração: `MovieCard`,
`Header`, `src/app/favoritos/page.tsx`; 6) verificação no browser (critério da linha 4 de
`.work/backlog.md`) e nos dois modos de `cacheComponents`; 7) registro (`components.md`,
`decisoes.md` D30, `backlog.md`); 8) validação.

## Por quê
L7 é o último requisito obrigatório da tela de listagem e tem tela própria; D41 o coloca antes do
`detalhe-filme` para que o coração nasça junto com o card e o detalhe já chegue com o botão pronto.
É também o único estado de aplicação fora da URL (pilar 4): o store próprio sobre `localStorage` +
`useSyncExternalStore` (D29) materializa o pilar sem biblioteca nem Context, e as decisões D30, D31 e
D32 (snapshot, hidratação, resiliência) ficam provadas por testes de store e de hook. O
`listagem-filmes` deixou tudo preparado: a posição do botão no `MovieCard` (irmão do `<Link>`), o
`MovieGrid` shared para `/favoritos` renderizar do lado client e o ícone `heart` do `EmptyState` para o
vazio desenhado em `Favoritos.dc.html` (D36). Uma pendência registrada pelos dois changes anteriores é
resolvida aqui, antes de a chave `catalogo.favorites.v1` ser publicada: o `FavoriteSnapshot` de D30
ganha `voteCount`, porque `MovieCardData.voteCount` é obrigatório para o card dizer "Sem nota".

## O que muda
- Nasce `src/lib/favorites/store.ts`: tipos `FavoriteMovie` (os seis campos que o botão recebe),
  `FavoriteSnapshot` (`FavoriteMovie` + `savedAt`) e `FavoritesPayload`; constantes
  `FAVORITES_STORAGE_KEY = "catalogo.favorites.v1"`, `FAVORITES_PAYLOAD_VERSION = 1`,
  `EMPTY_FAVORITES`; type guards `isFavoriteSnapshot`/`isFavoritesPayload` (sem biblioteca); funções
  puras `toFavoriteSnapshot`, `parseFavorites`, `serializeFavorites`, `sortFavorites`, `hasFavorite`,
  `toggleInFavorites`; e `createFavoritesStore(getStorage)` com o singleton `favoritesStore`
  (`getSnapshot` com cache do parse, `getServerSnapshot` constante, `write`, `toggle`, `subscribe`
  com o evento `storage`). Testes em `store.test.ts`.
- Nasce `src/lib/favorites/useFavorites.ts`: `useFavorites()` devolve `{ items, count, hydrated,
  isFavorite, toggle }` a partir de dois `useSyncExternalStore` (itens e hidratação), sem `useState`
  nem `useEffect`, passando nas regras do React Compiler do `eslint-config-next` 16. Testes em
  `useFavorites.test.tsx`.
- Nasce `src/components/favorites/`: `FavoriteButton` (client; `variant: "icon" | "full"`;
  `aria-pressed`; "Adicionar aos favoritos"/"Remover dos favoritos"; coração ativo em `accent`;
  `savedAt = Date.now()` só no handler do clique), `FavoritesBadge` (client; `null` até hidratar e
  quando o total é 0; `aria-label="N favoritos"`), `FavoritesList` (client; nada antes de hidratar,
  `EmptyState` com os textos do protótipo e ação "Explorar filmes" quando vazio, `MovieGrid` com os
  snapshots em `savedAt` desc quando há itens).
- `src/components/movies/MovieCard.tsx` é alterado: `<FavoriteButton movie={movie} variant="icon" />`
  entra na posição marcada (irmão do `<Link>` do pôster, `absolute top-2.5 right-2.5`), e
  `MovieCardData` ganha os campos de origem `posterPath` e `releaseDate` (copiados por
  `toMovieCardData`), que o botão precisa para montar o snapshot. `MovieCard` continua shared;
  `MovieCard.test.tsx` é ajustado.
- `src/components/layout/Header.tsx` é alterado: `<FavoritesBadge />` entra como `children` do
  `NavLink` de Favoritos (o slot previsto pelo `setup-catalogo`).
- `src/app/favoritos/page.tsx` é reescrito: continua RSC estático (nenhum fetch, nenhuma leitura de
  request), com `h1` "Meus favoritos", `p` "Os filmes salvos ficam neste navegador." e
  `<FavoritesList />`; `metadata.title` mantido.
- Fora de escopo: rota `/movie/[id]` e o uso do `FavoriteButton full` (`detalhe-filme`); README e
  `decisoes.md` como texto (a lista para o README fica em `design.md › Riscos / Trade-offs`; a linha
  de `voteCount` em D30 e em `components.md` é registrada no apply, task 7.1); `src/lib/tmdb/`,
  `src/lib/listing/`, `src/lib/format/`, `MovieGrid`, `EmptyState`, `NavLink`, `next.config.ts`
  (nada a mudar); contagem no título da aba, "salvo há N dias", exportar/importar favoritos.

## Capacidades
### Novas
- `favoritos`: favoritos persistidos no navegador com snapshot do filme, alternados pelo card e
  pelo detalhe, listados em `/favoritos`, sincronizados entre abas, resilientes a payload inválido e
  a `localStorage` indisponível, sem mismatch de hidratação e válidos nos dois modos de
  `cacheComponents`. Spec em `specs/favoritos/spec.md`.
### Modificadas
- `listagem-filmes` (spec do `listagem-filmes`): o cenário "Posição do botão de favorito" se cumpre
  (o `FavoriteButton` entra como irmão do `<Link>`); `MovieCardData` recebe `posterPath` e
  `releaseDate` de forma aditiva (nenhum consumidor existente quebra; `toMovieCardData` passa a
  copiá-los). A spec do `listagem-filmes` não é editada: o comportamento novo está na spec deste
  change.
- `projeto-base` (spec do `setup-catalogo`): o `Header` passa a renderizar o `FavoritesBadge` dentro
  do `NavLink` Favoritos (ilha client que devolve `null` no servidor); `/favoritos` deixa de ser
  esqueleto e continua estática (`○`) nos dois modos; o cenário "Páginas estáticas" segue valendo
  para `/favoritos`. Spec não editada.
- `cliente-tmdb` (spec do `tmdb-client`): nenhuma mudança de código. Este change consome
  `MovieSummary`/`MovieDetail` (`src/lib/tmdb/types.ts`) como origem do snapshot e `posterUrl`/
  `POSTER_SIZE` (`src/lib/tmdb/images.ts`, sem `server-only`) via `toMovieCardData`. O cenário
  "Base do snapshot de favoritos" da spec `cliente-tmdb` continua verdadeiro: `voteCount` já existe
  nos dois tipos, só não constava em D30.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L7] — Favoritos: persistência no client e página/aba que liste os favoritos
  - [#L7] — Inspecionar a base (`setup-catalogo`, `tmdb-client`, `listagem-filmes`) e a assinatura de `useSyncExternalStore`
  - [#L7] — `src/lib/favorites/store.ts`: tipos, constantes e type guards (D30, com `voteCount`)
  - [#L7] — `src/lib/favorites/store.ts`: funções puras (`toFavoriteSnapshot`, `parseFavorites`, `serializeFavorites`, `sortFavorites`, `hasFavorite`, `toggleInFavorites`)
  - [#L7] — `src/lib/favorites/store.ts`: `createFavoritesStore` + `favoritesStore` (cache do parse, fallback em memória, evento `storage`; D29, D32)
  - [#L7] — `src/lib/favorites/store.test.ts`
  - [#L7] — `src/lib/favorites/useFavorites.ts` + `useFavorites.test.tsx` (D29, D31)
  - [#L7] — `src/components/favorites/FavoriteButton.tsx` + `FavoriteButton.test.tsx`
  - [#L7] — `src/components/favorites/FavoritesBadge.tsx` + `FavoritesBadge.test.tsx`
  - [#L7] — `src/components/favorites/FavoritesList.tsx` + `FavoritesList.test.tsx` (D36)
  - [#L7] — Alterar `src/components/movies/MovieCard.tsx` (`FavoriteButton icon`, `posterPath`/`releaseDate` em `MovieCardData`) e `MovieCard.test.tsx`
  - [#L7] — Alterar `src/components/layout/Header.tsx` (`FavoritesBadge` no `NavLink` Favoritos)
  - [#L7] — Reescrever `src/app/favoritos/page.tsx`
  - [#L7] — Verificar no browser: favoritar → `/favoritos` → remover; reload; duas abas; payload corrompido; `localStorage` bloqueado; 390 e 1280 px; teclado
  - [#L7] — Build e `next dev` com `CATALOGO_CACHE_COMPONENTS=1` sem insight de blocking-route (D42)
  - [#L7] — Registro: `components.md` (linhas `FavoriteButton`, `FavoritesBadge`, `FavoritesList`, `MovieCard`), `decisoes.md` (D30 com `voteCount`), `backlog.md` (L7 `doing`)

## Impacto
- Arquivos novos: `src/lib/favorites/store.ts`, `src/lib/favorites/store.test.ts`,
  `src/lib/favorites/useFavorites.ts`, `src/lib/favorites/useFavorites.test.tsx`,
  `src/components/favorites/FavoriteButton.tsx`, `src/components/favorites/FavoriteButton.test.tsx`,
  `src/components/favorites/FavoritesBadge.tsx`, `src/components/favorites/FavoritesBadge.test.tsx`,
  `src/components/favorites/FavoritesList.tsx`, `src/components/favorites/FavoritesList.test.tsx`.
- Arquivos modificados: `src/components/movies/MovieCard.tsx` (`FavoriteButton` na posição marcada;
  `MovieCardData` com `posterPath` e `releaseDate`; `toMovieCardData` copia os dois),
  `src/components/movies/MovieCard.test.tsx` (campos novos; botão presente), `src/components/layout/Header.tsx`
  (`FavoritesBadge` como `children` do `NavLink` Favoritos), `src/app/favoritos/page.tsx`
  (reescrito com `FavoritesList`), `.work/backlog.md` (estado de L7 no apply),
  `.work/design/components.md` e `.work/design/decisoes.md` (D30: `voteCount` no snapshot; no apply,
  conforme a regra dos próprios arquivos).
- Dependências: nenhuma nova. Só `react` (`useSyncExternalStore`), `next/link`/`next/image` (já
  usados pelo `MovieCard`) e os módulos puros do repositório (`@/lib/tmdb/types`, `@/lib/tmdb/images`,
  `@/lib/format/*`). Sem biblioteca de estado, sem validador de schema, sem ícones.
- Padrões reutilizados: inspecionados os arquivos criados pelo `setup-catalogo` —
  `src/app/favoritos/page.tsx` (esqueleto a reescrever: `metadata.title`, `h1`, `p.text-text-muted`),
  `src/components/layout/Header.tsx` e `NavLink.tsx` (slot `children` do badge; `gap-2` no link),
  `src/components/layout/NavLink.test.tsx` (molde de teste de ilha client), `vitest.setup.ts`
  (`localStorage.clear()` em `afterEach`, pensado para este change), `src/app/globals.css` (tokens,
  `:focus-visible`); pelo `tmdb-client` — `src/lib/tmdb/types.ts` (`MovieSummary`, `MovieDetail`:
  os seis campos do snapshot existem nos dois), `src/lib/tmdb/images.ts` (`posterUrl`,
  `POSTER_SIZE.card`; confirmado sem `server-only` na decisão 1 do design do `tmdb-client`),
  `src/lib/tmdb/params.test.ts` (estilo de teste de função pura); pelo `listagem-filmes` —
  `src/components/movies/MovieCard.tsx` (`MovieCardData`, `toMovieCardData`, comentário da posição do
  botão), `MovieGrid.tsx` (`MovieGrid` shared com `ul role="list"`), `src/components/ui/EmptyState.tsx`
  (`icon="heart"`, ação por `href`), `src/lib/format/releaseYear.ts` e `rating.ts`,
  `src/components/movies/FilterBar.tsx` (molde de ilha client desenhada para as regras do React
  Compiler). Fontes de decisão: `.work/config.yaml > context` (pilares 1, 2, 4, 5, 6, 7, 8),
  `.work/design/decisoes.md` (D29, D30, D31, D32, D36, D40, D42, D43), `.work/design/components.md`
  (linhas `FavoritesBadge`, `FavoriteButton`, `FavoritesList`, `MovieCard`, `MovieGrid`,
  `EmptyState`, `NavLink`; "Páginas e arquivos de rota"; "Estados que o protótipo não desenha";
  "Acessibilidade"), `.work/backlog.md > Sequência de changes` (linha 4). Telas implementadas:
  `.work/design/screens/Favoritos.dc.html` (rota `/favoritos`, inclusive o vazio `sc-if noFavs`) e o
  coração do card em `Main.dc.html`; PNG em `screens/pdf/favoritos.png`. O bundle
  `.work/design/reference/` não foi usado como código.
