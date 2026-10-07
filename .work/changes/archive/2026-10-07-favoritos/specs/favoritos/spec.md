## Requisitos ADICIONADOS

### Requisito: Persistência dos favoritos no navegador
O sistema DEVE guardar os favoritos em `localStorage` sob a chave `catalogo.favorites.v1`, no payload
`{ "version": 1, "items": [...] }`, com cada item sendo um `FavoriteSnapshot`
`{ id, title, posterPath, voteAverage, voteCount, releaseDate, savedAt }` e os itens ordenados por
`savedAt` decrescente; nenhuma chamada ao TMDB é feita para listar favoritos.
Placement: `src/lib/favorites/store.ts` (`FAVORITES_STORAGE_KEY`, `FAVORITES_PAYLOAD_VERSION`,
`FavoriteMovie`, `FavoriteSnapshot`, `FavoritesPayload`, `toFavoriteSnapshot`, `serializeFavorites`,
`sortFavorites`, `createFavoritesStore`, `favoritesStore`); origem dos campos em
`src/lib/tmdb/types.ts` (`MovieSummary`, `MovieDetail`).

#### Cenário: Primeiro favorito
- QUANDO o usuário favorita um filme sem nenhum favorito gravado
- ENTÃO `localStorage["catalogo.favorites.v1"]` passa a ser `{"version":1,"items":[<snapshot>]}`
- E o snapshot tem exatamente as chaves `id`, `title`, `posterPath`, `voteAverage`, `voteCount`, `releaseDate` e `savedAt` (número, epoch em ms)

#### Cenário: Snapshot a partir de qualquer origem
- QUANDO `toFavoriteSnapshot(movie, savedAt)` recebe um `MovieSummary`, um `MovieDetail` ou um `MovieCardData`
- ENTÃO devolve só os seis campos do filme mais `savedAt`
- E campos extras da origem (`cast`, `overview`, `genres`, `posterUrl`, `releaseYear`) não entram no snapshot

#### Cenário: Ordem por data de inclusão
- QUANDO dois filmes são favoritados em momentos diferentes
- ENTÃO o mais recente vem primeiro em `getSnapshot()` e em `/favoritos`
- E a ordem gravada no payload é a mesma (`savedAt` desc)

#### Cenário: Reload mantém
- QUANDO o usuário recarrega `/` ou `/favoritos` com favoritos gravados
- ENTÃO os corações dos filmes favoritados aparecem preenchidos após a hidratação
- E `/favoritos` lista os mesmos filmes

### Requisito: Validação e resiliência do payload
O sistema DEVE validar o payload com type guards próprios (sem biblioteca), tratar payload inválido
como lista vazia sem lançar, descartar itens inválidos um a um, e continuar funcionando em memória
quando o `localStorage` lançar exceção.
Placement: `src/lib/favorites/store.ts` (`isFavoriteSnapshot`, `isFavoritesPayload`,
`parseFavorites`, `createFavoritesStore` com `try/catch` e fallback em memória).

#### Cenário: JSON inválido
- QUANDO a chave contém `{oops` (ou `""`, ou um array solto, ou `{"version":2,...}`)
- ENTÃO `getSnapshot()` devolve lista vazia sem lançar
- E `/favoritos` mostra o estado vazio e o badge fica oculto, sem `error.tsx` nem erro no console

#### Cenário: Item inválido no meio da lista
- QUANDO `items` contém um objeto sem `savedAt` (ou com `id` não numérico) entre dois itens válidos
- ENTÃO só o item inválido é descartado
- E os dois válidos continuam listados

#### Cenário: Sobrescrita na próxima gravação
- QUANDO a chave está corrompida e o usuário favorita um filme
- ENTÃO a chave passa a conter um payload válido com apenas esse filme
- E nada é gravado durante a leitura (o reparo acontece só na gravação)

#### Cenário: Duplicata de id
- QUANDO o payload traz o mesmo `id` duas vezes com `savedAt` diferentes
- ENTÃO fica uma única entrada, a de `savedAt` maior

#### Cenário: localStorage indisponível
- QUANDO `window.localStorage` lança ao ser acessado, lido ou gravado (cookies bloqueados, modo privado antigo, quota)
- ENTÃO favoritar continua alternando o coração e a contagem dentro da sessão
- E nenhum erro é exibido; após reload a lista volta vazia

### Requisito: Alternar favorito
O sistema DEVE adicionar ou remover um filme dos favoritos por um único toggle, carimbando `savedAt`
apenas no momento do clique no client, e refletir a mudança em todos os consumidores da mesma aba.
Placement: `src/lib/favorites/store.ts` (`toggleInFavorites`, `hasFavorite`,
`FavoritesStore.toggle`), `src/lib/favorites/useFavorites.ts` (`toggle`, `isFavorite`),
`src/components/favorites/FavoriteButton.tsx` (`onClick`).

