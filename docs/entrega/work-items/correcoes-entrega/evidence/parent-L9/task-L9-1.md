# Evidência — Task #L9-1 — Reprodução

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
Antes de corrigir, os defeitos de comportamento da revisão foram reproduzidos. Os que dependiam de estado do navegador foram reproduzidos por teste que falhava antes da correção; os de servidor, com `next dev` e `curl -I`.

## Tasks de execução realizadas
- [x] 1.1 Reproduzir os defeitos de comportamento antes de corrigir

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/` | sem alteração | A task só observa; nada em `src/` muda |

## Decisões técnicas
Design, "Abordagem": para cada defeito, primeiro o teste que o reproduz, depois a correção.

## Resultado
- `/naoexiste` respondia 404 com a tela padrão do Next, em inglês ("could not be found").
- `/movie/abc` e `/movie/999999999` respondiam 200.
- `/?genre=999999` mostrava "Nenhum filme encontrado".
- A corrida do `FilterBar` (digitar e trocar o gênero antes de 350 ms) foi reproduzida por dois casos de `FilterBar.test.tsx` que falhavam antes da correção; o `posterPath` adulterado, por cinco casos de `store.test.ts`.

## Observações
A corrida e o `posterPath` adulterado não foram reproduzidos à mão no navegador, como a task previa: a reprodução foi por teste. Os testes de `images.ts` e `resolveGenre.ts` foram escritos junto da correção, sem rodada vermelha antes. A task não tem tela própria, então não há screenshot nem bloco de QA.
