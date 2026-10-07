# Design — favoritos

## Contexto
Ao fim do `listagem-filmes` o repositório tem o shell do `setup-catalogo` (`src/app/{layout,page,favoritos/page}.tsx`,
`globals.css` com os 14 tokens no `@theme`, `Header` RSC com dois `NavLink` client cujo slot do badge é
só `children`, `Button`/`ButtonLink`, Vitest 5 com jsdom e `vitest.setup.ts` fazendo `cleanup()` +
`localStorage.clear()` em `afterEach`, `scripts/check-tokens.mjs`, toggle `CATALOGO_CACHE_COMPONENTS`),
a porta TMDB em `src/lib/tmdb/` (só `client.ts` tem `server-only`; `types.ts`, `images.ts`, `params.ts`
são puros) e a listagem em `/` com `src/lib/listing/`, `src/lib/format/` (`formatRating`,
`releaseYear`), `src/components/movies/` (`MovieCard` e `MovieGrid` shared, `MovieGridSkeleton`,
`FilterBar`, `Pagination`, `MovieResults`, `ListingTransition`) e `src/components/ui/`
(`EmptyState` com `icon: "search" | "heart" | "alert" | "film"`, `ErrorState`). `src/app/favoritos/page.tsx`
ainda é o esqueleto: `h1` "Meus favoritos" e o parágrafo "Os filmes salvos ficam neste navegador.".
Não existem `src/lib/favorites/` nem `src/components/favorites/`.

Contratos consumidos (de `.work/changes/tmdb-client/design.md` e `.work/changes/listagem-filmes/design.md`,
sem reabrir):
- `MovieSummary = { id, title, posterPath: string | null, voteAverage, voteCount, releaseDate: string | null }`
  e `MovieDetail` (mesmos seis campos mais `runtime`, `genres`, `overview`, `cast`, `trailer`), em
  `src/lib/tmdb/types.ts`. A spec `cliente-tmdb` garante que os dois expõem os campos do snapshot
  com os mesmos tipos.
- `posterUrl(path, size): string | null` e `POSTER_SIZE = { card: "w342", detail: "w500" }` em
  `src/lib/tmdb/images.ts`, **sem** `server-only` (decisões 1 e 11 do design do `tmdb-client`:
  "o `FavoritesList` (client) monta a URL a partir do snapshot").
- `MovieCardData = { id, title, posterUrl, voteAverage, voteCount, releaseYear }`,
  `MovieCardProps = { movie, from? }`, `toMovieCardData(movie: MovieSummary)` e a posição do
  `FavoriteButton` marcada por comentário (irmão do `<Link>` do pôster dentro de
  `div.relative.aspect-[2/3]`, `absolute top-2.5 right-2.5 w-10 h-10`) em
  `src/components/movies/MovieCard.tsx` (decisão 9 do design do `listagem-filmes`). `MovieGrid`
  shared com `{ movies: MovieCardData[], from? }` e `<ul role="list">`. `EmptyState` shared com
  `{ icon, title, description?, action?: { label, href } | { label, onClick } }`.
- `NavLink` client com `href` e `children`, `inline-flex min-h-11 items-center gap-2`.

Pendência herdada, resolvida aqui (decisão 2): D30 define `FavoriteSnapshot` sem `voteCount`, mas
`MovieCardData.voteCount` é obrigatório (o card mostra "Sem nota" quando é 0). A chave
`catalogo.favorites.v1` ainda não foi publicada, então o campo entra no snapshot sem migração.
Segunda lacuna encontrada na leitura: `MovieCardData` não carrega `posterPath` nem `releaseDate`
(só `posterUrl` e `releaseYear`), mas o `FavoriteButton` dentro do `MovieCard` precisa deles para
montar o snapshot (decisão 9).