#### Cenário: Adicionar
- QUANDO o usuário clica no coração de um filme que não é favorito
- ENTÃO o filme entra no topo da lista com `savedAt = Date.now()` avaliado no handler
- E o botão passa a `aria-pressed="true"` com o nome "Remover dos favoritos"

#### Cenário: Remover
- QUANDO o usuário clica no coração de um filme que já é favorito
- ENTÃO o filme sai da lista
- E o botão volta a `aria-pressed="false"` com o nome "Adicionar aos favoritos"

#### Cenário: Consumidores da mesma aba
- QUANDO o toggle acontece
- ENTÃO o `FavoritesBadge`, a `FavoritesList` e qualquer outro `FavoriteButton` do mesmo filme refletem a mudança sem recarregar
- E a função pura `toggleInFavorites` não muta a lista recebida

#### Cenário: Nenhum relógio no render
- QUANDO `/`, `/favoritos` ou o detalhe são renderizados no servidor ou no client
- ENTÃO nenhum componente ou hook chama `Date.now()`
- E o único `Date.now()` do domínio está no parâmetro padrão de `FavoritesStore.toggle`

### Requisito: Hidratação sem mismatch
O sistema DEVE renderizar no servidor e na hidratação o estado "sem favoritos" (snapshot do servidor
vazio), mantendo o badge oculto e os corações vazios até a hidratação terminar, e DEVE devolver
referências estáveis em `getSnapshot` enquanto o store não muda.
Placement: `src/lib/favorites/useFavorites.ts` (`useFavorites`: `items` e `hydrated` via
`useSyncExternalStore`), `src/lib/favorites/store.ts` (`getServerSnapshot`, cache do parse em
`getSnapshot`, `EMPTY_FAVORITES`), `src/components/favorites/FavoritesBadge.tsx`,
`src/components/favorites/FavoriteButton.tsx`, `src/components/favorites/FavoritesList.tsx`.

#### Cenário: HTML do servidor
- QUANDO `/` ou `/favoritos` é servida com favoritos gravados no navegador
- ENTÃO o HTML do servidor tem todos os corações com `aria-pressed="false"`, nenhum badge e nenhum card em `/favoritos`
- E o console não mostra aviso de hydration mismatch

#### Cenário: Depois de hidratar
- QUANDO a hidratação termina
- ENTÃO o badge aparece com o total, os corações dos favoritados ficam preenchidos e `/favoritos` mostra a lista ou o vazio
- E o badge nunca é exibido como "0"

#### Cenário: Referência estável
- QUANDO `getSnapshot()` é chamado duas vezes sem gravação entre elas
- ENTÃO devolve a mesma referência (`Object.is`)
- E com a chave ausente devolve `EMPTY_FAVORITES`, a mesma referência de `getServerSnapshot()`

#### Cenário: Navegação client-side
- QUANDO o usuário navega de `/` para `/favoritos` por `<Link>`
- ENTÃO a lista monta já com os favoritos (sem hidratação, `hydrated` é `true` de imediato)

### Requisito: Sincronização entre abas
O sistema DEVE refletir em uma aba as mudanças de favoritos feitas em outra aba da mesma origem, pelo
evento `storage` do `window`.
Placement: `src/lib/favorites/store.ts` (`FavoritesStore.subscribe` registra o listener de `storage`
com o primeiro assinante e remove com o último).

#### Cenário: Favoritar em outra aba
- QUANDO a aba A favorita um filme e a aba B está em `/favoritos`
- ENTÃO a aba B passa a listar o filme e o badge das duas abas mostra o novo total, sem reload

#### Cenário: Evento de outra chave
- QUANDO um `StorageEvent` chega com `key` diferente de `catalogo.favorites.v1`
- ENTÃO nenhum listener do store é notificado
- E um evento com `key === null` (`clear()` em outra aba) notifica

#### Cenário: Sem assinantes
- QUANDO o último componente que usa `useFavorites()` desmonta
- ENTÃO o listener de `storage` é removido do `window`

### Requisito: Botão de favorito
O sistema DEVE oferecer um `FavoriteButton` com as variantes `icon` (coração circular sobre o pôster
do card) e `full` (botão primário com texto, usado pelo detalhe), com `aria-pressed` e os nomes
"Adicionar aos favoritos" / "Remover dos favoritos", recebendo o filme sem `savedAt`.
Placement: `src/components/favorites/FavoriteButton.tsx` (client; `FavoriteButtonProps { movie:
FavoriteMovie; variant: "icon" | "full" }`); inserção no card em `src/components/movies/MovieCard.tsx`
(irmão do `<Link>` do pôster; `MovieCardData` já traz `posterPath` e `releaseDate`, contrato do
`listagem-filmes`).

#### Cenário: Variante icon
- QUANDO o card renderiza
- ENTÃO há um `button` de 40 × 40 px em `top-2.5 right-2.5` sobre `bg-overlay`, com `aria-label` e sem texto visível, irmão do link do pôster e fora dele
- E a ordem de tabulação é link do pôster → coração → link do título

