# Evidência — Task #L1-7 — Validação

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` passaram, com o build sem `.env.local` e sem rede. O backlog mantém L1 como `doing` até o finish deste change, e o HTML do change foi regenerado.

## Tasks de execução realizadas
- [x] 7.1 Rodar comandos de validação existentes: `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- [x] 7.2 Rodar testes existentes: `npm run test`
- [x] 7.3 Conferir o backlog e D17 a D19 de `decisoes.md` e regenerar o HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/changes/tmdb-client/change.html` | alterado | HTML do change regenerado por `htmlgen.mjs` |

## Decisões técnicas
- Pilar 7: o build passa sem token e sem rede, pois nenhuma página importa `src/lib/tmdb/` ainda.

## Resultado
`npm run test`, rodado na geração desta evidência: 8 arquivos e 95 testes verdes. Os seis arquivos de `src/lib/tmdb/` somam 82 (errors 12, images 10, mappers 19, params 22, pickOverview 9, pickTrailer 10), mais 6 do `NavLink` e 7 do `Button`. A última validação registrada em `.devflow.yaml` foi `passed`, sem falhas, em 2026-10-07T12:48:47Z.

## Observações
E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
