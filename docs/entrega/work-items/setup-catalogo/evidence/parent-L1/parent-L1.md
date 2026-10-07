# Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example — Resumo de Implementação

**Parent item:** L1
**Data:** 2026-10-07
**Status:** Implementado

## Resumo
O repositório passou a ter um projeto Next.js 16.4 com App Router, React 19.3, TypeScript strict e Tailwind v4, criado do zero com a CLI oficial. O Design System "Catálogo." é a única fonte de cores do código e é verificado por script. O shell de navegação e as páginas `/` e `/favoritos` renderizam o esqueleto visual, com fontes locais. O build passa sem token e sem rede, com `cacheComponents` desligado e ligado. O cliente TMDB, que completa L1, é o change `tmdb-client`; por isso L1 continua em `doing`.

## Tasks realizadas
- **L1-1: Scaffold e higiene do repositório** — projeto gerado em diretório temporário e movido para a raiz, com `.gitignore`, `.gitattributes`, `.nvmrc`, exclusões de `.work/` e dependências.
- **L1-2: Design System** — fontes self-hosted, 14 tokens no `@theme`, `check-tokens`, `Button` e `ButtonLink`.
- **L1-3: Shell da aplicação** — `Header`, `NavLink`, layout, páginas, toggle no `next.config.ts` e Vitest.
- **L1-4: Ambiente** — `.env.example` versionado e `AGENTS.md` mantido.
- **L1-5: Verificação nos dois modos** — builds, `next dev` com a flag e conferência visual a 1280 px e 390 px.
- **L1-6: Validação** — os cinco comandos de `apply.validation` verdes.

## Arquivos impactados (consolidado)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json`, `package-lock.json` | criado | Dependências, `engines` e scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `tokens:check`, `check` |
| `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | criado | Configuração da CLI com `.work/` excluído e Tailwind via PostCSS |
| `next.config.ts` | criado | Toggle `CATALOGO_CACHE_COMPONENTS` e `images.remotePatterns` |
| `vitest.config.mts`, `vitest.setup.ts` | criado | Vitest 5 com jsdom e Testing Library |
| `.gitignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `AGENTS.md` | criado | Higiene do repositório e variáveis de ambiente |
| `scripts/check-tokens.mjs` | criado | Guardrail do Design System |
| `src/app/globals.css` | criado | Tokens no `@theme` e estilos base |
| `src/app/fonts.ts`, `src/app/fonts/*` | criado | Fontes locais e licenças OFL |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/favoritos/page.tsx` | criado | Layout raiz e páginas-esqueleto |
| `src/components/layout/Header.tsx`, `NavLink.tsx`, `NavLink.test.tsx` | criado | Navegação principal acessível |
| `src/components/ui/Button.tsx`, `Button.test.tsx` | criado | Botões do Design System |

## Decisões técnicas
Aplicadas D1 a D11, D33, D34 e D40. As que mais pesam: flag de `cacheComponents` desligada por padrão com toggle (D2), fontes locais para o build não depender de rede (D11), tokens 1:1 com `--color-*: initial` (D33) e `check-tokens` como guardrail (D9). Três desvios do design foram registrados: troca do loader do Turbopack pelo PostCSS, `title.absolute` na home e prefixo com barra no `NavLink`.

## Resultado
`npm run check` e `npm run build` passam em uma cópia limpa do repositório. As duas rotas são prerenderizadas como estáticas nos dois modos. No browser, o header mostra a marca e os dois links, o link da rota atual tem `aria-current="page"` e o foco por teclado é visível em âmbar.
