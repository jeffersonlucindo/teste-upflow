# Evidência — Task #L9-4 — Detalhe e 404

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
Rotas sem correspondência ganharam uma tela em português dentro do layout. Id de filme inválido passou a responder 404 de verdade, decidido antes de qualquer streaming, e sinopse e trailer passaram a seguir `TMDB_LANGUAGE`.

## Tasks de execução realizadas
- [x] 4.1 `not-found.tsx` na raiz, em português
- [x] 4.2 404 real para id de filme inválido
- [x] 4.3 Sinopse e trailer seguem `TMDB_LANGUAGE`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/app/not-found.tsx` | criado | "Página não encontrada" com ação "Voltar à listagem" e `metadata.title` |
| `src/proxy.ts` | criado | `config.matcher = "/movie/:id"`; id inválido (por `parseMovieId`) vira `rewrite` para `/_nao-encontrado`; válido segue |
| `src/proxy.test.ts` | criado | Decisão por id |
| `src/lib/tmdb/types.ts` | alterado | `MovieOverview.fallback` |
| `src/lib/tmdb/pickOverview.ts` | alterado | Preenche `fallback` conforme o idioma pedido |
| `src/lib/tmdb/pickTrailer.ts` | alterado | Ordena idioma pedido, `en`, outros |
| `src/lib/tmdb/params.ts` | alterado | `videoLanguages(language)` puro, no lugar da constante de `client.ts` |
| `src/lib/tmdb/client.ts` | alterado | `include_video_language` derivado do idioma |
| `src/lib/tmdb/mappers.ts` | alterado | Repassa o idioma |
| `src/components/movie-detail/Overview.tsx` | alterado | Aviso segue `fallback`; `lang` do parágrafo segue o idioma do texto contra o do documento |
| `src/lib/tmdb/pickOverview.test.ts`, `pickTrailer.test.ts`, `mappers.test.ts`, `params.test.ts` | alterado | Casos com `es-ES` e `en-US`; chave `fallback` nas asserções |
| `src/components/movie-detail/Overview.test.tsx`, `MovieHeader.test.tsx` | alterado | Casos de idioma; fixture com `fallback` |

## Decisões técnicas
Decisão 6 (not-found da raiz, dentro do layout), decisão 7 (D46: o `notFound()` do detalhe acontece depois de a resposta começar e o status sai 200; o proxy confere o id antes, sem chamar o TMDB) e decisão 8 (idioma de ponta a ponta nos dados; com `pt-BR` o resultado é idêntico ao anterior). O `rewrite` devolveu 404 nos dois modos de cache, então a alternativa com `status` explícito não foi necessária. O `notFound()` de `MovieDetails` fica como segunda barreira.

## Resultado
Com `next start`, `curl -I` devolveu 404 em `/movie/abc`, `/movie/0603`, `/movie/0`, `/movie/603abc`, `/naoexiste` e `/movie`, e 200 em `/movie/603` e em `/movie/999999999` (filme que o TMDB não conhece: continua "Filme não encontrado" com 200). Consequência visível: `/movie/abc` mostra "Página não encontrada" em vez de "Filme não encontrado".

## Resultado do QA
Lido do bloco `qa` do arquivo de estado do change em `.work/changes/archive/2026-10-08-correcoes-entrega/` (2 iterações, 14 findings resolvidos, nenhum em aberto, `status: passed`). Nada foi rodado de novo para esta evidência.
- **E2E:** `pass`. `npm run e2e` registrou 132 execuções passadas e 0 skipped: 66 testes em 5 specs (`correcoes-entrega` 10, `detalhe-filme` 16, `favoritos` 22, `listagem-filmes` 16, `shell` 2), cada um nos projetos `desktop` (1280 px) e `mobile` (390 px). A contagem por spec vem de `playwright test --list` no projeto desktop. Em `detalhe-filme.spec.ts`, os ids inválidos passaram a esperar status 404 e a tela da raiz, e o filme inexistente confere 200 e `h1` único.
- **Layout:** `pass`. Gates de `e2e/support/layout.ts` em 1280 e 390 px e revisão visual dos screenshots, sem findings em aberto.

Telas do change nesta task:

| Tela | Desktop | Mobile |
|------|---------|--------|
| Página não encontrada (`/naoexiste`) | ![](../layout/desktop-correcoes-pagina-nao-encontrada.png) | ![](../layout/mobile-correcoes-pagina-nao-encontrada.png) |
| Id inválido (404 com a tela da raiz) | ![](../layout/desktop-detalhe-id-invalido.png) | ![](../layout/mobile-detalhe-id-invalido.png) |
| Filme não encontrado (id válido que o TMDB não conhece) | ![](../layout/desktop-detalhe-not-found.png) | ![](../layout/mobile-detalhe-not-found.png) |

## Observações
- **Sem E2E:** sinopse e trailer com `TMDB_LANGUAGE` diferente de `pt-BR` não têm teste de ponta a ponta, porque o servidor de E2E roda com um idioma só. A cobertura é de testes unitários (`pickOverview`, `pickTrailer`, `params`, `Overview`, com `es-ES` e `en-US`).
- Id válido que o TMDB não conhece continua com status 200 (limite declarado no design e no README): 404 real exigiria buscar o filme antes de a resposta começar, o que custa o shell estático.
- Com `CATALOGO_CACHE_COMPONENTS=1`, o `next start` precisa da mesma variável do build; sem ela a rota dinâmica responde 500.