Referência visual: `.work/design/screens/Favoritos.dc.html` (`h1` 40 px/800; subtítulo `text-muted`;
grid igual ao da listagem com o coração preenchido em `accent` sobre `bg-overlay`; vazio `sc-if noFavs`:
caixa `surface-100` com borda `border-subtle`, raio 12 px, padding 64/24 px, coração 32 px `text-muted`,
"Você ainda não salvou nenhum filme.", "Toque no coração de um pôster para guardá-lo aqui.", botão
primário "Explorar filmes"; badge no header: `background: #2a2d34` = `border-subtle`, 20 px de altura,
`min-width: 24px`, 12 px/600, raio 999), `Main.dc.html` (botão de coração: 40 × 40 px circular a 10 px
do canto, `background: #15161a` = `bg-overlay`, `aria-pressed`, `aria-label` alternando entre
"Adicionar aos favoritos" e "Remover dos favoritos", SVG 18 px com o mesmo `path` preenchido em
`#f2b84b` = `accent` quando ativo e só traçado em `#ececef` = `text-primary` quando inativo) e
`screens/pdf/favoritos.png`. Contratos em `.work/design/components.md` (linhas `FavoritesBadge`,
`FavoriteButton`, `FavoritesList`, `MovieCard`; tabela "Páginas e arquivos de rota"; "Favoritos
vazio" em "Estados que o protótipo não desenha"; "Acessibilidade").

Fatos do React 19.3 / Next 16.4 que o design assume e a task 1.1 confere:
- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`: `getServerSnapshot` é usado no
  servidor **e** na hidratação no client; depois da hidratação o React re-renderiza com
  `getSnapshot` se o valor for diferente. `getSnapshot` precisa devolver o mesmo valor (por
  `Object.is`) enquanto o store não muda, senão o React avisa e pode entrar em loop. `subscribe`
  precisa ter referência estável para não ressubscrever a cada render.
- O evento `storage` do `window` dispara **só nos outros documentos** da mesma origem; a própria aba
  que gravou precisa notificar seus listeners por conta própria.
- `eslint-config-next` 16 traz as regras do React Compiler (`react-hooks/set-state-in-effect`,
  `react-hooks/refs`): o padrão `useState(false)` + `useEffect(() => setMounted(true))` para saber se
  montou é reprovado. O equivalente aceito é um `useSyncExternalStore` que devolve `false` no servidor
  e `true` no client (decisão 5).
- Um Server Component (ou shared) pode renderizar um componente client importado de um módulo com
  `"use client"`; o módulo client e tudo que ele importa vai para o bundle do client, por isso o
  `MovieCard` só pode importar módulos sem `server-only` (já é o caso).

## Objetivos
- [#L7] verificável no browser: favoritar na listagem → aparece em `/favoritos` → remover some; reload
  mantém; duas abas sincronizam; payload corrompido não quebra; `localStorage` bloqueado não quebra
  (critério da linha 4 de `.work/backlog.md`).
- Store e hook puros e testados (`store.test.ts`, `useFavorites.test.tsx`), sem dependência nova
  (pilar 4, D29).
- Hidratação sem mismatch e sem flash do badge: snapshot do servidor vazio, badge `null` até hidratar,
  coração começa vazio (D31).
- `FavoriteButton` reutilizável pelo `detalhe-filme` na variante `full`, recebendo `MovieDetail` sem
  adaptador.
- `/favoritos` continua RSC estático (`○` nos dois modos); `npm run check` e `npm run build` verdes
  sem token e sem rede; build e `next dev` com `CATALOGO_CACHE_COMPONENTS=1` sem insight de
  blocking-route (D42).
- Cores só por token; `accent` só no coração ativo e nas ações primárias (pilar 5).

## Não-objetivos
- Rota `/movie/[id]` e o uso do `FavoriteButton full` no `MovieHeader` (`detalhe-filme`).
- Guardar só ids e refazer fetch em `/favoritos` (alternativa descartada em D30).
- Context, Zustand ou qualquer biblioteca de estado; cookie para o servidor conhecer os favoritos
  (D29, D31).
- Migração de versão do payload (a `v1` nasce aqui), exportar/importar favoritos, limite de
  quantidade, contagem no `<title>`, "salvo há N dias" (exigiria `Date.now()` no render).
- Alterar `MovieGrid`, `EmptyState`, `NavLink`, `src/lib/tmdb/`, `src/lib/format/`, `next.config.ts`.
- README e `decisoes.md` como texto neste change (a lista para o README está em Riscos / Trade-offs;
  a linha de D30 e de `components.md` é registrada na task 7.1 do apply).
- Skeleton em `/favoritos` antes de hidratar (`components.md` decide "nada"); gerenciamento de foco
  após remover um card.

## Abordagem
- Um módulo puro (`store.ts`) concentra formato, validação e regras (snapshot, payload, ordem,
  alternância) em funções sem efeito, mais um store mínimo criado por `createFavoritesStore(getStorage)`
  que faz a ponte com `localStorage`: lê a string crua, cacheia o parse por string (referência
  estável para `getSnapshot`), grava, notifica listeners e repassa o evento `storage`. O singleton
  `favoritesStore` usa `window.localStorage`; os testes criam stores com `Storage` injetada (normal,
  lançando, falhando só na escrita) sem estado de módulo escondido.
- `useFavorites()` é o único hook: dois `useSyncExternalStore` (itens e "hidratou?"), zero
  `useState`/`useEffect`, devolvendo `items`, `count`, `hydrated`, `isFavorite(id)` e `toggle(movie)`.
  O snapshot do servidor é a constante `EMPTY_FAVORITES`, então servidor e primeira passada no client
  rendem o mesmo HTML (D31).
- Três ilhas client nomeadas no pilar 1: `FavoriteButton` (o único lugar que chama `Date.now()`, no
  handler do clique), `FavoritesBadge` e `FavoritesList`. `MovieCard` continua shared e passa a
  renderizar o `FavoriteButton`; `src/app/favoritos/page.tsx` continua RSC estático.
- `savedAt` nunca entra em prop: o botão recebe `FavoriteMovie` (snapshot sem `savedAt`), que
  `MovieSummary`, `MovieDetail` e o `MovieCardData` estendido satisfazem por estrutura; o store copia
  explicitamente os seis campos ao gravar, então nada além do contrato vai para o `localStorage`.
- Testes: funções puras com casos de borda; store com `Storage` injetada; hook com `renderHook`;
  componentes com Testing Library. Store e hook são critério de pronto; os de componente são os
  cortáveis de D43.

## Decisões técnicas
1. **Mapa de arquivos e fronteira** (aplica pilares 1, 2, 4; `components.md` › Fronteira server × client):
   | Arquivo | Tipo | Exporta | Importa de |
   |---|---|---|---|
   | `src/lib/favorites/store.ts` | puro + singleton | `FAVORITES_STORAGE_KEY`, `FAVORITES_PAYLOAD_VERSION`, `EMPTY_FAVORITES`, `FavoriteMovie`, `FavoriteSnapshot`, `FavoritesPayload`, `FavoritesStore`, `isFavoriteSnapshot`, `isFavoritesPayload`, `toFavoriteSnapshot`, `parseFavorites`, `serializeFavorites`, `sortFavorites`, `hasFavorite`, `toggleInFavorites`, `createFavoritesStore`, `favoritesStore` | — |
   | `src/lib/favorites/useFavorites.ts` | hook (sem diretiva) | `useFavorites`, `UseFavoritesResult` | `react`, `./store` |
   | `src/components/favorites/FavoriteButton.tsx` | client | `FavoriteButton`, `FavoriteButtonProps`, `FavoriteButtonVariant` | `@/lib/favorites/useFavorites`, `@/lib/favorites/store` (tipo) |
   | `src/components/favorites/FavoritesBadge.tsx` | client | `FavoritesBadge` | `@/lib/favorites/useFavorites` |
   | `src/components/favorites/FavoritesList.tsx` | client | `FavoritesList` | `@/lib/favorites/useFavorites`, `@/components/movies/MovieGrid`, `@/components/movies/MovieCard` (`toMovieCardData`), `@/components/ui/EmptyState` |
   | `src/components/movies/MovieCard.tsx` (alterado) | shared | `MovieCard`, `MovieCardData` (+ `posterPath`, `releaseDate`), `MovieCardProps`, `toMovieCardData` | + `@/components/favorites/FavoriteButton` |
   | `src/components/layout/Header.tsx` (alterado) | RSC | `Header` | + `@/components/favorites/FavoritesBadge` |
   | `src/app/favoritos/page.tsx` (reescrito) | RSC estático | `default`, `metadata` | `@/components/favorites/FavoritesList` |
   Regra de importação: nenhum arquivo deste change importa `@/lib/tmdb/client` (`server-only`);
   `FavoritesList` chega ao `posterUrl` só através de `toMovieCardData` (que importa
   `@/lib/tmdb/images`, puro). O hook mora em `src/lib/favorites/` (pilar 2: "favorites: store e
   hook"), nomeado pelo hook como `pickOverview.ts` é nomeado pela função (convenção do
   `tmdb-client`). `useFavorites.ts` **não** leva `"use client"`: um hook não é componente, e os
   três módulos que o importam já são ilhas client; a diretiva fica onde o pilar 1 a nomeia.
   `store.ts` também não leva diretiva e não toca em `window` no nível do módulo (o `getStorage` é
   um thunk avaliado só dentro de `getSnapshot`/`write`), por isso pode ser importado na renderização
   no servidor do `FavoriteButton` sem lançar.
2. **Snapshot com `voteCount` e o tipo de entrada `FavoriteMovie`** (resolve a pendência de D30;
   aplica D30 no resto):
   ```ts
   // src/lib/favorites/store.ts
   export const FAVORITES_STORAGE_KEY = "catalogo.favorites.v1";
   export const FAVORITES_PAYLOAD_VERSION = 1;
   export interface FavoriteMovie {              // o que o FavoriteButton recebe (sem savedAt)
     id: number; title: string; posterPath: string | null;
     voteAverage: number; voteCount: number; releaseDate: string | null; // "YYYY-MM-DD" | null, como no domínio
   }
   export interface FavoriteSnapshot extends FavoriteMovie { savedAt: number } // epoch ms, gerado só no clique
   export interface FavoritesPayload { version: typeof FAVORITES_PAYLOAD_VERSION; items: FavoriteSnapshot[] }
   export const EMPTY_FAVORITES: readonly FavoriteSnapshot[] = Object.freeze([]);
   export function toFavoriteSnapshot(movie: FavoriteMovie, savedAt: number): FavoriteSnapshot; // copia só os seis campos + savedAt
   ```
   `FavoriteSnapshot` final: `{ id, title, posterPath, voteAverage, voteCount, releaseDate, savedAt }`.
   `voteCount` entra porque `MovieCardData.voteCount` é obrigatório e o card decide "Sem nota" por
   ele; a chave `v1` nasce com o campo, sem migração. `posterPath` e `releaseDate` (e não a URL e o
   ano) ficam no snapshot como D30 e o design do `tmdb-client` decidiram: o caminho é a identidade,
   a URL depende do tamanho (`w342` no card, `w500` no detalhe) e o ano é derivado por
   `releaseYear()`. `FavoriteMovie` existe porque `savedAt` não pode vir por prop: o `MovieCard` é
   shared e renderiza no servidor, onde `Date.now()` é proibido (pilar 1); o botão recebe o filme e o
   store carimba `savedAt` no clique. É um tipo derivado (`FavoriteSnapshot` sem `savedAt`), não um
   nome paralelo a `MovieSummary`: `MovieSummary`, `MovieDetail` e o `MovieCardData` estendido
   satisfazem `FavoriteMovie` por estrutura, então `<FavoriteButton movie={movie} />` funciona com
   qualquer um dos três sem adaptador (contrato da spec `cliente-tmdb`). `toFavoriteSnapshot` copia
   campo a campo (sem spread) para que `posterUrl`, `releaseYear`, `cast` ou `overview` nunca vazem
   para o `localStorage`. Mapeamento inverso (snapshot → `MovieCardData`): é o próprio
   `toMovieCardData` do `listagem-filmes`, porque `FavoriteSnapshot` satisfaz `MovieSummary` por
   estrutura (os seis campos, mais `savedAt` que o mapeador ignora); `posterUrl` sai de
   `posterUrl(posterPath, POSTER_SIZE.card)` e `releaseYear` de `releaseYear(releaseDate)` dentro dele.
   Nenhuma função nova para isso. Alternativas descartadas: `savedAt: 0` como placeholder na prop
   (campo ignorado, enganoso); snapshot com `posterUrl`/`releaseYear` (contraria D30 e o design do
   `tmdb-client`); mapear `voteCount: 1` quando ausente (esconde "Sem nota").
3. **Payload, type guards e normalização** (D30, D32; pilar 4):
   ```ts
   export function isFavoriteSnapshot(value: unknown): value is FavoriteSnapshot;
   export function isFavoritesPayload(value: unknown): value is FavoritesPayload;
   export function parseFavorites(raw: string | null): FavoriteSnapshot[];        // nunca lança
   export function serializeFavorites(items: readonly FavoriteSnapshot[]): string; // JSON.stringify({ version: 1, items })
   export function sortFavorites(items: readonly FavoriteSnapshot[]): FavoriteSnapshot[]; // cópia, savedAt desc, estável
   export function hasFavorite(items: readonly FavoriteSnapshot[], id: number): boolean;
   export function toggleInFavorites(items: readonly FavoriteSnapshot[], movie: FavoriteMovie, savedAt: number): FavoriteSnapshot[];
   ```
   Payload gravado: `{ "version": 1, "items": [ …FavoriteSnapshot ] }` sob a chave
   `catalogo.favorites.v1`, itens em `savedAt` desc. `isFavoriteSnapshot`: objeto não nulo; `id`
   inteiro `>= 1`; `title` string; `posterPath` string ou `null`; `voteAverage` número finito;
   `voteCount` número finito `>= 0`; `releaseDate` string ou `null`; `savedAt` número finito.
   `isFavoritesPayload`: objeto não nulo com `version === 1` e `items` array (os itens são
   validados um a um pelo parser). `parseFavorites`: `null` ou `""` → `[]`; `JSON.parse` em
   `try/catch` (JSON inválido → `[]`); payload que não passa no guard (array solto, `version` 2,
   `items` não array) → `[]`; itens que não passam em `isFavoriteSnapshot` são **descartados
   individualmente** (um item ruim não apaga a lista); duplicatas de `id` ficam com o `savedAt` mais
   recente; cada item é re-copiado por `toFavoriteSnapshot(item, item.savedAt)` (chaves extras
   somem); resultado em `savedAt` desc. Interpretação de D32 registrada: "payload inválido vira
   lista vazia e é sobrescrito" — a lista vira vazia na leitura e a sobrescrita acontece na próxima
   gravação (`write` grava sempre o payload inteiro, sem tentar mesclar com o que está corrompido);
   nada é gravado durante a leitura porque `getSnapshot` roda no render e não deve ter efeito.
   `toggleInFavorites`: se `hasFavorite(items, movie.id)`, devolve a lista sem ele; senão devolve
   `[toFavoriteSnapshot(movie, savedAt), ...items]`; nunca muta a entrada. Sem biblioteca de schema:
   são sete campos e o guard tem 15 linhas; registrar como escolha deliberada (zero dependência).
4. **Store sobre `localStorage`** (D29, D32; `createFavoritesStore` + singleton):
   ```ts
   export interface FavoritesStore {
     getSnapshot(): readonly FavoriteSnapshot[];        // ler: cache por string crua → referência estável
     getServerSnapshot(): readonly FavoriteSnapshot[];  // sempre EMPTY_FAVORITES (D31)
     write(items: readonly FavoriteSnapshot[]): void;   // gravar: ordena, serializa, persiste, notifica
     toggle(movie: FavoriteMovie, savedAt?: number): void; // alternar: write(toggleInFavorites(getSnapshot(), movie, savedAt ?? Date.now()))
     subscribe(listener: () => void): () => void;       // listeners + evento storage (D32)
   }
   export function createFavoritesStore(getStorage: () => Storage): FavoritesStore;
   export const favoritesStore: FavoritesStore = createFavoritesStore(() => window.localStorage);
   ```
   Internos do store (fechados na closure, nada no nível do módulo):
   - `memoryRaw: string | null` espelha a última string lida ou gravada e é o fallback;
     `storageBroken` trava em `true` na primeira exceção de `getStorage()`, `getItem` ou `setItem`
     (acesso a `window.localStorage` pode lançar `SecurityError` com cookies bloqueados; `setItem`
     pode lançar por quota ou modo privado antigo). Com a trava, leituras e gravações seguem só em
     memória pelo resto da sessão: o usuário continua favoritando, sem persistência e sem erro.
     Leitura bem-sucedida também atualiza `memoryRaw`, para que uma falha posterior não perca o que
     já estava gravado.
   - `getSnapshot()`: `raw = readRaw()`; se `raw === cachedRaw`, devolve `cachedItems`; senão
     `cachedRaw = raw` e `cachedItems = parseFavorites(raw)` congelado (`Object.freeze`), ou
     `EMPTY_FAVORITES` quando a lista é vazia. Ler o `localStorage` a cada chamada é barato (síncrono,
     uma chave) e faz o cache se corrigir sozinho quando outro código, o devtools ou o
     `localStorage.clear()` do `vitest.setup.ts` mexe na chave; o parse só roda quando a string muda.
     É a "referência estável via cache do parse" de D29: o React chama `getSnapshot` em todo render
     (e duas vezes em dev para checar a estabilidade).
   - `write(items)`: `writeRaw(serializeFavorites(sortFavorites(items)))` e depois notifica todos os
     listeners (o evento `storage` não dispara na própria aba).
   - `toggle(movie, savedAt = Date.now())`: o único `Date.now()` do domínio, avaliado só quando o
     handler chama; os testes passam `savedAt` fixo.
   - `subscribe(listener)`: guarda em um `Set`; ao entrar o primeiro listener registra
     `window.addEventListener("storage", onStorage)`, ao sair o último remove. `onStorage` notifica
     quando `event.key === FAVORITES_STORAGE_KEY` ou `event.key === null` (`clear()` em outra aba);
     o próximo `getSnapshot` lê a string nova e o cache se invalida sozinho. Esta é a
     sincronização entre abas de D32 (D43 a lista como cortável, mas ela é critério de pronto da
     linha 4 do backlog, então entra; são ~10 linhas).
   Alternativas descartadas: estado em memória como fonte com `localStorage` só como persistência
   (precisa de `reset` para os testes e não se corrige quando a chave muda por fora); listener de
   `storage` registrado no nível do módulo (vaza no SSR e sem consumidor); `BroadcastChannel`
   (o evento `storage` já cobre a mesma origem sem API extra).
5. **`useFavorites()` e a hidratação** (D29, D31; regras do React Compiler):
   ```ts
   // src/lib/favorites/useFavorites.ts
   export interface UseFavoritesResult {
     items: readonly FavoriteSnapshot[];        // savedAt desc; EMPTY_FAVORITES no servidor e na hidratação
     count: number;
     hydrated: boolean;                         // false no servidor e durante a hidratação; true depois
     isFavorite: (id: number) => boolean;
     toggle: (movie: FavoriteMovie, savedAt?: number) => void;
   }
   export function useFavorites(): UseFavoritesResult;
   ```
   Implementação: `const items = useSyncExternalStore(favoritesStore.subscribe,
   favoritesStore.getSnapshot, favoritesStore.getServerSnapshot)` e `const hydrated =
   useSyncExternalStore(subscribeNoop, () => true, () => false)` com `subscribeNoop = () => () => {}`
   constante de módulo; devolve `{ items, count: items.length, hydrated, isFavorite: (id) =>
   hasFavorite(items, id), toggle: favoritesStore.toggle }`. `subscribe` e `toggle` são métodos do
   singleton (referência estável, sem `useCallback`); `isFavorite` é uma closure nova por render, o
   que é irrelevante aqui. Sem `useState`, `useEffect`, `useRef`: passa em
   `react-hooks/set-state-in-effect` e `react-hooks/refs`. Comportamento (D31): no servidor e na
   hidratação o React usa `getServerSnapshot` → `items` é `EMPTY_FAVORITES` e `hydrated` é `false`,
   o HTML bate; terminada a hidratação, o React re-renderiza com `getSnapshot` → itens reais e
   `hydrated = true`. Em navegação client-side (de `/` para `/favoritos` por `<Link>`) não há
   hidratação: os componentes montam já com o snapshot real. `hasFavorite` é `some()` sobre no
   máximo algumas dezenas de itens, chamado por 20 cards: irrelevante. Alternativas descartadas:
   `useState` + `useEffect` para `mounted` (regra do Compiler e um render a mais); um
   `useIsFavorite(id)` por botão com snapshot booleano (re-renderiza só o botão que mudou, mas
   dobra a API para ganhar nada mensurável; fica como melhoria se a lista crescer); Context no layout
   (pilar 4; re-renderiza tudo).
6. **`FavoriteButton`** (client; `components.md` linha `FavoriteButton`; D31; pilar 5):
   ```ts
   export type FavoriteButtonVariant = "icon" | "full";
   export interface FavoriteButtonProps { movie: FavoriteMovie; variant: FavoriteButtonVariant }
   export function FavoriteButton({ movie, variant }: FavoriteButtonProps): ReactNode;
   ```
   `const { isFavorite, toggle } = useFavorites(); const active = isFavorite(movie.id);` e os rótulos
   `FAVORITE_LABELS = { add: "Adicionar aos favoritos", remove: "Remover dos favoritos" }` (constante
   do arquivo: rótulo é UI). Marcação:
   ```tsx
   <button type="button" aria-pressed={active} onClick={() => toggle(movie)}
     aria-label={variant === "icon" ? label : undefined} className={className}>
     <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} strokeLinejoin="round" className={heartClassName}>
       <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.8 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
     </svg>
     {variant === "full" ? <span>{label}</span> : null}
   </button>
   ```
   `label = active ? FAVORITE_LABELS.remove : FAVORITE_LABELS.add`. Classes: `icon` →
   `absolute top-2.5 right-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full
   bg-bg-overlay text-text-primary transition-colors`, coração ativo `fill-accent text-accent`
   (`fill-*` do Tailwind v4 vence o atributo `fill="none"`); `full` → `inline-flex min-h-11
   items-center gap-2 rounded-lg bg-accent px-[18px] font-semibold text-on-accent`, coração ativo
   `fill-current` (o botão já é `accent`, então o preenchido é `on-accent`). Foco pelo
   `:focus-visible` global (`outline-focus-ring`). Na variante `icon` o nome acessível é o
   `aria-label` (botão só com ícone, pilar 5); na `full` é o texto visível, sem `aria-label`
   duplicado. `aria-pressed` é o estado (`"true"`/`"false"`) e muda junto com o rótulo, como o
   protótipo faz. O `path` é o do protótipo (`Main.dc.html`), o mesmo do ícone `heart` do
   `EmptyState`. Antes de hidratar: `active` é `false` (snapshot do servidor), então o HTML do
   servidor e o da hidratação têm `aria-pressed="false"` e o coração vazio; após hidratar, os
   favoritados viram preenchidos (D31: "o flash do coração não é evitável"). Clique antes de hidratar
   não faz nada (botão sem handler ainda). `Date.now()` acontece dentro de `favoritesStore.toggle`,
   chamado pelo `onClick`: nunca no render. Sem `hover:` em `accent` no `icon` (a regra do pilar 5
   reserva `accent` para favorito ativo). O botão de 40 px (abaixo dos 44 px dos outros controles) é
   o do protótipo, aceito em `components.md › Acessibilidade`. Alternativa descartada: dois
   componentes (`FavoriteIconButton`, `FavoriteToggle`): o estado e o `aria` são idênticos, só a
   casca muda.
7. **`FavoritesBadge`** (client; `components.md` linha `FavoritesBadge`; D31):
   ```ts
   export function FavoritesBadge(): ReactNode;
   ```
   `const { count } = useFavorites(); if (count === 0) return null;` senão
   `<span aria-label={`${count} ${count === 1 ? "favorito" : "favoritos"}`} className="inline-flex
   h-5 min-w-6 items-center justify-center rounded-full bg-border-subtle px-2 text-xs font-semibold
   text-text-primary">{count}</span>`. "Oculto até montar" sai de graça de D31: no servidor e na
   hidratação `count` é 0 (snapshot vazio) e o badge é `null`; depois da hidratação aparece com o
   total real. Não precisa de `hydrated`. O `aria-label` no `span` entra no nome do `NavLink` pelo
   cálculo de nome por conteúdo ("Favoritos 3 favoritos"), como `components.md` prevê; singular
   "1 favorito" é um refinamento registrado. Sem `role="status"`/`aria-live`: a contagem muda por ação
   do próprio usuário, que já ouve o `aria-pressed` do botão. Posição: `children` do `NavLink` de
   `/favoritos` em `Header.tsx` — `<NavLink href="/favoritos">Favoritos<FavoritesBadge /></NavLink>`;
   o `gap-2` do `NavLink` dá o espaço (decisão 6 do design do `setup-catalogo`). O `Header` continua
   RSC: só passa um componente client como filho de outro.
