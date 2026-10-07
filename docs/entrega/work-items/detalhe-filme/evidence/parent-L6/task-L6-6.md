# Evidência — Task #L6-6 — Verificação no browser e nos dois modos

**Parent item pai:** #L6 — Página de detalhe em /movie/[id]: sinopse (com fallback de idioma), nota, elenco principal e trailer quando houver
**Data:** 2026-10-07

## Resumo
O critério do change foi verificado no browser contra `next dev` e `next start`, com e sem `CATALOGO_CACHE_COMPONENTS=1`: `/movie/603` completo, not-found para ids inválidos e inexistentes, os três casos da sinopse, trailer e elenco ausentes, "Voltar à listagem" preservando filtros, 390 e 1280 px com teclado, e build nos dois modos. A verificação exigiu um ajuste no `NavLink` (`<Suspense>` interno). Depois, a fase de QA cobriu o fluxo com E2E e gates de layout nos projetos `desktop` e `mobile`.

## Tasks de execução realizadas
- [x] 6.1 `/movie/603` completo
- [x] 6.2 Id inválido e inexistente → not-found
- [x] 6.3 Sinopse nos três casos (D18)
- [x] 6.4 Trailer ausente e elenco vazio somem
- [x] 6.5 "Voltar à listagem" preserva filtros (D39)
- [x] 6.6 390 px e 1280 px, teclado
- [x] 6.7 Build e `next dev` com `CATALOGO_CACHE_COMPONENTS=1` (D42)

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `e2e/detalhe-filme.spec.ts` | criado | 17 testes por projeto: id inválido (sem TMDB), shell do servidor e skeleton sem JavaScript, detalhe a partir de um card, `/movie/603` com estrutura e árvore de acessibilidade, favoritar no detalhe e reflexo em `/favoritos`, "Voltar" com busca e página, `from` mal formado, id inexistente, sinopse em outro idioma, sem sinopse, sem elenco e teclado |
| `src/components/layout/NavLink.tsx` | alterado | O pathname passou a ser lido num componente interno sob `<Suspense>`, com o link inativo como fallback; props, classes e testes não mudam |

## Decisões técnicas
D2 e D42 (o mesmo código e o build verde nos dois modos de `cacheComponents`), D35 (390 e 1280 px), D39 (`from`), D18, D19 e D38. Decisões 2, 3, 4, 15 e 17 do `design.md`. Ajuste do apply: `/movie/[id]` é a primeira rota com parâmetro dinâmico sem `generateStaticParams`; com a flag, o pathname é dado de requisição e `usePathname()` suspende no pré-render do shell. Sem boundary, `CATALOGO_CACHE_COMPONENTS=1 npm run build` falha com `blocking-prerender-client-hook` (docs instalados, `use-pathname.md`). No detalhe o fallback é também o estado final (nem "Explorar" nem "Favoritos" ficam ativos), então não há troca visível.

## Resultado
**6.1 Detalhe completo.** `/movie/603` mostra pôster `w500`, `h1` único, a linha de meta, o chip de nota, o botão de favorito (alterna e o badge e `/favoritos` acompanham), a sinopse em português sem aviso, o elenco com até 8 figuras, o trailer em `youtube-nocookie.com` e uma única chamada ao TMDB por carga.

**6.2 Not-found.** `/movie/abc`, `/movie/0`, `/movie/0603` e `/movie/999999999` mostram o `EmptyState` de filme com o `Header` visível e a aba "Filme não encontrado · Catálogo.". Status HTTP medido com `curl` em `/movie/abc`, `/movie/0603` e `/movie/999999999`: **200 com `<meta name="robots" content="noindex">`** em `next dev` e `next start`, com e sem a flag (quatro combinações), e o mesmo com user-agent de bot (`Twitterbot`). O design esperava 404 sem a flag; o Next mantém 200 porque o `notFound()` roda dentro do Suspense depois do início do streaming (docs instalados, `not-found.md`). Garantir 404 exigiria `await params` fora do Suspense, o que quebra a flag.

**6.3 Sinopse.** Ids do TMDB em 2026-10-07: pt-BR 603; só em inglês 20000 (aviso "Sinopse disponível apenas em inglês.", `lang="en"`); só em espanhol 1786782 ("…apenas em espanhol.", `lang="es"`); nenhuma sinopse 1767731 ("Sinopse não disponível.", `h2` mantido).

