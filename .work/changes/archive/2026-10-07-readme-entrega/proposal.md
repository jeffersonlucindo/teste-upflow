# readme-entrega

## Resumo:
Sexto e último change do catálogo: consolida o `README.md` de entrega a partir do esqueleto do
`setup-catalogo` e das seções que os finishes de `tmdb-client`, `listagem-filmes`, `favoritos` e
`detalhe-filme` acrescentaram em "Decisões técnicas e trade-offs". Reorganiza as decisões por área
(stack, dados, estado, UI e design system, processo), funde as que têm mais de um dono (D17, D18,
D19, D21, D23, D35, D36, D37, D42, D43) e completa o que faltava: instruções de execução
verificadas em clone limpo, flags, estrutura final, trade-off principal, segurança do token,
testes, acessibilidade com checklist executado (teclado, contraste, 390 px e 1280 px nas três
telas), "O que ficou de fora", "Melhorias futuras" e "Processo". Fecha o [#L8] e a entrega:
repositório publicado e compartilhado com marcos.oliveira@upflow.me e mario.morais@upflow.me.
**Não há UI nem código de aplicação**: nenhuma tela de `.work/design/screens/` é implementada e
`src/` não é tocado.

## Parent item(ns) relacionado(s):
- [#L8] README com instruções de execução, decisões técnicas e trade-offs. O `setup-catalogo`
  entregou o esqueleto (título, Como rodar, Scripts, Flags, Estrutura, Processo, Decisões
  D1–D11/D33/D34/D40, Melhorias futuras vazio) e cada finish seguinte acrescentou os seus
  parágrafos; este change consolida, verifica e fecha o item.

## Tasks
Ver `tasks.md`: 1) inspeção do estado final (README acumulado, `decisoes.md`, `components.md`,
`backlog.md`, evidências dos cinco changes); 2) README consolidado, seção a seção; 3) checklist de
acessibilidade e responsivo nas três telas; 4) verificação em clone limpo; 5) entrega (promoção
`develop` → `main` por PR, compartilhamento) e registro; 6) validação.

## Por quê
O enunciado (`DESAFIO.md › Entrega`) exige "um README com instruções claras de como executar a
aplicação, decisões técnicas e trade-offs" e avisa em `› Avaliação` que "todo artefato entregue
será analisado". O pilar 8 de `.work/config.yaml > context` fez cada finish acrescentar a sua parte
na seção "Decisões técnicas e trade-offs", o que garante que nada se perde, mas produz um README
escrito em cinco levas: decisões com mais de um dono aparecem em dois ou três parágrafos (D21 vem
de `tmdb-client`, `listagem-filmes` e `detalhe-filme`; D23 dos mesmos três; D17, D18, D19, D35,
D36, D37, D42 e D43 de dois), "Como rodar" ainda diz que "nenhuma página chama o TMDB", a árvore
de "Estrutura" lista pastas como "previsto", "Melhorias futuras" está vazia, o aviso "Estado atual"
continua no topo e D41 não tem dono no README. O critério de pronto da linha 6 de
`.work/backlog.md` pede mais do que texto: clone limpo + `npm ci` + `.env.local` + `npm run dev`
funcionando, as decisões D1–D43 consolidadas, checklist de teclado, contraste e 390/1280 px, e o
repositório compartilhado. Um change próprio no dia 5 faz isso com a validação completa
(`apply.validation` com build sem token e sem rede, mais a conferência final com a flag ligada),
sem misturar com código.

## O que muda
- `README.md` é reescrito por inteiro, na estrutura de `design.md` decisão 1: título; Rotas e
  requisitos; Como rodar (clone, Node 22, `npm ci`, `.env.local`, `npm run dev`, sonda opcional,
  comportamento sem token) com a subseção "Segurança do token"; Scripts; Flags; Estrutura;
  Decisões técnicas e trade-offs por área (trade-off principal em destaque; A. Stack e scaffold;
  B. Dados; C. Estado; D. UI e Design System; E. Processo), com os 43 ids uma vez cada; Testes;
  Acessibilidade com o checklist executado; O que ficou de fora; Melhorias futuras; Processo (com
  "Como foi criado" e "Entrega").
- Texto que sai: o bloco "Estado atual" do esqueleto; "nenhuma página chama o TMDB"; os
  "previsto:" da árvore; "A preencher no change `readme-entrega`"; os parágrafos duplicados das
  decisões com mais de um dono.
- Repositório já no GitHub (`jeffersonlucindo/desafio-up-flow`, privado; `origin` existe e a
  pergunta "Plataforma do repositório remoto" de `.work/design/decisoes.md` foi resolvida em
  2026-10-07): este change promove `develop` → `main` por PR, conforme `.work/config.yaml > git`
  (features em `feature/<change>`, PR para `develop`, `main` só recebe promoções), e compartilha o
  repositório com os dois e-mails do enunciado (convite pela interface do GitHub).