8. **`FavoritesList` e `src/app/favoritos/page.tsx`** (client + RSC estático; D30, D31, D36;
   `components.md` linhas `FavoritesList` e "Páginas e arquivos de rota"):
   ```ts
   export function FavoritesList(): ReactNode;
   ```
   `const { items, hydrated } = useFavorites();` e três saídas, na ordem de `components.md`:
   - `!hydrated` → `null` ("não montado → nada"): o servidor não conhece o `localStorage` e mostrar
     o vazio para quem tem favoritos seria um flash enganoso; o `h1` e o subtítulo (RSC) já estão na
     tela. Sem skeleton: para quem tem 0 favoritos ele piscaria antes do vazio.
   - `items.length === 0` → `<EmptyState icon="heart" title="Você ainda não salvou nenhum filme."
     description="Toque no coração de um pôster para guardá-lo aqui." action={{ href: "/", label:
     "Explorar filmes" }} />` (textos e ação do vazio de `Favoritos.dc.html`, D36).
   - senão → `<MovieGrid movies={items.map(toMovieCardData)} />` sem `from` (o link do card fica
     `/movie/{id}` e o "Voltar à listagem" do detalhe vai para `/`, D39). Cada card traz o
     `FavoriteButton icon` já ativo; clicar remove o item do store, o `items` muda e o card some
     (critério "remover some"). A ordem é a do store (`savedAt` desc), sem reordenar aqui.
   `src/app/favoritos/page.tsx`:
   ```tsx
   export const metadata: Metadata = { title: "Meus favoritos" };
   export default function FavoritesPage() {
     return (
       <section className="flex flex-col gap-6">
         <div className="flex flex-col gap-1.5">
           <h1 className="font-display text-4xl font-extrabold tracking-tight">Meus favoritos</h1>
           <p className="text-text-muted">Os filmes salvos ficam neste navegador.</p>
         </div>
         <FavoritesList />
       </section>
     );
   }
   ```
   Nenhum `searchParams`, `cookies()`, `connection()` ou `fetch`: a página é prerenderizada como
   estática (`○`) nos dois modos de D2 e a parte dinâmica inteira acontece no client depois de
   montar. Classes do `h1` e da `section` são as do esqueleto do `setup-catalogo`. Alternativa
   descartada: ler um cookie para prerenderizar os favoritos (D31).
