# Evidência — Task #L6-7 — Registro

**Parent item pai:** #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
**Data:** 2026-10-07

## Resumo
`components.md`, `decisoes.md` e `backlog.md` foram atualizados com o contrato final do detalhe: linha nova `BackLinkLoader`, props de `MovieDetails` e `MovieHeader`, aviso e `lang` em `Overview`, `ul role="list"` e `alt=""` em `CastList`/`CastCard`, `DetailSkeleton` com `role="status"`, tabela de rotas com os dois Suspense, e L6 em `doing`.

## Tasks de execução realizadas
- [x] 7.1 `components.md` e `backlog.md`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/design/components.md` | alterado | Linhas `BackLinkLoader`, `MovieDetails`, `MovieHeader`, `Overview`, `CastList`/`CastCard`, `DetailSkeleton`, tabela "Páginas e arquivos de rota" e fronteira server × client; ajuste do `NavLink` com `<Suspense>` interno |
| `.work/design/decisoes.md` | alterado | Só a coluna "Onde" de D21 e D23 ganha `detalhe-filme`; nenhuma decisão muda |
| `.work/backlog.md` | alterado | L6 em `doing` (o finish marca `done`) |

## Decisões técnicas
Decisão 18 do `design.md`: mudança de contrato atualiza `components.md`; nenhuma decisão de `decisoes.md` é reaberta (D39 aplicada como está). Onde o design e o `tasks.md` dizem `priority`, vale `preload`.

## Resultado
Os registros de design refletem o que foi implementado; o README não foi tocado neste change (a lista de decisões e trade-offs para a seção do README está em "Riscos / Trade-offs" do `design.md`).

## Observações
Nenhuma.
