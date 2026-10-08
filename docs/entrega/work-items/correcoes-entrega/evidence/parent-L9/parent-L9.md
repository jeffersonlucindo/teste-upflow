# Correções da revisão da entrega — Resumo de Implementação

**Parent item:** L9
**Data:** 2026-10-08
**Status:** Implementado

## Resumo
A revisão da entrega `v0.1.0` aprovou os requisitos L1 a L8 e apontou defeitos de borda que contradiziam o próprio README. Este change os corrige sem reabrir nenhum requisito: a busca pendente não apaga mais o gênero escolhido, gênero desconhecido na URL vira "Todos", um `posterPath` adulterado no `localStorage` não derruba mais `/favoritos`, rotas inexistentes e ids de filme inválidos respondem 404 com tela em português, e sinopse e trailer seguem `TMDB_LANGUAGE`. Entraram também o skip-link, o `h1` nas telas de erro e de não encontrado, o título da busca e o indicador de carregamento na paginação. O README ganhou o clone correto, as contagens corrigidas e a seção "Processo"; os registros foram atualizados e o `setup-catalogo` foi arquivado.

## Tasks realizadas
- **[L9-1]: Reprodução** — defeitos reproduzidos por `next dev`, `curl -I` e testes que falhavam antes da correção.
- **[L9-2]: Listagem** — última ação vence entre busca e filtro, gênero desconhecido vira "Todos", `ListingTitle` acompanha a busca e `PaginationPending` mostra o carregamento dos links.
- **[L9-3]: Favoritos e imagens** — `isTmdbImagePath` valida o caminho em `images.ts`; favorito com pôster inválido é mantido sem pôster.
- **[L9-4]: Detalhe e 404** — `not-found.tsx` da raiz, `src/proxy.ts` com 404 real para id inválido, e idioma de sinopse e trailer derivado de `TMDB_LANGUAGE`.
- **[L9-5]: Shell e acessibilidade** — skip-link no layout e `h1` via `EmptyState.headingLevel` nas telas de erro e de não encontrado.
- **[L9-6]: Projeto** — `engines.node` alinhado ao que `next`, `vite`, `vitest` e `jsdom` exigem.
- **[L9-7]: README** — clone, Node, contagens, "Em resumo", "Processo" e parágrafos das decisões.
- **[L9-8]: Registros** — D8 revisada e D45 a D48, contratos, referências a ferramental local removidas, `setup-catalogo` arquivado.
- **[L9-9]: E2E** — `correcoes-entrega.spec.ts` (10 testes) e ajustes nos specs de detalhe e listagem.
- **[L9-10]: Validação** — `apply.validation` verde sem token e sem rede; build verde com `CATALOGO_CACHE_COMPONENTS=1`; E2E verde.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` (+ teste) | alterado | Última ação vence; gênero resolvido contra a lista |
| `src/lib/listing/resolveGenre.ts`, `emptyState.ts` (+ testes) | criado | Funções puras de gênero e de estado vazio |
| `src/components/movies/MovieResults.tsx` | alterado | Resolve o gênero antes de buscar; usa `resolveEmptyState` |
| `src/components/movies/ListingTitle.tsx`, `PaginationPending.tsx` (+ teste) | criado | Título da busca; ilha client do indicador |
| `src/components/movies/Pagination.tsx`, `src/app/page.tsx` (+ teste) | alterado | Integram o indicador e o título |
| `src/lib/tmdb/images.ts`, `src/lib/favorites/store.ts` (+ testes) | alterado | Caminho de imagem validado; favorito sem pôster inválido |
| `src/app/not-found.tsx`, `src/proxy.ts` (+ teste do proxy) | criado | 404 em português e 404 real para id inválido |
| `src/lib/tmdb/{types,pickOverview,pickTrailer,params,client,mappers}.ts` (+ testes), `Overview.tsx` | alterado | Idioma dos dados de ponta a ponta |
| `src/app/layout.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `src/app/movie/[id]/not-found.tsx` (+ testes) | alterado | Skip-link e `h1` |
| `package.json`, `package-lock.json` | alterado | `engines.node` |
| `README.md` | alterado | Correções de conteúdo, "Em resumo" e "Processo" |
| `.work/design/{decisoes,components,README}.md`, `.work/config.yaml`, `.work/backlog.md`, `eslint.config.mjs` | alterado | Registros |
| `.work/changes/archive/*`, `.work/specs/projeto-base/`, `.work/prompts/explore-inicial.md` | alterado, criado, removido | Referências corrigidas, `setup-catalogo` arquivado, roteiro de sessão removido |
| `e2e/correcoes-entrega.spec.ts`, `detalhe-filme.spec.ts`, `listagem-filmes.spec.ts` | criado, alterado | E2E dos comportamentos corrigidos |

## Decisões técnicas
- Última ação vence entre busca e filtro; a busca digitada e não enviada é descartada ao escolher um filtro.
- D47: gênero desconhecido vira o padrão, como `sort` inválido, sem tela de erro.
- D48: o caminho de imagem é validado em `images.ts`, o único ponto que monta a URL.
- D46: `src/proxy.ts` confere o id antes de qualquer streaming e faz `rewrite` para um caminho sem rota; id válido que o TMDB não conhece continua 200 com "Filme não encontrado".
- `TMDB_LANGUAGE` guia sinopse (`fallback`) e trailer (`videoLanguages`); o texto do aviso continua em português.
- Ilha client nova, fora da lista do pilar 1 e registrada em `components.md`: `PaginationPending` (`useLinkStatus` só existe no client).
- D45: o README passa a ter a seção "Processo" e a regra de que ele trata só do código cai; D8 revisada.
- Evidências e documentos do change não citam hash de commit; referência a commit é pelo título.

## Resultado
Os defeitos da revisão estão corrigidos e cobertos por teste: o resultado final de QA é `passed` (2 iterações, 14 findings resolvidos, nenhum em aberto), com `npm run check` em 409 testes de 35 arquivos, build verde e `npm run e2e` com 132 execuções passadas e 0 skipped (66 testes em 5 specs, desktop e mobile). Gates de layout em 1280 e 390 px e revisão visual passaram. Números lidos de `qa` do arquivo de estado do change, sem nova execução na geração desta evidência.

**Fora de cobertura de ponta a ponta, sem suavizar:**
- Estado vazio por filtros ("Limpar filtros"): não há combinação estável sem resultado no TMDB real; coberto só por `resolveEmptyState.test`.
- Sinopse e trailer com `TMDB_LANGUAGE` diferente de `pt-BR`: o servidor de E2E tem um idioma só; coberto só por teste unitário.

**Limites mantidos:** id válido que o TMDB não conhece responde 200; busca combinada com gênero e ordenação continua fora (trade-off principal do README).

Screenshots das telas do change (8 telas, desktop e mobile) em `../layout/`.