9. **`MovieCard` alterado** (shared; decisão 9 do design do `listagem-filmes`; D23):
   ```ts
   export interface MovieCardData {
     id: number; title: string; posterUrl: string | null;
     voteAverage: number; voteCount: number; releaseYear: number | null;
     posterPath: string | null; releaseDate: string | null; // origem (TMDB), usados pelo FavoriteButton
   }
   export function toMovieCardData(movie: MovieSummary): MovieCardData; // + posterPath: movie.posterPath, releaseDate: movie.releaseDate
   ```
   Mudança aditiva: os dois campos de origem entram ao lado dos derivados (`posterUrl`, `releaseYear`)
   porque o `FavoriteButton` dentro do card precisa do caminho e da data ISO para o snapshot (decisão
   2), e `MovieGrid` só transporta `MovieCardData`. `MovieResults` não muda (já chama
   `toMovieCardData`); `MovieCard.test.tsx` passa a esperar os oito campos. A inserção, na posição
   marcada pelo comentário do `listagem-filmes`:
   ```tsx
   <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-200">
     <Link href={href} aria-label={`Ver detalhes de ${movie.title}`} className="absolute inset-0 …">…</Link>
     <FavoriteButton movie={movie} variant="icon" />
   </div>
   ```
   Irmão do `<Link>`, nunca dentro (botão dentro de link é HTML inválido e o `aria-pressed` entraria
   no nome do link); vem depois do `<Link>` no DOM, então fica por cima do pôster e na ordem de
   tabulação logo após ele. `movie` (um `MovieCardData`) satisfaz `FavoriteMovie` por estrutura;
   `toFavoriteSnapshot` descarta `posterUrl`/`releaseYear` ao gravar. `MovieCard` continua sem
   diretiva: renderiza no servidor pela listagem e no client pelo `FavoritesList`; importar um
   componente client de um shared é permitido. Consequência registrada: a listagem passa a ter 20
   ilhas client pequenas (um botão por card), todas assinando o mesmo store; uma alternância
   re-renderiza os 20 botões (barato). Alternativa descartada: refazer `MovieCardData` como
   `MovieSummary` puro com o card derivando URL e ano (mais limpo, mas reescreve o contrato e os
   testes do `listagem-filmes`; fica anotado como melhoria).