**6.4 Trailer e elenco ausentes.** Sem trailer: 1767731 e 1786782 (sem vídeos) e 1760851 (um vídeo que não é `Trailer`); a seção "Trailer" some inteira. Sem elenco: 1789955, só a seção "Sinopse" aparece.

**6.5 Voltar preservando filtros.** A partir da listagem o detalhe abre em `?from=` e "Voltar à listagem" devolve a busca e a página; a partir de `/favoritos` (sem `from`) volta a `/`; `from` fora do padrão é normalizado ou ignorado (`page=999` → `/?page=500`; URL externa → `/`).

**6.6 Responsivo e teclado.** Sem overflow horizontal a 390 e 1280 px; a ordem de foco é "Voltar à listagem", "Adicionar aos favoritos" e o iframe do trailer; Espaço e Enter alternam o favorito. O anel de foco aparece no link e no botão, mas o navegador não desenha `outline` em `iframe` (não mitigado).

**6.7 Build nos dois modos (sem `.env.local`, sem rede).** Com `CATALOGO_CACHE_COMPONENTS=1`: build verde com `◐ /`, `○ /_not-found`, `○ /favoritos` e **`◐ /movie/[id]`** (Partial Prerender, shell de fallback). Sem a flag: build verde com `ƒ /`, `○ /_not-found`, `○ /favoritos` e **`ƒ /movie/[id]`**. `next dev` com a flag abriu `/movie/603`, `/movie/603?from=…`, `/movie/abc` e `/movie/999999999` sem insight de blocking-route e sem erro no console.

**QA** (`.work/changes/archive/2026-10-07-detalhe-filme/.devflow.yaml > qa`; `status: advisory-only`, `functional: pass`):
- E2E: spec `e2e/detalhe-filme.spec.ts` (17 testes por projeto); suíte inteira com 114 passed e 0 skipped (57 em `desktop`, 57 em `mobile`).
- Layout: `pass`. Gates `expectNoHorizontalOverflow`, `expectTokenColors`, `expectMinHeight`, `expectFontVariable` e `expectFocusRing` verdes em 1280 e 390 px. Findings em aberto (advisory): o estado de erro do detalhe não tem teste E2E versionado (conferido à mão e coberto por `ErrorState.test.tsx`) e a `key` por `member.id` do `CastList` duplicaria se o TMDB repetisse a mesma pessoa entre os 8 primeiros (caso real não confirmado). Três findings resolvidos em 2 iterações: `priority` trocado por `preload` no pôster, asserção do `robots` duplicado no spec e screenshot/gates do skeleton (o spec ganhou o teste do shell sem JavaScript).

**Capturas de layout**

| Tela | Desktop (1280 px) | Mobile (390 px) |
|------|-------------------|-----------------|
| A partir de um card da listagem | ![de card desktop](../layout/desktop-de-card.png) | ![de card mobile](../layout/mobile-de-card.png) |
| `/movie/603` completo | ![603 completo desktop](../layout/desktop-603-completo.png) | ![603 completo mobile](../layout/mobile-603-completo.png) |
| Not-found | ![not-found desktop](../layout/desktop-not-found.png) | ![not-found mobile](../layout/mobile-not-found.png) |
| Sinopse só em inglês | ![sinopse em inglês desktop](../layout/desktop-sinopse-ingles.png) | ![sinopse em inglês mobile](../layout/mobile-sinopse-ingles.png) |
| Sem sinopse | ![sem sinopse desktop](../layout/desktop-sem-sinopse.png) | ![sem sinopse mobile](../layout/mobile-sem-sinopse.png) |
| Sem elenco | ![sem elenco desktop](../layout/desktop-sem-elenco.png) | ![sem elenco mobile](../layout/mobile-sem-elenco.png) |
| Skeleton | ![skeleton desktop](../layout/desktop-skeleton.png) | ![skeleton mobile](../layout/mobile-skeleton.png) |
| Erro do segmento | ![erro desktop](../layout/desktop-erro.png) | ![erro mobile](../layout/mobile-erro.png) |

## Observações
Os ids recentes podem ganhar dados no TMDB com o tempo, e os specs E2E afirmam estrutura e comportamento, nunca um título fixo. O spec aceita as duas tags `robots` que o Next injeta no not-found. O estado de erro não tem E2E versionado.
