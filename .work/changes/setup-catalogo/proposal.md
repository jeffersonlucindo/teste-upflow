# setup-catalogo

## Resumo:
Primeiro change do catálogo: scaffold do Next.js 16.4 (App Router, TypeScript strict, Tailwind v4,
ESLint) na raiz deste repositório, Design System "Catálogo." no `@theme`, fontes self-hosted, shell
de layout com `Header` e `NavLink`, páginas `/` e `/favoritos` com o esqueleto visual, Vitest com
o primeiro teste, script `check-tokens`, toggle `CATALOGO_CACHE_COMPONENTS` no `next.config.ts`,
`.env.example` e o esqueleto do README. Entrega a base sobre a qual `tmdb-client`,
`listagem-filmes`, `favoritos`, `detalhe-filme` e `readme-entrega` constroem.

## Parent item(ns) relacionado(s):
- [#L1] Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via
  variável de ambiente, .env.example. Este change entrega o scaffold, a variável de ambiente e o
  `.env.example`; o cliente TMDB em si é o change `tmdb-client`.
- [#L8] README com instruções de execução, decisões técnicas e trade-offs. Este change entrega o
  esqueleto (como rodar, scripts, flags, estrutura) e a primeira leva de decisões;
  `readme-entrega` consolida.

## Tasks
Ver `tasks.md`: 1) scaffold e higiene do repositório; 2) design system (fontes, tokens, botões,
`check-tokens`); 3) shell (Header, NavLink, layout, páginas, `next.config.ts`, Vitest);
4) ambiente e README; 5) verificação nos dois modos de `cacheComponents`; 6) validação.

## Por quê
O repositório está vazio: não há `package.json`, `src/` nem configuração. Nenhum requisito do
enunciado pode ser implementado antes de existir um projeto que builda, linta, testa e segue o
Design System. Fazer isso num change próprio deixa o padrão do repositório (pilares 1 a 8 de
`.work/config.yaml > context`) materializado em arquivos reais antes do primeiro código de
funcionalidade, e prova desde o dia 1 que o build passa sem token e sem rede nos dois modos de
`cacheComponents` (D2, D7 em `.work/design/decisoes.md`).

## O que muda
- Nasce o projeto Next.js 16.4 em `src/`, criado com `create-next-app@16.4.0` em diretório
  temporário e movido para a raiz (a CLI recusa a raiz por causa de `.work/` e `DESAFIO.md`).
- `src/app/globals.css` passa a ser a única fonte de cores do código: os 14 tokens de
  `.work/design/tokens/tokens.json` no `@theme`, com `--color-*: initial`, mais tipografia e
  estilos base (fundo, foco visível, placeholder).
- Fontes Plus Jakarta Sans e IBM Plex Sans self-hosted em `src/app/fonts/` via `next/font/local`.
- `Header` (Server Component) com logo "Catálogo." e `NavLink` (client, `aria-current`) para
  Explorar e Favoritos. Páginas `/` ("Filmes populares") e `/favoritos` ("Meus favoritos" +
  "Os filmes salvos ficam neste navegador.") só com o esqueleto visual; o conteúdo vem nos changes
  seguintes.
- `Button`/`ButtonLink` em `src/components/ui/` com as variantes `primary` e `outline` do protótipo.
- `next.config.ts` com `images.remotePatterns` para `image.tmdb.org` e o toggle
  `CATALOGO_CACHE_COMPONENTS` que liga `cacheComponents` + `partialPrefetching` juntos.