#### Cenário: Coração ativo
- QUANDO o filme é favorito
- ENTÃO o SVG do coração fica preenchido e traçado em `accent` (`fill-accent text-accent`)
- E quando não é favorito, só o traço em `text-primary`

#### Cenário: Variante full
- QUANDO `variant="full"` renderiza com um `MovieDetail`
- ENTÃO o botão é `bg-accent text-on-accent min-h-11` com o texto visível "Adicionar aos favoritos" (ou "Remover dos favoritos" quando ativo) e coração `fill-current` quando ativo
- E não há `aria-label` duplicando o texto

#### Cenário: Sem adaptador
- QUANDO o botão recebe um `MovieSummary`, um `MovieDetail` ou um `MovieCardData`
- ENTÃO compila e persiste apenas os seis campos do snapshot

### Requisito: Badge de contagem no header
O sistema DEVE mostrar, dentro do `NavLink` Favoritos, a quantidade de favoritos quando for maior que
zero, com `aria-label` "N favoritos" ("1 favorito" no singular), e DEVE omiti-lo no servidor, durante a
hidratação e quando o total for zero.
Placement: `src/components/favorites/FavoritesBadge.tsx` (client), `src/components/layout/Header.tsx`
(`<NavLink href="/favoritos">Favoritos<FavoritesBadge /></NavLink>`).

#### Cenário: Com favoritos
- QUANDO há 3 favoritos gravados e a hidratação terminou
- ENTÃO o badge mostra "3" sobre `border-subtle` e o nome acessível da aba inclui "3 favoritos"

#### Cenário: Sem favoritos
- QUANDO não há favoritos
- ENTÃO nada é renderizado no lugar do badge

#### Cenário: Singular
- QUANDO há 1 favorito
- ENTÃO o `aria-label` é "1 favorito"

### Requisito: Página de favoritos
O sistema DEVE responder `/favoritos` como página estática com `h1` "Meus favoritos", o subtítulo "Os
filmes salvos ficam neste navegador." e a `FavoritesList`, que não renderiza nada antes de hidratar,
mostra o `EmptyState` do protótipo quando vazia e o `MovieGrid` com os favoritos quando há itens.
Placement: `src/app/favoritos/page.tsx` (RSC estático, `metadata.title` "Meus favoritos"),
`src/components/favorites/FavoritesList.tsx` (client), reutilizando `src/components/movies/MovieGrid.tsx`,
`src/components/movies/MovieCard.tsx` (`toMovieCardData`) e `src/components/ui/EmptyState.tsx`.

#### Cenário: Vazio
- QUANDO não há favoritos
- ENTÃO aparece o `EmptyState` com ícone `heart`, "Você ainda não salvou nenhum filme.", "Toque no coração de um pôster para guardá-lo aqui." e a ação "Explorar filmes" levando a `/`

#### Cenário: Com itens
- QUANDO há favoritos
- ENTÃO o `MovieGrid` (`ul role="list"`) mostra um card por favorito, do mais recente ao mais antigo, com pôster `w342` (ou placeholder), meta "Nota X,X · AAAA" (ou "Sem nota"), coração preenchido e link `/movie/{id}` sem `?from=`

#### Cenário: Remover da página
- QUANDO o usuário clica no coração de um card em `/favoritos`
- ENTÃO o card some e o badge diminui
- E com o último removido aparece o estado vazio

#### Cenário: Página estática
- QUANDO `npm run build` roda sem `.env.local`, com ou sem `CATALOGO_CACHE_COMPONENTS=1`
- ENTÃO `/favoritos` aparece como `○` e o build não faz nenhuma requisição externa
- E `next dev` com a flag abre `/favoritos` sem insight de blocking-route nem de IO síncrono

### Requisito: Testes do store e do hook
O sistema DEVE ter testes unitários das funções puras e do store (com `Storage` injetada) e do hook
(com `renderHook`), cobrindo validação, ordem, toggle, referência estável, evento `storage` e fallback
em memória.
Placement: `src/lib/favorites/store.test.ts`, `src/lib/favorites/useFavorites.test.tsx`; testes de
componente (cortáveis por D43) em `src/components/favorites/*.test.tsx` e ajuste de
`src/components/movies/MovieCard.test.tsx`.

#### Cenário: Store com storage injetada
- QUANDO `createFavoritesStore(() => localStorage)` é usado nos testes
- ENTÃO cada teste cria seu store sem estado de módulo compartilhado
- E `createFavoritesStore(() => { throw ... })` exercita o fallback em memória sem tocar no `localStorage`

#### Cenário: Hook
- QUANDO `renderHook(() => useFavorites())` roda no jsdom
- ENTÃO `hydrated` é `true`, `toggle` grava e `items` reflete; um `StorageEvent` disparado em `act` atualiza `items`; um `rerender` sem mudança mantém a referência de `items`
