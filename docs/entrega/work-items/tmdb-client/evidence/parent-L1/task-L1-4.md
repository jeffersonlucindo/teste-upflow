# Evidência — Task #L1-4 — Cliente

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
`client.ts` é a única porta para o TMDB e a única com `import "server-only"`. Lê o token a cada chamada, monta a requisição com Bearer e cache por `fetch`, classifica falhas em `TmdbError` e expõe `getGenres`, `fetchListing` e `getMovieDetail`. Nenhuma página ou componente o importa ainda, então o build não precisa de token nem de rede.

## Tasks de execução realizadas
- [x] 4.1 `src/lib/tmdb/client.ts`: `tmdbFetch`, configuração e constantes
- [x] 4.2 `getGenres`, `fetchListing`, `getMovieDetail`
- [x] 4.3 Isolamento do domínio e build sem token

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/tmdb/client.ts` | criado | `tmdbFetch` e `readConfig` privadas, constantes `REVALIDATE_*`, `DETAIL_APPEND`, `VIDEO_LANGUAGES` e as três funções públicas |

## Decisões técnicas
- D12: Bearer no header `Authorization`, nunca `api_key` na URL; `TMDB_API_READ_TOKEN` lido só em `client.ts`, na chamada e não no carregamento do módulo; erro `config` com mensagem que nomeia a variável.
- D20: `cache: "force-cache"` com `next: { revalidate }`, o único mecanismo honrado nos dois modos de `cacheComponents`. Revalidate de 86 400 s para gêneros e 3 600 s para listagem e detalhe.
- D21: `TypeError` de rede vira `unavailable` com `cause`; `!res.ok` vira o `kind` do status; JSON inválido vira `unavailable`.
- `getMovieDetail` pede `append_to_response=credits,videos,translations` e `include_video_language`; `not_found` vira `null` e os demais `kind` sobem.
- `fetchListing` não chama `connection()` nem lê `searchParams`: isso é do componente que o chama.

## Resultado
`grep -rn "lib/tmdb" src/app src/components` vazio; `server-only` e `TMDB_API_READ_TOKEN` aparecem só em `client.ts`; sem `api_key` nem log do token. `npm run build` verde sem `.env.local` e sem rede, e nenhuma rota do build referencia `api.themoviedb.org`.

## Observações
`client.ts` não tem teste unitário: importa `server-only`, e a verificação contra a API real é a sonda do grupo 5. Os fallbacks de D18 e D19 não entraram no cliente porque a sonda confirmou o caminho de uma chamada só.

E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