- Vitest 5 + Testing Library configurados; primeiro teste em `NavLink.test.tsx`.
- `scripts/check-tokens.mjs`: confere `tokens.json` × `@theme` e proíbe cor literal em `src/`.
- Scripts npm: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`,
  `tokens:check`, `check`.
- `.env.example`, `.gitignore` (com `.work/design/reference/` e `!.env.example`),
  `.gitattributes`, `.nvmrc`, `engines`, `AGENTS.md`, README com as seções iniciais.
- `.work/` e `.claude/` passam a ser parte do repositório versionado (D8).
- Fora de escopo: qualquer chamada ao TMDB, listagem, detalhe, favoritos funcionais, `EmptyState`,
  `error.tsx` (nenhuma página deste change busca dados).

## Capacidades
### Novas
- `projeto-base`: projeto Next.js que builda sem segredos e sem rede, nos dois modos de
  `cacheComponents`; Design System como única fonte de cores, verificado por script; shell de
  navegação acessível; fontes self-hosted. Spec em `specs/projeto-base/spec.md`.
### Modificadas
- nenhuma (repositório vazio).

## Parent items e tasks
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [#L1] — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
  - [#L1] — Scaffold com `create-next-app@16.4.0` em diretório temporário e mover para a raiz
  - [#L1] — Higiene do repositório: `.gitignore`, `.gitattributes`, `.nvmrc`, `engines`, exclusão de `.work` no tsconfig e no ESLint
  - [#L1] — Dependências de teste (Vitest 5, Vite 8, Testing Library, jsdom) e `@types/node ^22`
  - [#L1] — Fontes self-hosted em `src/app/fonts/` + `src/app/fonts.ts`
  - [#L1] — Tokens no `@theme` de `globals.css` + estilos base
  - [#L1] — `scripts/check-tokens.mjs` + script `tokens:check`
  - [#L1] — `Button`/`ButtonLink` em `components/ui/`
  - [#L1] — `Header` + `NavLink` + `NavLink.test.tsx`
  - [#L1] — `layout.tsx`, `page.tsx`, `favoritos/page.tsx`
  - [#L1] — `next.config.ts` com toggle e `images.remotePatterns`
  - [#L1] — Vitest: `vitest.config.mts`, `vitest.setup.ts`, scripts
  - [#L1] — `.env.example`
  - [#L1] — Build sem `.env.local` e build com `CATALOGO_CACHE_COMPONENTS=1`
- [#L8] — README com instruções de execução, decisões técnicas e trade-offs
  - [#L8] — README: título, como rodar, scripts, flags, estrutura, decisões deste change

## Impacto
- Arquivos novos: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`,
  `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`,
  `next-env.d.ts`, `.gitignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `AGENTS.md`,
  `README.md`, `scripts/check-tokens.mjs`, `src/app/globals.css`, `src/app/fonts.ts`,
  `src/app/fonts/*.woff2` e `src/app/fonts/LICENSE-*.txt`, `src/app/layout.tsx`,
  `src/app/page.tsx`, `src/app/favoritos/page.tsx`, `src/app/favicon.ico`,
  `src/components/layout/Header.tsx`, `src/components/layout/NavLink.tsx`,
  `src/components/layout/NavLink.test.tsx`, `src/components/ui/Button.tsx`,
  `src/components/ui/Button.test.tsx`.
- Arquivos modificados: nenhum (repositório vazio). `.work/design/decisoes.md` recebe a
  revisão de D11 (fontes locais em vez de `next/font/google`).
- Dependências: `next@16.4.0`, `react@19.3`, `react-dom@19.3`, `typescript`, `tailwindcss@4`,
  `@tailwindcss/postcss`, `eslint@9`, `eslint-config-next@16.4.0`, `@types/node@^22`,
  `@types/react`, `@types/react-dom`, `vitest@5`, `vite@8`, `@vitejs/plugin-react@6`, `jsdom`,
  `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `vite-tsconfig-paths`. Nenhuma dependência de runtime além do
  Next e do React.
- Padrões reutilizados: nenhum código existente. Inspecionados: `.work/config.yaml > context`
  (pilares 1 a 8), `.work/design/decisoes.md` (D1 a D11, D33, D34, D40), `.work/design/components.md`
  (`Header`, `NavLink`, `Button`/`ButtonLink`, arquivos de rota), `.work/design/tokens/tokens.json`
  e `tokens/README.md`, as três telas em `.work/design/screens/` (o header e o container são
  idênticos nas três; a tela base deste change é `Main.dc.html` para `/` e `Favoritos.dc.html`
  para `/favoritos`). O bundle `.work/design/reference/` não foi usado como código (D3).
