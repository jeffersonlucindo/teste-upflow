# Evidência — Task #L8-5 — Entrega e registro

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
Tasks de entrega, que só podem ser executadas depois do merge do PR deste change em `develop`: a promoção `develop` → `main`, o compartilhamento do repositório e os registros do finish. Ficam abertas no apply.

## Tasks de execução realizadas
- [ ] 5.1 Promoção `develop` → `main` e compartilhamento
- [ ] 5.2 Backlog, pergunta em aberto e HTML do change

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (pendente) | — | No finish: `.work/backlog.md` (L8 → `done`), `.work/design/decisoes.md › Perguntas em aberto` (data do compartilhamento) e `change.html` |

## Decisões técnicas
Fluxo de `config.yaml > git`: nada vai direto para `main` ou `develop`. A promoção é um PR de `develop` para `main`; os convites a marcos.oliveira@upflow.me e mario.morais@upflow.me são feitos à mão em Settings › Collaborators, com permissão de leitura, porque o `gh` não convida por e-mail.

## Resultado
Estado para o finish: repositório `https://github.com/jeffersonlucindo/desafio-up-flow` (privado); L1–L7 `done` e L8 `doing` no backlog; `.env.local` e `.work/design/reference/` cobertos pelo `.gitignore` (`git check-ignore` confirma os dois).

## Observações
A data do compartilhamento ainda não existe. Como o README não tem a subseção "Entrega", a task 5.1 não tem marcador a substituir no README.