10. **Mapeamento de tokens** (D33, pilar 5; `tokens/README.md > Mapa de uso`):
    | Elemento | Classes (tokens 1:1) |
    |---|---|
    | `FavoriteButton icon` (fundo sobre o pôster, ícone) | `bg-bg-overlay text-text-primary`; ativo `fill-accent text-accent` |
    | `FavoriteButton full` | `bg-accent text-on-accent`; ativo `fill-current` |
    | `FavoritesBadge` | `bg-border-subtle text-text-primary` |
    | Subtítulo de `/favoritos` | `text-text-muted` |
    | Vazio de favoritos | via `EmptyState`: caixa `bg-surface-100 border-border-subtle`, ícone e descrição `text-text-muted`, título `text-text-primary`, ação `bg-accent text-on-accent` |
    | Cards em `/favoritos` | via `MovieCard` (sem mudança de token) |
    | Foco | `:focus-visible` global com `outline-focus-ring` |
    `accent` aparece só no coração ativo, no botão `full` (ação primária do detalhe) e na ação do
    vazio; nenhuma cor literal em `src/` (os SVGs usam `currentColor`/`none`; `tokens:check` falha
    se houver). `transition-colors` e `opacity` não são cor.
11. **Acessibilidade e responsivo** (D35; `components.md > Acessibilidade`): `<button type="button">`
    nativo com `aria-pressed` e `aria-label` (só no `icon`); nome do `NavLink` Favoritos inclui a
    contagem; `ul role="list"` e links do card herdados do `MovieGrid`/`MovieCard`; ordem de
    tabulação por card: link do pôster → coração → link do título; foco visível global. Em
    `/favoritos` o grid é o mesmo da listagem (2 colunas a 390 px, `auto-fill` no desktop) e o
    header com badge quebra linha sem overflow; o `EmptyState` ocupa a largura do container.
    Limite registrado: ao remover um card em `/favoritos` o foco vai para o `body` (o botão focado
    some); mover o foco para o próximo card fica como melhoria futura.
