# Evidência — Task #L1-6 — Validação

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` passaram na raiz do repositório. A decisão D11 foi conferida contra o código, L1 e L8 foram marcados como `doing` no backlog e o HTML do change foi regenerado.

## Tasks de execução realizadas
- [x] 6.1 Rodar comandos de validação existentes
- [x] 6.2 Rodar testes existentes
- [x] 6.3 Conferir D11, marcar `L1` como `doing` e regenerar o HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/backlog.md` | alterado | L1 e L8 em `doing` |
| `.work/changes/setup-catalogo/tasks.md` | alterado | 24 tasks marcadas `[x]` |
| `.work/changes/setup-catalogo/.devflow.yaml` | alterado | `implementation.status: completed`, `validated: true` |
| `.work/changes/setup-catalogo/change.html` | criado | Página estática do change |

## Decisões técnicas
- D42: validação com cinco comandos nomeados.

## Resultado
| Comando | Saída |
|---|---|
| `npm run tokens:check` | 14 tokens em sincronia; nenhuma cor literal em `src/` (10 arquivos) |
| `npm run lint` | sem erros nem avisos |
| `npm run typecheck` | tipos de rota gerados; `tsc --noEmit` limpo |
| `npm run test` | 2 arquivos, 13 testes verdes |
| `npm run build` | verde; `/`, `/_not-found` e `/favoritos` estáticas |

## Observações
O ESLint também cobre `.claude/devflow/tools/htmlgen.mjs`, porque o design só ignora `.work/` e `scripts/`.
