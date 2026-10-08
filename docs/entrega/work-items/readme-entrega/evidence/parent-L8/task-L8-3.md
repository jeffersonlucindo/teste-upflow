# Evidência — Task #L8-3 — Checklist de acessibilidade e responsivo

**Parent item pai:** #L8 — README com instruções de execução, decisões técnicas e trade-offs
**Data:** 2026-10-07

## Resumo
As três telas foram percorridas só pelo teclado e medidas em 390 e 1280 px, em Chromium, por um script do Playwright (não versionado) contra `next dev` com dados reais do TMDB. Os contrastes foram calculados pela fórmula da WCAG 2.1 sobre os valores dos tokens em `globals.css`. Os resultados alimentam a seção "Acessibilidade" do README.

## Tasks de execução realizadas
- [x] 3.1 Teclado
- [x] 3.2 Contraste
- [x] 3.3 390 px e 1280 px

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (leitura e execução) | — | Nenhum arquivo versionado alterado; os resultados entraram no `README.md` pela task L8-2 |

## Decisões técnicas
D34 (contrastes herdados mantidos) e D35 (grid responsivo), sem reabrir. O par `border-subtle`/`bg-base` dos campos (1,4:1) foi registrado como herdado, conforme a decisão 9 do design. Nada foi corrigido em `src/`: os achados foram para "Limites conhecidos" e "Melhorias futuras".

## Resultado
Teclado: ordem de tabulação igual à esperada em `/`, `/?q=matrix` (os dois selects desabilitados são pulados), `/movie/603` e `/favoritos`; anel de foco `solid 2px rgb(242, 184, 75)` em todos os controles do app; Enter no campo leva a `/?q=matrix`; Espaço e Enter no coração alternam `aria-pressed` e o rótulo; "Anterior" e "Próxima" com 44 px. Contraste: 15,76 · 14,14 · 12,86 · 11,69 · 15,33 · 12,16 · 7,62 · 6,84 · 6,22 · 10,38 · 10,10 nos pares de texto, ícone e anel; abaixo do limite só os herdados (3,14 · 1,73 · 1,35 · 1,11). Viewport: `scrollWidth` igual a 390 e a 1280 em todas as telas e estados; grid de 2 colunas a 390 px e de 5 a 1280 px; elenco em 2 e em 5 colunas. `npm run e2e`: 114 passed (57 por largura), com os gates de rolagem horizontal, altura mínima, cores dentro dos tokens e anel de foco.

## Observações
Achados novos, não corrigidos: as telas de erro e de filme não encontrado não têm `h1` (o título do `EmptyState` é um `<p>`); o iframe do trailer não recebe o anel de foco do app; com o foco num select fechado, a seta troca a opção e navega (`/?sort=rating` com uma tecla); ao remover um card em `/favoritos` o foco vai para o `body`. O estado de erro por token ausente não foi percorrido neste checklist; segue coberto pelo teste unitário de `ErrorState` e pelas capturas do change `detalhe-filme`.
