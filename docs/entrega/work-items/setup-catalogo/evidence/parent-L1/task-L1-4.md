# Evidência — Task #L1-4 — Ambiente

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O `.env.example` documenta as três variáveis do projeto e é versionado, enquanto `.env.local` segue ignorado. O `AGENTS.md` gerado pela CLI foi mantido para commit.

## Tasks de execução realizadas
- [x] 4.1 `.env.example`
- [x] 4.3 `AGENTS.md` e docs da versão

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.env.example` | criado | `TMDB_API_READ_TOKEN`, `TMDB_LANGUAGE=pt-BR` e `CATALOGO_CACHE_COMPONENTS` comentada |
| `AGENTS.md` | criado | Bloco `nextjs-agent-rules` da CLI, sem alteração |

## Decisões técnicas
- D10: `AGENTS.md` é commitado para a árvore não ficar suja a cada `next dev`.
- O token do TMDB é lido só no servidor e nunca recebe o prefixo `NEXT_PUBLIC_`.

## Resultado
`git check-ignore .env.example` sai com código 1 e `git check-ignore .env.local` imprime o caminho. O hash do `AGENTS.md` ficou igual depois de duas execuções do `next dev`.

## Observações
O repositório ainda não tem commits, então o critério "git status limpo" foi verificado pela comparação de hash do `AGENTS.md`.
