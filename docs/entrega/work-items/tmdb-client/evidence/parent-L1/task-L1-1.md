# Evidência — Task #L1-1 — Preparação sobre a base do setup-catalogo

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
A base do `setup-catalogo` foi inspecionada e recebeu a única dependência de runtime nova do change, `server-only`, que faz o build falhar se um componente client importar o cliente do TMDB. A pasta do domínio `src/lib/tmdb/` e a de fixtures foram criadas, sem `utils/` genérico.

## Tasks de execução realizadas
- [x] 1.1 Inspecionar a base e instalar `server-only`
- [x] 1.2 Criar a pasta do domínio

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json` | alterado | Dependência `server-only` (^0.0.1) |
| `package-lock.json` | alterado | Lock da nova dependência |
| `src/lib/tmdb/` | criado | Pasta do domínio, a única porta para a API |
| `src/lib/tmdb/fixtures/` | criado | Pasta das respostas de exemplo usadas nos testes |

## Decisões técnicas
- D12: o token só existe no servidor; `server-only` é a trava em tempo de build.
- Pilar 2 de `.work/config.yaml > context`: `src/lib/<domínio>/`, teste ao lado, sem `utils/`.
- O `tsconfig.json`, o `vitest.config.mts`, o `.env.example` e o `next.config.ts` já atendiam ao que o change precisa e não foram alterados.

## Resultado
`npm ls server-only` lista a versão sem erro e `src/lib/` contém só `tmdb/`.

## Observações
E2E e layout: `not-applicable` (o change não toca `src/app/**` nem `src/components/**`; não há tela, então não há screenshots a copiar).

QA (`.work/changes/archive/2026-10-07-tmdb-client/.devflow.yaml > qa`): 2 iterações, 8 findings resolvidos, `functional: pass` (`npm run check` com 95 testes em 8 arquivos e `npm run build` verdes), status `advisory-only`, com dois advisory baixos em aberto, ambos de `README.md`: a linha `@source not "../../.work"` já existe em develop e está fora do diff deste change; o diff da árvore mistura trechos de Playwright/E2E do ferramental, que ficam fora dos commits deste change.