- `.work/backlog.md`: L8 marcado `done` no finish (L1–L7 já marcados pelos finishes anteriores;
  conferidos aqui). `.work/design/decisoes.md`: a linha da pergunta "Plataforma do repositório
  remoto" (já resolvida) recebe a data do compartilhamento no finish; nenhuma decisão é reaberta.
- Fora de escopo: qualquer arquivo em `src/`, `scripts/`, `package.json`, `next.config.ts`,
  `.env.example`; os registros em `components.md` e `decisoes.md` que pertencem aos applies
  anteriores (conferidos, não refeitos); specs (ver `design.md` decisão 11: não há comportamento
  de sistema novo).

## Capacidades
### Novas
- nenhuma: o change não acrescenta comportamento ao sistema. O que ele produz é o artefato de
  entrega (README) e a prova de que o repositório funciona em clone limpo; os critérios
  verificáveis estão em `tasks.md` (grupos 2 a 4), não em uma spec (`design.md` decisão 11).
### Modificadas
- nenhuma. `projeto-base` (spec do `setup-catalogo`) continua valendo sem alteração: os cenários
  "Build sem variáveis de ambiente" e "Build com Cache Components ligado" são reexecutados na
  validação deste change como conferência final.

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L8] — README com instruções de execução, decisões técnicas e trade-offs
  - [#L8] — Inventariar o README acumulado pelos finishes 1–5: decisões presentes, duplicadas e ausentes
  - [#L8] — Inventariar o repositório final (árvore, scripts, flags, ilhas client, testes)
  - [#L8] — Conferir os registros devidos pelos applies anteriores em `decisoes.md`, `components.md` e `backlog.md`
  - [#L8] — README: cabeçalho, Rotas e requisitos, Como rodar, Segurança do token
  - [#L8] — README: Scripts, Flags, Estrutura e fronteira server × client
  - [#L8] — README: trade-off principal e A. Stack e scaffold (D1–D11)
  - [#L8] — README: B. Dados (D12–D23) com o resultado da sonda
  - [#L8] — README: C. Estado (D24–D32)
  - [#L8] — README: D. UI e Design System (D33–D40) e E. Processo (D41–D43)
  - [#L8] — README: Testes (D7)
  - [#L8] — README: Acessibilidade com o checklist executado (D34)
  - [#L8] — README: O que ficou de fora, Melhorias futuras, Processo e Entrega
  - [#L8] — Revisão final do README (cobertura D1–D43, links, texto)
  - [#L8] — Checklist: teclado nas três telas
  - [#L8] — Checklist: contraste dos pares de tokens em uso
  - [#L8] — Checklist: 390 px e 1280 px nas três telas
  - [#L8] — Clone limpo: `npm ci`, `.env.local`, `npm run dev`, `npm run build` sem token
  - [#L8] — Remoto, push de `main` e compartilhamento com os dois e-mails (passo manual)
  - [#L8] — Registro: backlog, pergunta em aberto, HTML do change
  - [#L8] — Validação (`tokens:check`, `lint`, `typecheck`, `test`, `build` sem token; build com a flag ligada)

## Impacto
- Arquivos novos: nenhum em `src/`. Fora do código: `.work/changes/readme-entrega/*` (este
  change) e as evidências em `docs/`, conforme `.work/config.yaml > layout` (fase evidence).
- Arquivos modificados: `README.md` (reescrito por inteiro); `.work/backlog.md` (L8 `done`, no
  finish); `.work/design/decisoes.md` (data do compartilhamento na linha da pergunta "Plataforma do
  repositório remoto", no finish). Nenhum arquivo de `src/`, `scripts/` ou de configuração.
- Dependências: nenhuma nova. Ferramentas usadas só na verificação: `git clone` de repositório
  local, Node 22, npm, devtools do browser (contraste e viewport), a sonda `scripts/tmdb-probe.mjs`
  do `tmdb-client`.
- Padrões reutilizados: inspecionados `README.md` (esqueleto do `setup-catalogo` mais as seções
  dos finishes 2–5), `.work/changes/archive/2026-10-07-setup-catalogo/design.md` decisão 14 (esqueleto do README), as
  listas "Decisões para o README" ao fim de "Riscos / Trade-offs" em
  `.work/changes/{tmdb-client,listagem-filmes,favoritos,detalhe-filme}/design.md`,
  `.work/design/decisoes.md` (D1–D43, coluna "Onde", "Pendências de verificação", "Perguntas em
  aberto"), `.work/design/components.md` (fronteira server × client e "Acessibilidade"),
  `.work/design/tokens/README.md › Acessibilidade` (seis pares de contraste medidos),
  `.work/backlog.md › Sequência de changes` (linha 6), `DESAFIO.md › Entrega` e `› Avaliação`,
  `.work/config.yaml` (`providers.github` com `org`, `repo`, `remote` e `host_hint`; bloco `git` com o
  fluxo de branches; `apply.validation`, `layout`, pilares 7 e 8).
  Nenhuma tela: este change não tem UI. O bundle `.work/design/reference/` não foi usado.
