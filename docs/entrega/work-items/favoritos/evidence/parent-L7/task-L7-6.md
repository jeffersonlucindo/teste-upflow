# Evidência — Task #L7-6 — Verificação no browser e nos dois modos

**Parent item pai:** #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
**Data:** 2026-10-07

## Resumo
O critério do change foi verificado em Chromium contra `next dev` com `CATALOGO_CACHE_COMPONENTS=1` (39 verificações, duas execuções seguidas) e o build foi conferido com a flag. Depois, a fase de QA cobriu o fluxo com E2E e gates de layout nos projetos `desktop` e `mobile`.

## Tasks de execução realizadas
- [x] 6.1 Favoritar na listagem → `/favoritos` → remover; reload mantém
- [x] 6.2 Hidratação sem mismatch e sem flash do badge
- [x] 6.3 Duas abas sincronizam
- [x] 6.4 Payload corrompido e `localStorage` bloqueado não quebram
- [x] 6.5 390 px e 1280 px, teclado
- [x] 6.6 Build e `next dev` com `CATALOGO_CACHE_COMPONENTS=1` (D42)

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `e2e/favoritos.spec.ts` | criado | 22 testes: favoritar, alternar, botão `icon`, HTML do servidor, reload, badge, ordem em `/favoritos`, remoção, duas abas, teclado, storage corrompido e bloqueado, item inválido e id repetido |
| `e2e/shell.spec.ts` | alterado | Gates de layout de `/favoritos` (captura `favoritos`) |
| `src/components/favorites/FavoriteButton.tsx` | alterado | Sem `transition-colors` no `icon` (achado da 6.5) |

## Decisões técnicas
D31 (hidratação), D32 (abas e storage inválido), D35 (390 e 1280 px) e D42 (dois modos de `cacheComponents`). Decisões 5, 11 e 13 do `design.md`.

## Resultado
**6.1 Fluxo e payload.** Favoritar dois cards em `/`, abrir `/favoritos`, remover o primeiro e recarregar: o coração fica preenchido em âmbar com `aria-pressed="true"` e nome "Remover dos favoritos"; o badge acompanha (2, depois 1); `/favoritos` lista do mais recente ao mais antigo; sem favoritos aparece o vazio com "Explorar filmes" levando a `/`. O payload inspecionado em `localStorage["catalogo.favorites.v1"]` tem `version: 1` e itens com exatamente `id`, `title`, `posterPath`, `voteAverage`, `voteCount`, `releaseDate` e `savedAt`, em `savedAt` decrescente.

**6.2 Hidratação.** HTML do servidor de `/favoritos` só com `h1` e subtítulo; o de `/` com os corações desligados; nenhum aviso de hydration; com rede lenta o badge nunca aparece como "0" (conferido no HTML do servidor; o instante exato da hidratação não é determinístico).

**6.3 Duas abas.** Favoritar e desfavoritar numa aba aparece na outra sem recarregar (evento `storage`), com o badge das duas acompanhando; remover na aba de `/favoritos` esvazia o coração na listagem.

**6.4 Payload corrompido e storage bloqueado.** `"{oops"` e `{ version: 1, items: [{ id: 1 }] }` levam ao vazio, sem badge, sem erro no console e sem `error.tsx`; favoritar grava um payload válido no lugar. Com `localStorage` bloqueado o coração e o badge funcionam na sessão e o reload volta ao vazio.

**6.5 Layout e teclado.** A 390 px a grade tem duas colunas sem overflow; a 1280 px a estrutura bate com o protótipo. Ordem de tabulação por card: link do pôster, coração, link do título; Espaço e Enter alternam; o nome da aba inclui "N favoritos"; anel de foco âmbar no coração.

**6.6 Build e `next dev` com a flag (resumo).** `CATALOGO_CACHE_COMPONENTS=1 npm run build` sem `.env.local` e sem rede: verde, com `/favoritos` estática. `next dev` com a flag: sem insight de blocking-route, overlay `data-error=false` em `/` e `/favoritos`, console sem erro. O build sem a flag segue verde. Registro em `.devflow.yaml > implementation.validation`: `cache_components`, `browser` (39 verificações) e `e2e_regression` (38 passed antes do spec novo).

**QA** (`.work/changes/favoritos/.devflow.yaml > qa`; `status: passed`, `functional: pass`):
- E2E: specs `e2e/favoritos.spec.ts` (22 testes) e `e2e/shell.spec.ts` (gates de `/favoritos`), 82 passed e 0 skipped (41 em `desktop`, 41 em `mobile`).
- Layout: `pass`. Gates `expectNoHorizontalOverflow`, `expectTokenColors`, `expectMinHeight`, `expectFontVariable` e `expectFocusRing` verdes em 1280 e 390 px; revisão visual sem divergência. Findings em aberto: nenhum (5 resolvidos na iteração 1).

**Capturas de layout**

| Tela | Desktop (1280 px) | Mobile (390 px) |
|------|-------------------|-----------------|
| Favoritos carregado (cards em ordem, corações preenchidos) | ![favoritos carregado desktop](../layout/desktop-favoritos-carregado.png) | ![favoritos carregado mobile](../layout/mobile-favoritos-carregado.png) |
| Favoritos vazio, depois de remover o último | ![favoritos vazio desktop](../layout/desktop-favoritos-vazio.png) | ![favoritos vazio mobile](../layout/mobile-favoritos-vazio.png) |
| Favoritos vazio no primeiro acesso (storage corrompido ou ausente) | ![favoritos vazio inicial desktop](../layout/desktop-favoritos-vazio-inicial.png) | ![favoritos vazio inicial mobile](../layout/mobile-favoritos-vazio-inicial.png) |
| Listagem com favoritos (corações preenchidos e badge na aba) | ![listagem com favoritos desktop](../layout/desktop-listagem-com-favoritos.png) | ![listagem com favoritos mobile](../layout/mobile-listagem-com-favoritos.png) |
| `/favoritos` (gates do shell) | ![favoritos desktop](../layout/desktop-favoritos.png) | ![favoritos mobile](../layout/mobile-favoritos.png) |

## Observações
Limites conhecidos (`qa.not_covered_e2e`): o `FavoriteButton` `full` só entra em tela no `detalhe-filme`; o instante da hidratação sob rede lenta não é determinístico. O build e o `next dev` com a flag são da verificação do apply, não do E2E.
