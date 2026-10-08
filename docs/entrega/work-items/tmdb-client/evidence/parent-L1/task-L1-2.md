# Evidência — Task #L1-2 — Tipos e erros

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
`types.ts` declara os tipos de domínio consumidos pelos próximos changes e os DTOs com o formato cru da API (sufixo `Dto`, snake_case). `errors.ts` define `TmdbError` com um `kind` classificado a partir do status HTTP, sem importar `server-only`, para ser testável no Vitest.

## Tasks de execução realizadas
- [x] 2.1 `src/lib/tmdb/types.ts`
- [x] 2.2 `src/lib/tmdb/errors.ts` + `errors.test.ts`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/tmdb/types.ts` | criado | `Genre`, `MovieSummary`, `ListingSort`, `ListingQuery`, `ListingResult`, `CastMember`, `MovieOverview`, `MovieTrailer`, `MovieDetail` e os DTOs `Tmdb*Dto` |
| `src/lib/tmdb/errors.ts` | criado | `TmdbErrorKind`, `TmdbError` (`kind`, `status`, `cause`, `name`) e `errorKindFromStatus` |
| `src/lib/tmdb/errors.test.ts` | criado | 12 testes: mapeamento de 400, 401, 403, 404, 422, 429, 500 e 503; `name`, `instanceof Error`, `status` e `cause` preservados |

## Decisões técnicas
- D21: erro classificado por `kind` (`config`, `unauthorized`, `not_found`, `rate_limited`, `unavailable`); 401 e 403 viram `unauthorized`, 404 `not_found`, 429 `rate_limited`, o resto `unavailable`.
- `TmdbError` mora em `errors.ts`, e não em `client.ts`, porque é pura e módulos testados no Vitest não importam `server-only`.
- `MovieSummary` e `MovieDetail` compartilham `id`, `title`, `posterPath`, `voteAverage`, `voteCount` e `releaseDate` com os mesmos tipos, a base do `FavoriteSnapshot` (D30).

## Resultado
`npx tsc --noEmit` verde, sem `any`; `errors.test.ts` com 12 testes verdes.

## Observações
Um teste além do especificado cobre o status 400, que a sonda observou na página 501 (task 5.4).

E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
