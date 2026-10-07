# Evidência — Task #L5-8 — Ordenação no browser

**Parent item pai:** #L5 — Ordenação por popularidade, nota e data de lançamento
**Data:** 2026-10-07

## Resumo
Verificação da ordenação no browser: alternar as três opções, combinar com gênero e abrir `/?sort=release&genre=28`; em modo busca o select fica desabilitado.

## Tasks de execução realizadas
- [x] 8.4 Ordenação

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `e2e/listagem-filmes.spec.ts` | criado | Caso de ordenação: opções, nota, data de lançamento e retorno à popularidade |

## Decisões técnicas
D13, D15 e D16: corte de 200 votos só em "Nota" e corte de data futura só em "Data de lançamento", montados em `src/lib/tmdb/params.ts` (sem alteração neste change).

## Resultado
A combinação com gênero mantém os dois parâmetros e zera a página; "Popularidade" omite o parâmetro. QA: E2E 38 passed e 0 skipped (desktop e mobile); layout verde nos gates, com o finding baixo do `h1` em aberto.

## Observações
Sem captura de layout própria da ordenação.
