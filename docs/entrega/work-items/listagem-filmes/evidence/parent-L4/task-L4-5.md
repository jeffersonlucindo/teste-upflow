# Evidência — Task #L4-5 — Select de gênero e FilterBarLoader

**Parent item pai:** #L4 — Filtro por gênero
**Data:** 2026-10-07

## Resumo
O select "Gênero" do `FilterBar` (padrão "Todos") troca a URL com `router.push` e zera a página; `FilterBarLoader` (RSC) busca os gêneros com `await connection()` antes de `getGenres()`. Commits `da43c35` e `8984c2d`.

## Tasks de execução realizadas
- [x] 5.2 `FilterBar`: select "Gênero"
- [x] 5.5 `src/components/movies/FilterBarLoader.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/movies/FilterBar.tsx` | criado | Select de gênero com `appearance-none pr-10`, chevron decorativo e `push` com `page: 1` |
| `src/components/movies/FilterBarLoader.tsx` | criado | `await connection()`, `getGenres()` e `<FilterBar genres={genres} />` |
| `src/components/movies/FilterBar.test.tsx` | criado | Casos de gênero: lista "Todos" e os gêneros, `push("/?genre=28")`, volta a "Todos", zera a página e preserva a ordenação |

## Decisões técnicas
Decisão 5 (loader sob `<Suspense>`, D22) e decisão 6 (select). Ajuste do QA: o select usa `useOptimistic`; era controlado só pela URL, que muda apenas quando a navegação termina, e em rede lenta a escolha voltava a "Todos" até a resposta chegar. Agora mostra a escolha durante a transição e duas escolhas seguidas se somam. Coberto por `e2e/listagem-filmes.spec.ts › navegação pendente`, que segura o payload RSC.

## Resultado
Gêneros em pt-BR no select; escolher cria `/?genre=28` com entrada no histórico; `/?genre=999999` mostra "Nenhum filme encontrado" com "Limpar filtros".

**QA** (`.work/changes/listagem-filmes/.devflow.yaml > qa`; `advisory-only`, `functional: pass`):
- E2E: spec `e2e/listagem-filmes.spec.ts`, 38 passed e 0 skipped nos projetos desktop e mobile.
- Layout: gates (`expectNoHorizontalOverflow`, `expectTokenColors`, `expectMinHeight`, `expectFontVariable`, `expectFocusRing`) verdes. Finding em aberto (baixo, `suggestion`, `src/app/page.tsx`): `h1` em `text-4xl` (36 px) contra 40 px/1.1/-0.01em do README de design; o `design.md` prescreve `text-4xl`, herdado do `setup-catalogo`.

| Tela | Desktop (1280 px) | Mobile (390 px) |
|------|-------------------|-----------------|
| Gênero sem resultado | ![vazio desktop](../layout/desktop-vazio.png) | ![vazio mobile](../layout/mobile-vazio.png) |

## Observações
O fallback "Carregando gêneros…" foi conferido só no HTML do build, sem captura nem E2E.