12. **Testes** (D7, D43; critério da linha 4 do backlog):
    - `src/lib/favorites/store.test.ts`: `isFavoriteSnapshot` (válido; `posterPath`/`releaseDate`
      `null` válidos; `id: "1"`, `savedAt` ausente, `voteCount: -1`, `null` → falso; chaves extras →
      verdadeiro); `isFavoritesPayload` (válido; `version: 2`, `items: {}`, array solto, `null` →
      falso); `parseFavorites` (`null`, `""`, `"{"`, `"[]"`, `{"version":2,…}` → `[]`; payload válido
      fora de ordem → `savedAt` desc; um item inválido no meio → só ele some; duplicata de `id` → fica
      o `savedAt` maior; chave extra no item → removida); `serializeFavorites` (round-trip com
      `parseFavorites`; `JSON.parse` dá `{ version: 1, items }`); `toFavoriteSnapshot` (de um
      `MovieSummary` → exatamente as sete chaves; de um `MovieDetail` com `cast`/`overview` → extras
      descartados; de um `MovieCardData` com `posterUrl`/`releaseYear` → descartados);
      `toggleInFavorites` (insere no topo; remove; não muta a entrada); `createFavoritesStore` com
      o `localStorage` do jsdom (`getSnapshot()` vazio é `EMPTY_FAVORITES` e a mesma referência em
      duas chamadas; `toggle` grava a chave com o payload; referência muda após `write` e fica
      estável depois; listener chamado em `write`; `unsubscribe` para de chamar; `StorageEvent` com
      a chave → listener chamado e `getSnapshot()` reflete o valor novo; com outra chave → nada;
      `getServerSnapshot()` é `EMPTY_FAVORITES` mesmo com itens gravados; raw corrompido → `[]` e o
      próximo `toggle` deixa um payload válido na chave); fallback (`createFavoritesStore(() => {
      throw new Error("blocked") })` → `getSnapshot()` `[]`, `toggle` funciona em memória,
      `localStorage` sem a chave; `setItem` lançando via `vi.spyOn(Storage.prototype, "setItem")`
      → `toggle` reflete em `getSnapshot()` mesmo assim). Os `MovieSummary`/`MovieDetail` dos testes
      são literais com `satisfies` (sem fixture nova).
    - `src/lib/favorites/useFavorites.test.tsx` (`renderHook` + `act`): sem nada gravado → `items`
      `[]`, `count` 0, `hydrated` `true` (render client, sem hidratação), `isFavorite(603)` falso;
      `toggle(movie, 100)` → `items[0].id`, `isFavorite` verdadeiro, chave gravada; `toggle` de novo
      → `[]`; `toggle(a, 100)` + `toggle(b, 200)` → `[b, a]`; `localStorage.setItem` direto +
      `window.dispatchEvent(new StorageEvent("storage", { key, newValue }))` dentro de `act` →
      `items` atualizado (abas); payload corrompido antes do render → `[]` sem lançar; re-render sem
      mudança mantém a mesma referência de `items` (`toBe`). O caminho do servidor
      (`getServerSnapshot` e `hydrated: false`) é coberto pelo teste do store e pela verificação no
      browser (task 6.2: HTML do servidor sem badge e sem cards); `hydrateRoot` em jsdom não vale o
      custo.
    - `src/components/favorites/FavoriteButton.test.tsx` (cortável): `icon` renderiza `button` com
      `aria-pressed="false"`, nome "Adicionar aos favoritos" e sem texto visível; clique →
      `aria-pressed="true"`, nome "Remover dos favoritos", payload na chave com as sete chaves e
      `savedAt` numérico, sem `posterUrl`/`releaseYear` (passando um `MovieCardData`); segundo clique
      remove; `full` mostra o texto visível e alterna; dois botões do mesmo filme ficam em sincronia.
    - `src/components/favorites/FavoritesBadge.test.tsx` (cortável): sem favoritos → nada no DOM;
      com 3 gravados → "3" com `aria-label="3 favoritos"`; com 1 → "1 favorito".
    - `src/components/favorites/FavoritesList.test.tsx` (cortável): vazio → `EmptyState` com o
      título do protótipo e link "Explorar filmes" para `/`; com dois itens gravados → `list` com
      dois cards, títulos em `savedAt` desc; clicar no coração do primeiro → um card; `vi.mock("next/image")`
      se o jsdom reclamar (como no `MovieCard.test.tsx`).
    - `src/components/movies/MovieCard.test.tsx` (ajuste): `toMovieCardData` devolve também
      `posterPath` e `releaseDate`; o card tem um `button` com `aria-pressed="false"` e nome
      "Adicionar aos favoritos", irmão do link do pôster.
    Ordem de corte deste change se faltar prazo (D43): `FavoritesBadge.test` → `FavoritesList.test`
    → `FavoriteButton.test`. Não cortáveis: store, hook, os critérios do backlog (inclusive abas).
