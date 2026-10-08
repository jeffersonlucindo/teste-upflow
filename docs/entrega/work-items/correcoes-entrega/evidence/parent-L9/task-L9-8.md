# Evidência — Task #L9-8 — Registros

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
Os registros do projeto foram atualizados com as decisões e os contratos novos. As referências a uma pasta de ferramental que não é entregue foram trocadas ou removidas, o roteiro de sessão `.work/prompts/explore-inicial.md` saiu do repositório e o change `setup-catalogo` foi arquivado.

## Tasks de execução realizadas
- [x] 8.1 Decisões, regra de README e contratos
- [x] 8.2 Comentário do ESLint e índice de design
- [x] 8.3 Referências à pasta de ferramental local e a `.work/prompts/`
- [x] 8.4 Arquivar o `setup-catalogo`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.work/design/decisoes.md` | alterado | D8 revisada; D45 (processo no README), D46 (404 por proxy), D47 (gênero desconhecido), D48 (caminho de imagem), cada uma com alternativa e trade-off; menções ao ferramental trocadas |
| `.work/config.yaml` | alterado | Regra de README conforme D45 e linha sobre o que é versionado |
| `.work/design/components.md` | alterado | `ListingTitle`, `PaginationPending` (ilha client nova), `EmptyState.headingLevel`, not-found da raiz, skip-link, `Overview` com `fallback` |
| `.work/design/README.md` | alterado | Índice sem citar pasta que não é entregue |
| `eslint.config.mjs` | alterado | Comentário sem citar o nome do fluxo |
| `.work/backlog.md` | alterado | L9 registrado |
| `.work/prompts/explore-inicial.md` | removido | Roteiro de sessão, não decisão do projeto |
| `.work/changes/archive/2026-10-07-{detalhe-filme,favoritos,listagem-filmes,tmdb-client,readme-entrega}/` | alterado | `tasks.md` (e `design.md`/`proposal.md` no `readme-entrega`): menção ao caminho trocada por "ferramental local, não versionado" |
| `.work/changes/archive/2026-10-07-setup-catalogo/` | movido | Antes em `.work/changes/setup-catalogo/`; `phase: finish`; caminhos corrigidos |
| `.work/specs/projeto-base/` | criado | Spec do `setup-catalogo` sincronizada (cópia idêntica) |
| `docs/entrega/work-items/{setup-catalogo,readme-entrega}/evidence/**` | alterado | Só o caminho citado muda, em 4 arquivos de task |

## Decisões técnicas
Decisões 14, 15 e 16 do design. Nas evidências antigas e nos registros históricos só a menção ao caminho mudou; nenhum resultado (números, status, comandos de validação) foi alterado. As linhas que citavam o gerador de HTML do change viraram "(com o ferramental local, não versionado)".

## Resultado
A busca por menções à pasta de ferramental local em `.work`, `docs`, `README.md` e `eslint.config.mjs` (fora dos `.html` e de `.work/config.yaml`) devolve vazio, conferido na geração desta evidência. `ls .work/changes` mostra só `archive/` e este change.

## Observações
Tarefa sem tela: sem bloco de QA nem screenshot. O arquivo `change.html` de cada change continua versionado e foi excluído da verificação do `git grep`, como a task previa.
