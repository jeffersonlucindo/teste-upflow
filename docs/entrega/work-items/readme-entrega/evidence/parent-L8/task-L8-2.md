# Evidência — Task #L8-2 — README consolidado

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
O README foi reorganizado de cinco levas (uma por change) para uma leitura por área: rotas e requisitos, como rodar, scripts, flags, estrutura com a fronteira server × client, decisões e trade-offs em cinco subseções, testes, acessibilidade com o checklist, o que ficou de fora e melhorias futuras. Os parágrafos escritos pelos finishes anteriores foram mantidos e os que tratavam da mesma decisão em dois lugares foram fundidos.

## Tasks de execução realizadas
- [x] 2.1 Cabeçalho, Rotas e requisitos, Como rodar e Segurança do token
- [x] 2.2 Scripts, Flags, Estrutura e fronteira server × client
- [x] 2.3 Decisões: abertura, Trade-off principal e Stack e scaffold
- [x] 2.4 Decisões: Dados (TMDB)
- [x] 2.5 Decisões: Estado
- [x] 2.6 Decisões: UI e Design System
- [x] 2.7 Testes
- [x] 2.8 Acessibilidade com o checklist executado
- [x] 2.9 O que ficou de fora e Melhorias futuras
- [x] 2.10 Revisão final do README

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `README.md` | alterado | De 258 para 399 linhas; sai o bloco "Estado atual"; entram "Rotas e requisitos", "Fronteira server × client", "Testes", "Acessibilidade" e "O que ficou de fora"; decisões reagrupadas por área |

## Decisões técnicas
Estrutura da decisão 1 do design, sem "Processo", "Como foi criado" e "Entrega" (regra de README do `config.yaml`). Trade-off principal (D14 e D13) como primeira subseção de decisões. Fusões pela regra da decisão 2: limite de 500 páginas (API e tela), sinopse (escolha e os três casos na tela), erros (classificação, validação do id e `error.tsx`), imagens (tamanhos, `preload` e `alt`), `EmptyState` (seis usos). D8 e D41 não têm registro no README por serem sobre o fluxo.

## Resultado
`grep -nE "previsto|A preencher|Estado atual|TODO|<plataforma>|<data>" README.md` vazio. Nenhuma ocorrência de `.work`, o ferramental local, `devflow`, `backlog` ou de ids `D<n>`/`L<n>`. Os números citados conferem com o código: `revalidate` de 86 400 e 3 600 s, `vote_count.gte=200`, limite de 500 páginas, elenco até 8, debounce de 350 ms, chave `catalogo.favorites.v1` com `version: 1`. O hint da busca é o texto exato de `FilterBar.tsx`. Os totais de teste (342 em 31 arquivos; 114 execuções do Playwright) são os das execuções deste apply.

## Observações
Os critérios das tasks 1.1, 2.6 e 2.10 que contam `**D<n>.**` com `grep` não se aplicam, porque o README não leva ids; o mapa decisão → seção está em "Ajustes do apply" do `design.md`. Sem a subseção "Entrega", a URL do repositório aparece no `git clone` de "Como rodar".
