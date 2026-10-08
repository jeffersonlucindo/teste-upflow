# Evidência — Task #L9-6 — Projeto

**Parent item pai:** #L9 — Correções da revisão da entrega: defeitos de borda na listagem, nos favoritos e no detalhe, 404 em português e com status real, README (clone, contagens, processo) e registros
**Data:** 2026-10-08

## Resumo
O campo `engines.node` do `package.json` passou a refletir o que o toolchain instalado exige, em vez de `>=20.9`, que o `jsdom` e o `vitest` não aceitam.

## Tasks de execução realizadas
- [x] 6.1 `engines.node` alinhado ao toolchain

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json` | alterado | `engines.node` = `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |
| `package-lock.json` | alterado | Só o bloco `engines` da raiz |

## Decisões técnicas
Decisão 11: o intervalo é a interseção do que `next`, `vite`, `vitest` e `jsdom` declaram; quem restringe é o `jsdom`. `.nvmrc` fica em `22`. O `npm install --package-lock-only` acrescentou entradas opcionais não relacionadas (`@emnapi`); foram descartadas e o lockfile recebeu a mudança à mão, sem alterar versão de pacote.

## Resultado
O intervalo declarado bate com o que os pacotes instalados pedem.

## Observações
Só a aplicação em produção (`next start`) rodaria em Node 20.9; o `npm run check` não. A task não tem tela. Esta evidência não registra uma rodada de `npm ci` para confirmar a ausência de `EBADENGINE`: o critério foi atendido pela conferência dos campos `engines` dos pacotes.
