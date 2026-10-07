# Evidência — Task #L2-1 — Inspeção da base

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
Inspeção do que o `setup-catalogo` e o `tmdb-client` deixaram (página, layout, `Button`, `NavLink`, tokens, `next.config.ts`, contrato de `src/lib/tmdb/`) e dos docs do Next instalado usados pelo change. Nada foi criado ou alterado.

## Tasks de execução realizadas
- [x] 1.1 Inspecionar o que os dois changes anteriores deixaram e os docs do Next usados

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (nenhum) | n/a | Task só de leitura |

## Decisões técnicas
A leitura de `connection.md`, do aviso de Suspense de `useSearchParams`, de `error.md` e de `image.md` fundamentou as decisões 4, 5, 8 e 13 do `design.md`. As divergências achadas depois estão em "Ajustes do apply" (ex.: `error.md` do 16.4 recomenda `retry()`).

## Resultado
Base confirmada para começar: `src/lib/` só com `tmdb/`, `src/components/` com `layout/` e `ui/`, `server-only` apenas em `src/lib/tmdb/client.ts`.

## Observações
Nenhuma.
