# Evidência — Task #L8-6 — Validação

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
Os cinco comandos de `apply.validation` e o build com a flag foram executados sem `.env.local`, depois de o README estar escrito. Todos passaram.

## Tasks de execução realizadas
- [x] 6.1 Rodar comandos de validação existentes
- [x] 6.2 Rodar testes existentes
- [x] 6.3 Conferência final com a flag ligada

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (execução) | — | Nenhum arquivo alterado |

## Decisões técnicas
D42 (cinco comandos nomeados; segundo build com a flag) e o pilar 7 (build sem token e sem rede). Nada em `src/` mudou neste change.

## Resultado
`npm run tokens:check`: 14 tokens em sincronia, nenhuma cor literal em 84 arquivos. `npm run lint` e `npm run typecheck`: exit 0. `npm run test`: 31 arquivos, 342 testes. `npm run build`: `ƒ /`, `○ /_not-found`, `○ /favoritos`, `ƒ /movie/[id]`. `CATALOGO_CACHE_COMPONENTS=1 npm run build`: `◐ /`, `○ /favoritos`, `◐ /movie/[id]`. A seção "Flags" do README confere com o observado.

## Observações
Nenhuma
