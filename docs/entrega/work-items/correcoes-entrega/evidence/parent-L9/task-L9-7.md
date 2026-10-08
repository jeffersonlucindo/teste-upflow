# Evidência — Task #L9-7 — README

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
O README foi corrigido na primeira instrução (URL e pasta do clone), nas contagens que estavam erradas, nos textos que o change mudou e nas contagens de teste finais. Ganhou um bloco "Em resumo" no topo das decisões e a seção "Processo", que diz como o projeto foi feito.

## Tasks de execução realizadas
- [x] 7.1 Clone, Node, contagens e textos que mudaram
- [x] 7.2 Resumo das decisões e seção "Processo"

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `README.md` | alterado | Clone (`teste-upflow`) e pré-requisito de Node pelo intervalo real; "oito módulos" em `src/lib/tmdb/`; "Quatro contrastes" conforme a tabela de "Acessibilidade"; parágrafo do not-found (404 real para id inválido, 200 para filme que o TMDB não conhece, e por quê); `TMDB_LANGUAGE` como idioma dos dados; parágrafos das decisões 1, 2, 5 e 7; "Melhorias futuras" sem os itens resolvidos; nota do skip-link no checklist de teclado; seção "Testes" com 409 testes em 35 arquivos e 132 execuções de E2E; bloco "Em resumo"; seção "Processo" no fim |

## Decisões técnicas
Decisões 12 e 13 do design (D45). A seção "Processo" tem três parágrafos: houve assistência de IA, em um fluxo em que cada etapa nasce de uma proposta escrita antes do código; o que são `.work/` (trilha de decisões) e `docs/` (evidências por requisito e por task, com capturas de tela, o que explica o volume); e que o repositório de entrega foi migrado de um repositório de trabalho privado, com datas e autoria originais mantidas e pull requests recriados. A seção não cita a ferramenta do fluxo, seus comandos, arquivos de configuração nem agentes. A regra anterior ("o README trata só do código") caiu, porque a trilha versionada ao lado tornava a omissão pior do que a menção.

## Resultado
O clone aponta para o repositório de entrega; os números do README são os registrados pelo QA (409 testes unitários em 35 arquivos; 132 execuções de E2E, 66 testes em 5 specs, 0 skipped). A seção "Testes" declara os dois cenários sem E2E: o estado "Limpar filtros" e `TMDB_LANGUAGE` diferente de `pt-BR`, o segundo com a justificativa de que o servidor de E2E tem um idioma só.

## Observações
Tarefa sem tela: não há bloco de QA nem screenshot. Os números de teste e de E2E vêm do `qa` do arquivo de estado do change e do README; esta evidência não rodou `npm run e2e` nem `npm run build` de novo.
