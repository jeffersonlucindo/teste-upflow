# Design — setup-catalogo

## Contexto
Repositório sem código. O padrão do projeto está fixado em `.work/config.yaml > context` (oito
pilares) e as decisões em `.work/design/decisoes.md`; este change é o primeiro a materializá-los.
Referência visual: header, container e tipografia são idênticos nas três telas de
`.work/design/screens/`; os valores (cores, 44 px de altura dos controles, raio 8 px, container
1200 px, paddings) estão nos `style` inline e resumidos em `.work/design/README.md > Tipografia e
medidas`. Cores só por token de `tokens/tokens.json`. Contratos dos componentes em
`.work/design/components.md`.

Fatos verificados nos docs de `next@16.4.0` (`node_modules/next/dist/docs/` depois do scaffold;
lidos no explore a partir do pacote):
- `create-next-app` 16.4 tolera `.claude`, `AGENTS.md`, `README.md`, `docs` na pasta alvo, mas não
  `.work` nem `DESAFIO.md`; por isso o scaffold roda num diretório temporário (D3).
- `next/font/google` baixa CSS e arquivos de fonte **no build** (`02-components/font.md`). Como o
  critério deste change é build sem rede, as fontes ficam locais (revisão de D11, abaixo).
- `partialPrefetching` sem `cacheComponents` falha a validação do config; `cacheComponents` sem
  `partialPrefetching` definido gera warning (`dist/server/config.js`). O toggle liga os dois.
- `loadEnvConfig` roda antes de o `next.config.*` ser avaliado, então `.env.local` alimenta o toggle.
- `next typegen` existe e é a forma documentada de gerar os tipos de rota antes de `tsc --noEmit`.

## Objetivos
- Projeto que roda `npm run check` e `npm run build` verdes sem `.env.local` e sem rede, nos dois
  modos de `cacheComponents` (pilar 7).
- Design System como única fonte de cores no código, verificado por script (pilar 5).
- Shell de navegação acessível e idêntico nas três telas (Header, NavLink, container).
- Convenções de pastas, nomes e testes materializadas para os changes seguintes copiarem (pilar 2).
- README com o que já dá para documentar: como rodar, scripts, flags, estrutura (só código, sem explicar o fluxo).

## Não-objetivos
- Chamadas ao TMDB, tipos de domínio, mapeadores (`tmdb-client`).
- Listagem, filtros, paginação, `EmptyState`, `error.tsx` (`listagem-filmes`).
- Store de favoritos, `FavoritesBadge`, `FavoriteButton` (`favoritos`).
- Rota `/movie/[id]` (`detalhe-filme`).
- Deploy.

## Abordagem
- Gerar o projeto oficial com `create-next-app@16.4.0` num diretório temporário, mover para a raiz
  e então substituir, arquivo por arquivo, o que a CLI gera por template pelo que o projeto precisa
  (`globals.css`, `layout.tsx`, `page.tsx`, `next.config.ts`, `README.md`, `public/`).
- Tudo que este change cria é Server Component, exceto `NavLink` (precisa de `usePathname`).
  Nenhuma página busca dados, então não há Suspense ainda; a estrutura de `page.tsx` fica pronta
  para receber os dois `<Suspense>` do `listagem-filmes`.
- O código já nasce válido nos dois modos de `cacheComponents`: sem `'use cache'`, sem IO síncrono
  em componente, sem leitura de request. `next dev` e `next build` com a flag ligada são parte do
  critério de pronto (D42).

## Decisões técnicas
1. **Scaffold em diretório temporário e mover** (aplica D1, D3, D4) — `npx create-next-app@16.4.0
   <tmp> --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git
   --skip-install --no-cache-components --yes`. `--disable-git` porque o `.git` já existe na raiz;
   `--skip-install` para instalar uma única vez depois de mover; `--no-cache-components` para o
   `next.config.ts` gerado não vir com as flags fixas (se a CLI não aceitar a flag, remover as duas
   linhas do config gerado). Mover todo o conteúdo, inclusive `.gitignore` e `AGENTS.md`, para a
   raiz. Alternativa descartada: copiar o shell de `.work/design/reference/` (D3).
2. **Toggle `CATALOGO_CACHE_COMPONENTS`** (D2) — `next.config.ts` lê `process.env.CATALOGO_CACHE_COMPONENTS`,
   considera ligado quando vale `1` ou `true` (case-insensitive) e, só nesse caso, declara
   `cacheComponents: true` e `partialPrefetching: true`; caso contrário não declara nenhum dos dois.
   Prefixo próprio porque `NEXT_` é namespace interno. A variável entra comentada em `.env.example`
   e documentada no README em "Flags".
   ```ts
   const cacheComponents = /^(1|true)$/i.test(process.env.CATALOGO_CACHE_COMPONENTS ?? "");
   const nextConfig: NextConfig = {
     ...(cacheComponents ? { cacheComponents: true, partialPrefetching: true } : {}),
     images: { remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }] },
   };
   ```
   `images.remotePatterns` já entra aqui para o `next.config.ts` não ser tocado de novo em
   `tmdb-client` (D23).
