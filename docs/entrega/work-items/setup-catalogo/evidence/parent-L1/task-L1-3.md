# Evidência — Task #L1-3 — Shell da aplicação

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O shell de navegação está pronto: `Header` como Server Component, `NavLink` como única ilha client e o layout raiz com as fontes e o container de 1200 px. As páginas `/` e `/favoritos` renderizam o esqueleto visual sem buscar dados. O `next.config.ts` ganhou o toggle `CATALOGO_CACHE_COMPONENTS` e o Vitest foi configurado.

## Tasks de execução realizadas
- [x] 3.1 `Header` e `NavLink`
- [x] 3.2 `src/app/layout.tsx`
- [x] 3.3 Páginas `/` e `/favoritos` com o esqueleto
- [x] 3.4 `next.config.ts` com toggle e `images.remotePatterns`
- [x] 3.5 Vitest configurado e scripts npm completos

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/layout/Header.tsx` | criado | Logo "Catálogo." com ponto em `accent` e nav "Principal" |
| `src/components/layout/NavLink.tsx` | criado | `"use client"`, `usePathname`, `aria-current="page"` na rota atual |
| `src/components/layout/NavLink.test.tsx` | criado | 6 testes de rota ativa, prefixo e classes |
| `src/app/layout.tsx` | alterado | `lang="pt-BR"`, variáveis das fontes, `Header`, `main` com container, `metadata` com template |
| `src/app/page.tsx` | alterado | `h1` "Filmes populares" e título da aba |
| `src/app/favoritos/page.tsx` | criado | `h1` "Meus favoritos" e subtítulo em `text-muted` |
| `next.config.ts` | alterado | Toggle de `cacheComponents` + `partialPrefetching` e `remotePatterns` do TMDB |
| `vitest.config.mts` | criado | jsdom, `setupFiles`, `include` em `src/**/*.test.{ts,tsx}` |
| `vitest.setup.ts` | criado | jest-dom, `cleanup()` e `localStorage.clear()` em `afterEach` |
| `package.json` | alterado | Scripts `typecheck`, `test` e `test:watch` |

## Decisões técnicas
- D2: flag desligada por padrão; as duas opções ligam juntas.
- D6: componentes por domínio, com o teste ao lado.
- D7: Vitest 5 com Testing Library; `test` é `vitest run`.
- Pilar 1: tudo é Server Component, exceto `NavLink`.

## Resultado
`npm run test` roda 13 testes verdes em 2 arquivos e termina sem watch. No browser, a 1280 px e a 390 px: link ativo com fundo `surface-100`, links com 44 px de altura, foco âmbar de 2 px com offset de 2 px, fontes locais carregadas e nenhum overflow horizontal. Títulos da aba: "Filmes populares · Catálogo." e "Meus favoritos · Catálogo.".

## Observações
A home usa `title.absolute`, porque o `title.template` do layout não se aplica à página do mesmo segmento. `NavLink` exige a barra no prefixo, então `/favoritos-x` não ativa "Favoritos". Com a flag ligada, a futura rota `/movie/[id]` vai exigir um `<Suspense>` em volta do `NavLink`. O Vite 8 avisa que `vite-tsconfig-paths` é desnecessário; o plugin foi mantido por estar no design.