13. **Dois modos de `cacheComponents`** (D2, D42; critério no `tasks.md`): sem a flag, `/favoritos`
    é `○` e `/` continua `ƒ`; com `CATALOGO_CACHE_COMPONENTS=1`, `/favoritos` continua `○` e `/`
    `◐`. Nada deste change lê request, `Date` ou `localStorage` no servidor: o store só é tocado
    por `getSnapshot`/`subscribe` no client e `getServerSnapshot` é constante. `next dev` com a flag
    abre `/favoritos` e `/` sem insight de blocking-route nem de IO síncrono. Código idêntico nos
    dois modos (sem `'use cache'`/`cacheLife`).
14. **Registro** (no apply, conforme a regra dos próprios arquivos): `components.md` recebe na linha
    `FavoriteButton` a prop `movie: FavoriteMovie` (snapshot sem `savedAt`; aceita `MovieSummary`,
    `MovieDetail`, `MovieCardData`) e o `fill-current` do `full` ativo; na linha `FavoritesBadge` o
    singular "1 favorito"; na linha `FavoritesList` o `hydrated`; na linha `MovieCard` os campos
    `posterPath`/`releaseDate` em `MovieCardData`; e, onde `FavoriteSnapshot` é citado, o campo
    `voteCount`. `decisoes.md`: a linha D30 passa a listar `{ id, title, posterPath, voteAverage,
    voteCount, releaseDate, savedAt }` com a nota "`voteCount` acrescentado no propose do `favoritos`
    (2026-10-07): `MovieCardData.voteCount` é obrigatório para 'Sem nota'". `backlog.md`: L7 `doing`
    no apply, `done` no finish. README: nada aqui; a lista para a seção "Decisões técnicas e
    trade-offs" está no último item de Riscos / Trade-offs.

