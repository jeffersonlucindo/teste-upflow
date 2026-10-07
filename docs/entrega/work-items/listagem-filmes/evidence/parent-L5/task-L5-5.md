# Evidência — Task #L5-5 — Select "Ordenar por" e modo busca

**Parent item pai:** #L5 — Ordenação por popularidade, nota e data de lançamento
**Data:** 2026-10-07

## Resumo
O select "Ordenar por" do `FilterBar` oferece Popularidade, Nota e Data de lançamento (ordem de `LISTING_SORTS`), troca a URL com `push` e zera a página. Com busca ativa (D14), os dois selects ficam desabilitados e descritos pelo hint. Commit `da43c35`.

## Tasks de execução realizadas
- [x] 5.3 `FilterBar`: select "Ordenar por" e modo busca (D14)

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | criado | `SORT_LABELS`, select de ordenação, `searchMode` com `disabled`, `aria-describedby` e o hint "Gênero e ordenação não se aplicam à busca por título (limitação da API)." |
| `src/components/movies/FilterBar.test.tsx` | criado | Casos de ordenação (`push("/?sort=rating")`, padrão omitido) e do modo busca (selects desabilitados, hint visível) |

## Decisões técnicas
Decisão 6 do `design.md` e D13, D14, D15 e D16 (cortes de votos e de data aplicados pelo `tmdb-client`). Valor otimista do select no ajuste do QA (ver task L4-5).

## Resultado
"Nota" cria `/?sort=rating`, "Data de lançamento" cria `/?sort=release` e "Popularidade" volta a `/`. O estado é conferido nas capturas de L2-8, L3-5 e L4-5, que mostram a barra de filtros.

**QA** (`.work/changes/archive/2026-10-07-listagem-filmes/.devflow.yaml > qa`; `advisory-only`, `functional: pass`):
- E2E: spec `e2e/listagem-filmes.spec.ts`, 38 passed e 0 skipped nos projetos desktop e mobile.
- Layout: gates verdes; finding em aberto (baixo, `suggestion`, `src/app/page.tsx`): `h1` em `text-4xl` (36 px) contra 40 px/1.1/-0.01em do README de design; o `design.md` prescreve `text-4xl`.

## Observações
Não há captura de layout dedicada à ordenação: o caso de ordenação é afirmado pelo E2E, sem `captureLayout`.
