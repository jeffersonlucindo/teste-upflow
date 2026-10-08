# Evidência — Task #L9-2 — Listagem

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
A listagem passou a seguir a última ação do usuário e a URL: a busca pendente não sobrescreve mais o gênero escolhido, um gênero que o TMDB não lista vira "Todos", o título acompanha a busca e os links da paginação mostram que estão carregando.

## Tasks de execução realizadas
- [x] 2.1 `FilterBar`: última ação vence entre busca pendente e filtro
- [x] 2.2 Gênero desconhecido na URL vira "Todos"
- [x] 2.3 Título da listagem durante a busca
- [x] 2.4 Indicador de carregamento na paginação

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | alterado | `pushFilter` cancela o timer, limpa o campo e zera `committedRef`; o gênero lido da URL passa por `resolveGenreId` |
| `src/components/movies/FilterBar.test.tsx` | alterado | Casos com relógio falso para a corrida |
| `src/lib/listing/resolveGenre.ts` | criado | `resolveGenreId(genreId, genres)`: devolve o id se a lista o tem, senão `null` |
| `src/lib/listing/resolveGenre.test.ts` | criado | Id presente, ausente, `null` e lista vazia |
| `src/lib/listing/emptyState.ts` | criado | `resolveEmptyState`, a escolha do estado vazio extraída de `MovieResults` (ajuste do QA) |
| `src/lib/listing/emptyState.test.ts` | criado | Testes da função |
| `src/components/movies/MovieResults.tsx` | alterado | Resolve o gênero (`getGenres()` só quando a URL traz `genre`) antes de `fetchListing`; usa `resolveEmptyState` |
| `src/components/movies/ListingTitle.tsx` | criado | Server Component assíncrono: "Resultados da busca" com `q`, "Filmes populares" sem |
| `src/app/page.tsx` | alterado | `ListingTitle` sob `<Suspense>` com o `h1` atual como fallback |
| `src/components/movies/PaginationPending.tsx` | criado | Ilha client com `useLinkStatus` |
| `src/components/movies/PaginationPending.test.tsx` | criado | Testes do indicador |
| `src/components/movies/Pagination.tsx` | alterado | Indicador dentro dos dois links; continua Server Component |
| `src/components/movies/Pagination.test.tsx` | alterado | Cobre o indicador |

## Decisões técnicas
Decisão 1 (última ação vence; a busca digitada e não enviada é descartada ao escolher filtro, porque os selects só existem fora do modo busca), decisão 2 (D47: gênero desconhecido vira o padrão, como `sort` inválido), decisão 3 (título segue a URL; a página não lê `searchParams`) e decisão 4 (ilha client nova, registrada em `components.md`: `useLinkStatus` só existe no client). O ponto do indicador sai do fluxo (posicionamento absoluto na folga do `px-5`), para a largura do botão não mudar.

## Resultado
- Digitar e escolher o gênero em menos de 350 ms leva a uma URL com `genre` e sem `q`, sem segunda navegação.
- `/?genre=999999` mostra os populares com o select em "Todos"; `/?genre=16` continua filtrando.
- `/?q=...` mostra "Resultados da busca"; `/` mostra "Filmes populares"; um `h1` por página.
- O link de paginação clicado mostra o indicador até a página chegar.

## Resultado do QA
Lido do bloco `qa` do arquivo de estado do change em `.work/changes/correcoes-entrega/` (2 iterações, 14 findings resolvidos, nenhum em aberto, `status: passed`). Nada foi rodado de novo para esta evidência.
- **E2E:** `pass`. `npm run e2e` registrou 132 execuções passadas e 0 skipped: 66 testes em 5 specs (`correcoes-entrega` 10, `detalhe-filme` 16, `favoritos` 22, `listagem-filmes` 16, `shell` 2), cada um nos projetos `desktop` (1280 px) e `mobile` (390 px). A contagem por spec vem de `playwright test --list` no projeto desktop.
- **Layout:** `pass`. Gates de `e2e/support/layout.ts` em 1280 e 390 px (sem overflow horizontal, cores por token, alvos mínimos, variável de fonte, anel de foco) e revisão visual dos screenshots, sem findings em aberto.

Telas do change nesta task:

| Tela | Desktop | Mobile |
|------|---------|--------|
| Gênero desconhecido vira "Todos" | ![](../layout/desktop-correcoes-genero-desconhecido.png) | ![](../layout/mobile-correcoes-genero-desconhecido.png) |
| Listagem carregada | ![](../layout/desktop-listagem-carregado.png) | ![](../layout/mobile-listagem-carregado.png) |
| Busca com título "Resultados da busca" | ![](../layout/desktop-listagem-busca.png) | ![](../layout/mobile-listagem-busca.png) |

## Observações
- **Sem E2E:** o estado vazio por filtros ("Limpar filtros") não tem teste de ponta a ponta. Com a decisão 2, `/?genre=999999` deixou de produzir o estado vazio, e não há combinação estável de filtros sem resultado no TMDB real. O teste E2E "gênero sem resultado mostra Limpar filtros" foi removido de `listagem-filmes.spec.ts`. A escolha do estado é coberta por `emptyState.test.ts`; a ligação do botão no navegador não é.
- O estado pendente da paginação (o indicador visível) não tem screenshot: foi conferido pelo código e pelo cenário de carregamento do E2E, não por captura.
- O indicador é melhoria, não defeito: era o primeiro item a cortar se o escopo apertasse; foi entregue.