## Riscos / Trade-offs
- Dados do snapshot envelhecem (nota e pôster podem mudar no TMDB) → aceito por D30: `/favoritos` fica
  100% client e sem chamada ao TMDB; a alternativa (ids + refetch) exigiria route handler e N chamadas.
- Flash do coração após hidratar (D31) → inevitável sem cookie; o badge não pisca porque é `null`
  até hidratar. Clique antes de hidratar não faz nada; janela de milissegundos.
- `getSnapshot` lê o `localStorage` a cada render → síncrono e barato; o parse só roda quando a
  string muda. Se a lista crescer para centenas de itens, um `useIsFavorite(id)` por botão
  (decisão 5) reduz re-renders; não feito agora.
- Falha parcial do storage (leitura funciona, gravação não) → a trava `storageBroken` passa tudo para
  memória na sessão; favoritar continua funcionando, sem persistir, sem mensagem ao usuário (quem
  bloqueia storage sabe). Não há `aria-live` avisando.
- Payload corrompido só é sobrescrito na próxima gravação (decisão 3) → inofensivo: a leitura já
  devolve lista vazia; gravar durante o render seria efeito colateral em `getSnapshot`.
- `MovieCardData` com `posterPath`/`releaseDate` ao lado de `posterUrl`/`releaseYear` → redundância
  pequena e aditiva; o refactor para `MovieSummary` puro fica como melhoria (decisão 9).
- 20 ilhas client na listagem (um botão por card) → cada uma é um `<button>` com um hook; o payload
  de hidratação cresce poucos bytes por card. Alternativa (um único client wrapper no grid) tiraria
  o `MovieCard` do servidor.
- `aria-label` em `<span>` sem `role` → funciona no cálculo de nome do link; se um leitor ignorar,
  o número visível continua lá. Alternativa `sr-only` " favoritos" como texto fica anotada.
- Botão de 40 px (menor que 44) → protótipo e `components.md` aceitam; registrado em
  "Acessibilidade" do README.
- `StorageEvent` em jsdom precisa ser disparado à mão nos testes → `window.dispatchEvent(new
  StorageEvent("storage", { key, newValue }))` dentro de `act`; em browser real a task 6.3 cobre.
- Sincronização entre abas é cortável por D43, mas é critério de pronto do backlog → entra (10
  linhas); se cortada, a task 6.3 vira "não aplicável" com registro.
- Remover um card em `/favoritos` perde o foco → melhoria futura (mover o foco para o próximo card ou
  anunciar via `role="status"`).
- Regras do React Compiler (`set-state-in-effect`, `refs`) → nenhum `useState`/`useEffect`/`useRef`
  no domínio; `hydrated` por `useSyncExternalStore`.
- Decisões para o README (seção "Decisões técnicas e trade-offs", adicionadas no finish): D29
  (store próprio + `useSyncExternalStore`, sem Context/biblioteca; `getSnapshot` com cache do parse;
  store criado por fábrica com `Storage` injetável para teste), D30 (snapshot com `voteCount`, chave
  `catalogo.favorites.v1`, payload versionado, ordem `savedAt` desc; dados podem envelhecer), D31
  (snapshot do servidor vazio; badge oculto até hidratar; coração começa vazio; `hydrated` por
  `useSyncExternalStore` em vez de `useEffect`), D32 (evento `storage` entre abas; `try/catch` com
  fallback em memória; payload inválido → lista vazia, sobrescrito na próxima gravação; itens
  inválidos descartados um a um), D36 (vazio de favoritos com os textos do protótipo e "Explorar
  filmes"), D43 (sincronização entre abas mantida por ser critério do backlog), mais a nota de que o
  `FavoriteButton` recebe `MovieSummary`/`MovieDetail`/`MovieCardData` sem adaptador e carimba
  `savedAt` só no clique (pilar 1).