3. **Tailwind v4 via PostCSS** (D5) — manter `postcss.config.mjs` + `@tailwindcss/postcss` gerados
   pela CLI. Em `globals.css`, `@source not "../../.work";` para a varredura automática de classes
   não indexar a documentação em `.work/` (que cita classes de token em prosa).
4. **Tokens no `@theme`, nomes 1:1** (D33, pilar 5) — `src/app/globals.css` declara
   `--color-*: initial` e os 14 tokens com o nome exato de `tokens.json`
   (`--color-bg-base`, `--color-surface-100`, …, `--color-on-accent: var(--color-bg-base)`,
   `--color-focus-ring: var(--color-accent)`). Classes resultantes: `bg-bg-base`, `bg-surface-100`,
   `border-border-subtle`, `text-text-primary`, `text-text-muted`, `bg-accent`, `text-on-accent`,
   `outline-focus-ring`. `--color-transparent` e `--color-current` são re-declarados porque o
   `initial` apaga tudo. Camada base: `html { color-scheme: dark }`, `body` com `bg-bg-base
   text-text-primary font-sans antialiased`, `:focus-visible` com `outline-2 outline-offset-2
   outline-focus-ring`, `::placeholder` com `text-text-muted` (D34).
5. **Fontes locais em vez de `next/font/google`** (revisa D11; motivo: build sem rede) — os
   arquivos latin `plus-jakarta-sans-latin-wght-normal.woff2` (variável, 27 KB) e
   `ibm-plex-sans-latin-{400,500,600}-normal.woff2` (24 KB cada) vêm dos pacotes
   `@fontsource-variable/plus-jakarta-sans` e `@fontsource/ibm-plex-sans` (OFL-1.1), extraídos uma
   vez com `npm pack` e commitados em `src/app/fonts/` junto com os dois `LICENSE`. Os pacotes não
   ficam como dependência. `src/app/fonts.ts` exporta `heading` (`next/font/local`, `weight:
   "200 800"`, `variable: "--font-heading"`) e `body` (três `src`, `variable: "--font-body"`),
   ambos `display: "swap"`. `@theme inline` mapeia `--font-display` e `--font-sans` para essas
   variáveis. Alternativa descartada: pacotes fontsource com CSS próprio (perde o `size-adjust` de
   fallback do `next/font`). Registrar no README e atualizar D11 em `decisoes.md`.
6. **`Header` RSC + `NavLink` client** (pilar 1, `components.md`) — `Header` em
   `src/components/layout/Header.tsx`: `header.border-b.border-border-subtle`, `nav` com
   `aria-label="Principal"`, `mx-auto max-w-[1200px] px-4 sm:px-10 py-4 flex flex-wrap
   items-center justify-between gap-4`, logo `Link` com `font-display text-xl font-extrabold
   text-text-primary` e `<span class="text-accent">.</span>`. `NavLink` em `NavLink.tsx` com
   `"use client"`, `usePathname()`, ativo quando `href === "/"` e pathname exato, ou pathname
   começa com `href`; ativo recebe `aria-current="page"` e `bg-surface-100 text-text-primary
   font-semibold`, inativo `text-text-muted hover:text-text-primary font-medium`; ambos
   `inline-flex min-h-11 items-center gap-2 rounded-lg px-4`. O slot do `FavoritesBadge` é só
   `children`, ligado no change `favoritos`.
7. **`layout.tsx`** — `<html lang="pt-BR">` com as variáveis das fontes e `h-full`; `body` com
   `flex min-h-full flex-col`; `<Header />`; `<main class="mx-auto w-full max-w-[1200px] flex-1 px-4
   pt-8 pb-14 sm:px-10">{children}</main>`. `metadata`: `title: { default: "Catálogo.", template:
   "%s · Catálogo." }`, `description` curta. Tipagem com `LayoutProps<"/">`.
8. **Páginas-esqueleto** — `src/app/page.tsx`: `section.flex.flex-col.gap-6` com `h1` `font-display
   text-4xl font-extrabold tracking-tight` "Filmes populares" e um parágrafo `text-text-muted`
   dizendo que a listagem chega no change `listagem-filmes`; `metadata.title` "Filmes populares".
   `src/app/favoritos/page.tsx`: `h1` "Meus favoritos" + `p.text-text-muted` "Os filmes salvos ficam
   neste navegador."; `metadata.title` "Meus favoritos". Nenhuma leitura de `searchParams`.
