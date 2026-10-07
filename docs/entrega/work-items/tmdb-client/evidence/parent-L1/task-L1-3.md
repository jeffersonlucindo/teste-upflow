# Evidência — Task #L1-3 — Fixtures, funções puras e testes

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
Três fixtures JSON e cinco módulos puros, todos com teste ao lado: montadores de parâmetros do discover e da busca, URLs de imagem, escolha da sinopse com fallback de idioma, escolha do trailer e mapeadores de DTO para domínio. Nenhum importa `server-only` nem toca a rede; `todayUtc` recebe a data por argumento.

## Tasks de execução realizadas
- [x] 3.1 Fixtures JSON
- [x] 3.2 `params.ts` + `params.test.ts` (D13–D17)
- [x] 3.3 `images.ts` + `images.test.ts` (D23)
- [x] 3.4 `pickOverview.ts` + `pickOverview.test.ts` (D18)
- [x] 3.5 `pickTrailer.ts` + `pickTrailer.test.ts` (D19)
- [x] 3.6 `mappers.ts` + `mappers.test.ts`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/tmdb/fixtures/genres.json` | criado | 3 gêneros em pt-BR (28, 12, 878) |
| `src/lib/tmdb/fixtures/discover-page.json` | criado | Página com `total_pages` 51234 e 3 filmes: completo, sem pôster e sem data, e sem votos |
| `src/lib/tmdb/fixtures/movie-603.json` | criado | Detalhe de Matrix com elenco embaralhado, cinco vídeos e traduções pt-BR, en-US e ja |
| `src/lib/tmdb/params.ts` | criado | `buildDiscoverParams`, `buildSearchParams`, `buildListingRequest`, `clampPage`, `todayUtc` e constantes nomeadas |
| `src/lib/tmdb/params.test.ts` | criado | 22 testes, um por regra de D13 a D17 |
| `src/lib/tmdb/images.ts` | criado | `posterUrl`, `profileUrl`, tamanhos `w342`, `w500` e `w185` |
| `src/lib/tmdb/images.test.ts` | criado | 10 testes |
| `src/lib/tmdb/pickOverview.ts` | criado | Sinopse: idioma pedido, en-US, idioma original, primeira não vazia, `null` |
| `src/lib/tmdb/pickOverview.test.ts` | criado | 9 testes |
| `src/lib/tmdb/pickTrailer.ts` | criado | Só YouTube e Trailer, ordenado por oficial, idioma e data; devolve `{ key, name }` |
| `src/lib/tmdb/pickTrailer.test.ts` | criado | 10 testes |
| `src/lib/tmdb/mappers.ts` | criado | `toGenres`, `toMovieSummary`, `toListingResult`, `toCastMember`, `toMovieDetail`; elenco em 8 por `order`; `totalPages` limitado a 500 |
| `src/lib/tmdb/mappers.test.ts` | criado | 19 testes |

## Decisões técnicas
- D13 e D14: o discover não leva `language` nos parâmetros (o idioma entra no cliente); a busca descarta gênero e ordenação.
- D15: `vote_count.gte=200` só em `sort=rating`. D16: `primary_release_date.lte` (hoje em UTC) só em `sort=release`.
- D17: `clampPage` limita a página entre 1 e 500.
- D18: a sinopse cai em en-US, depois no idioma original, depois na primeira tradução com texto, e `null` ao final. O passo do idioma original refina D18 com desempate determinístico.
- D19: `pickTrailer` ordena por `official`, depois `pt` antes de `en`, depois `published_at` mais recente.
- D23: tamanhos de imagem fixos, e `null` para caminho ausente.
- Variantes das fixtures derivadas por spread nos testes, sem fixture extra.

## Resultado
Os seis arquivos de teste de `src/lib/tmdb/` somam 82 testes verdes (errors 12, images 10, mappers 19, params 22, pickOverview 9, pickTrailer 10); `npm run typecheck` verde.

## Observações
A task 5.5 deixava opcional trocar `movie-603.json` por um recorte da resposta real; a fixture ficou como desenhada, e os nomes e tipos dos campos conferem com a resposta da sonda.

E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
