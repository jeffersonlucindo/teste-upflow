# Evidência — Task #L6-8 — Validação

**Parent item pai:** #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` passaram, com o build sem `.env.local` e sem rede. A suíte de testes cobre os arquivos existentes e os novos do change, e as tasks 6.1 a 6.7 estão registradas na evidência L6-6.

## Tasks de execução realizadas
- [x] 8.1 Rodar comandos de validação existentes
- [x] 8.2 Rodar testes existentes
- [x] 8.3 Conferir que as tasks 6.1–6.7 estão registradas na evidência e regenerar o HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/changes/detalhe-filme/tasks.md` | alterado | Tasks marcadas `[x]` |
| `.work/changes/detalhe-filme/.devflow.yaml` | alterado | Blocos `implementation` e `qa` |
| `.work/changes/detalhe-filme/change.html` | alterado | HTML do change regenerado |

## Decisões técnicas
Pilar 7 (build verde sem token e sem rede) e D42 (dois modos de `cacheComponents`).

## Resultado
- `npm run tokens:check`: 14 tokens em sincronia com `tokens.json`; nenhuma cor literal em `src/` (84 arquivos verificados).
- `npm run lint`: sem problemas.
- `npm run typecheck`: ok.
- `npm run test`: 31 arquivos e 342 testes passando (os novos: `parseMovieId` 12, `backHref` 12, `runtime` 12, `languageName` 6, `movieMeta` 5, `Overview` 8, `CastList` 5, `TrailerEmbed` 4 e `MovieHeader` 6).
- `npm run build`: verde, com `ƒ /`, `○ /_not-found`, `○ /favoritos` e `ƒ /movie/[id]`. Com `CATALOGO_CACHE_COMPONENTS=1`: verde, com `◐ /`, `○ /_not-found`, `○ /favoritos` e `◐ /movie/[id]`.

## Observações
`npm run e2e` não faz parte de `apply.validation`; o resultado dele (114 passed e 0 skipped) está nas evidências com tela.