9. **`Button`/`ButtonLink`** (D40) — `src/components/ui/Button.tsx` exporta `buttonClassName(variant)`
   e dois componentes finos: `Button` (`<button type="button">`) e `ButtonLink` (`next/link`).
   Variantes: `primary` = `bg-accent text-on-accent`; `outline` = `border border-border-strong
   bg-bg-base text-text-primary`; base = `inline-flex min-h-11 items-center justify-center gap-2
   rounded-lg px-5 font-semibold`. Sem `"use client"` (shared). Teste cobre papel, nome acessível e
   `href`.
10. **Vitest 5** (D7) — `vitest.config.mts` com `tsconfigPaths()`, `react()`, `environment: "jsdom"`,
    `globals: false`, `setupFiles: ["./vitest.setup.ts"]`, `include: ["src/**/*.test.{ts,tsx}"]`,
    `css: false`. `vitest.setup.ts` importa `@testing-library/jest-dom/vitest` e faz `cleanup()` +
    `localStorage.clear()` em `afterEach`. Dependências: `vitest@5`, `vite@8` (peer explícito),
    `@vitejs/plugin-react@6`, `jsdom`, `@testing-library/{react,dom,jest-dom,user-event}`,
    `vite-tsconfig-paths`. `@types/node` sobe para `^22` (peer do Vitest 5). Script `test` é
    `vitest run`; `test:watch` é `vitest`.
11. **`check-tokens`** (D9) — `scripts/check-tokens.mjs` (ESM, Node 22, sem dependências):
    resolve a raiz com `fileURLToPath(new URL("..", import.meta.url))`; lê
    `.work/design/tokens/tokens.json` e `src/app/globals.css`; para cada token, exige
    `--color-<name>: <valor>;` no `@theme` (alias `{x}` vira `var(--color-x)`); percorre
    `src/**/*.{ts,tsx,css}` exceto `globals.css` e falha em `#hex`, `rgb(`, `hsl(` e classes
    arbitrárias `[#...]`/`[rgb...]`/`[hsl...]`, imprimindo `arquivo:linha`. Sai com código 1 em
    qualquer problema. Script `tokens:check`; `check` encadeia `tokens:check`, `lint`,
    `typecheck`, `test`.
12. **Scripts e typecheck** — `lint: eslint`, `typecheck: next typegen && tsc --noEmit`,
    `build: next build`, `dev: next dev`, `start: next start`. `eslint.config.mjs` ganha
    `".work/**"` e `"scripts/**"` em `globalIgnores`; `tsconfig.json` ganha `".work"` em `exclude`
    (a CLI inclui `**/*.tsx`, e `.work/design/reference/` tem `.tsx`).
13. **Higiene do repositório** (D8, D10) — `.gitignore` da CLI mais `.work/design/reference/` e a
    exceção `!.env.example` (a CLI ignora `.env*`). `.gitattributes` com `* text=auto eol=lf` e
    `*.woff2 binary`. `.nvmrc` com `22`; `engines.node: ">=20.9"`. `AGENTS.md` da CLI fica e é
    commitado (o `next dev` o regenera). `public/` perde os SVGs do template.
14. **README esqueleto** (L8) — seções: título e uma frase; "Como rodar" (Node 22, `npm ci`,
    `.env.local` a partir de `.env.example` com instrução para bash e PowerShell, `npm run dev`);
    "Scripts" (tabela); "Flags" (`CATALOGO_CACHE_COMPONENTS`); "Estrutura" (árvore de `src/`);
    (a seção "Processo" foi retirada em 2026-10-07: o README trata só do código); "Decisões técnicas e
    trade-offs" com as deste change (D1 a D11 revisada, D33, D34, D40); "Melhorias futuras" vazio.

## Riscos / Trade-offs
- `create-next-app` pode não aceitar `--no-cache-components` → remover `cacheComponents` e
  `partialPrefetching` do config gerado antes de aplicar a decisão 2.
- Mover os arquivos da CLI por cima da raiz pode sobrescrever `README.md` e `.gitignore` se já
  existirem → a raiz não os tem hoje; a task confere antes de mover.
- `@vitejs/plugin-react@6` exige `vite@8`; `vitest@5` aceita `vite@8` → instalar `vite@8` explícito
  evita resolução errada.
- Fontes commitadas (~100 KB) e licença → OFL-1.1 permite; `LICENSE` junto dos arquivos; README cita.
- Tailwind varrendo `.work/` → `@source not "../../.work"` em `globals.css`.
- `tsc --noEmit` e ESLint entrando em `.work/design/reference/` → excluídos (decisão 12).
- Build com a flag ligada é mais estrito (shell estático) → este change não tem dados, então o
  risco é só de IO síncrono acidental; a verificação 5.2 das tasks pega.
- Decisões para o README (seção "Decisões técnicas e trade-offs"): D1, D2, D3, D4, D5, D6, D7, D8,
  D9, D10, D11 (revisada: fontes locais), D33, D34, D40.
