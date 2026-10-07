# Tasks — setup-catalogo

## Contexto
- Proposal: .work/changes/setup-catalogo/proposal.md
- Design: .work/changes/setup-catalogo/design.md
- Decisões: .work/design/decisoes.md (D1–D11, D33, D34, D40) · Contratos: .work/design/components.md
- Ambiente: Windows 11, Node 22, npm 10. Comandos abaixo em Git Bash; equivalentes PowerShell onde fizer diferença.

## 1. Scaffold e higiene do repositório
<!-- [{{ref_token}}] é o ref token do tracker (ex.: #123, PROJ-123, ou vazio quando tracker=none). Resolvido por tracker.ref_token. -->
- [x] 1.1 Gerar o projeto com `create-next-app@16.4.0` num diretório temporário [#L1]
  - Inspecionar: raiz do repo (`ls -la`): deve conter só `.git/`, `.claude/`, `.work/`, `DESAFIO.md`; sem `README.md` nem `.gitignore` para não haver colisão ao mover
  - Criar/Alterar: `npx create-next-app@16.4.0 "$TMP/cna-catalogo" --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm --disable-git --skip-install --no-cache-components --yes` (se `--no-cache-components` for rejeitada, rodar sem ela e remover `cacheComponents`/`partialPrefetching` do `next.config.ts` gerado)
  - Critério: diretório temporário com `package.json` (next 16.4.0, react 19.3), `src/app/{layout,page}.tsx`, `src/app/globals.css`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json` com `"@/*": ["./src/*"]`, `AGENTS.md`, `gitignore`/`.gitignore`
- [x] 1.2 Mover o conteúdo gerado para a raiz do repositório [#L1]
  - Inspecionar: conteúdo do temporário (inclusive ocultos: `.gitignore`); a raiz não pode ter arquivo homônimo
  - Criar/Alterar: mover tudo para a raiz (`mv "$TMP/cna-catalogo"/{.,}* .` ou `robocopy /E /MOVE` no PowerShell); apagar o temporário
  - Critério: `git status` mostra os arquivos novos na raiz; `.claude/`, `.work/`, `DESAFIO.md` intactos; `cat .gitignore` contém `/node_modules` e `.env*`
- [x] 1.3 Higiene de git e Node [#L1]
  - Inspecionar: `.gitignore` gerado; `.work/design/README.md > .gitignore (decidido, D8)`
  - Criar/Alterar: acrescentar ao `.gitignore` as linhas `.work/design/reference/` e `!.env.example`; criar `.gitattributes` com `* text=auto eol=lf` e `*.woff2 binary`; criar `.nvmrc` com `22`; em `package.json`, `"engines": { "node": ">=20.9" }` e `"name": "catalogo-filmes"`, `"private": true`
  - Critério: `git check-ignore .work/design/reference/catalogo-filmes/package.json` imprime o caminho; `git check-ignore .env.example` não imprime nada (sai com 1)
- [x] 1.4 Excluir `.work/` do typecheck, do lint e da varredura do Tailwind [#L1]
  - Inspecionar: `tsconfig.json` (`include` tem `**/*.ts`/`**/*.tsx`), `eslint.config.mjs` (`globalIgnores`), `src/app/globals.css`
  - Criar/Alterar: `tsconfig.json > exclude: ["node_modules", ".work"]`; `eslint.config.mjs > globalIgnores([..., ".work/**", "scripts/**"])`; `globals.css` recebe `@source not "../../.work";` logo após `@import "tailwindcss";`
  - Critério: `npx tsc --noEmit` e `npx eslint` não reportam nada de `.work/`
- [x] 1.5 Instalar dependências de runtime e de teste [#L1]
  - Inspecionar: `package.json` gerado (versões de `next`, `react`, `@types/node`)
  - Criar/Alterar: `npm install`; depois `npm install -D vitest@5 vite@8 @vitejs/plugin-react@6 jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths @types/node@^22`
  - Critério: `npm ls vitest vite @vitejs/plugin-react` sem `UNMET PEER`; `package-lock.json` gerado; `node_modules/next/dist/docs/` existe (docs da versão instalada)
- [x] 1.6 Limpar o template da CLI [#L1]
  - Inspecionar: `public/*.svg`, `src/app/page.tsx`, `src/app/globals.css`, `README.md` gerados
  - Criar/Alterar: apagar `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`; manter `src/app/favicon.ico`; `page.tsx`, `globals.css` e `README.md` serão reescritos nas tasks 2.2, 3.3 e 4.2
  - Critério: `ls public/` vazio (ou só o que o projeto precisar)

## 2. Design System
- [x] 2.1 Fontes self-hosted (D11 revisada) [#L1]
  - Inspecionar: `.work/design/README.md > Tipografia` (Plus Jakarta Sans 700/800 display; IBM Plex Sans 400/500/600 corpo)
  - Criar/Alterar: em diretório temporário, `npm pack @fontsource-variable/plus-jakarta-sans @fontsource/ibm-plex-sans` e extrair; copiar `files/plus-jakarta-sans-latin-wght-normal.woff2`, `files/ibm-plex-sans-latin-{400,500,600}-normal.woff2` e os dois `LICENSE` (renomeados `LICENSE-plus-jakarta-sans.txt`, `LICENSE-ibm-plex-sans.txt`) para `src/app/fonts/`; criar `src/app/fonts.ts` com `localFont` do `next/font/local`: `heading` (`src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2"`, `weight: "200 800"`, `variable: "--font-heading"`, `display: "swap"`) e `body` (três `src` com `weight` 400/500/600, `variable: "--font-body"`, `display: "swap"`)
  - Critério: `ls src/app/fonts/` lista 4 `.woff2` e 2 licenças; `grep -r fonts.googleapis src/` vazio; os pacotes fontsource NÃO estão em `package.json`
- [x] 2.2 Tokens no `@theme` e estilos base em `src/app/globals.css` [#L1]
  - Inspecionar: `.work/design/tokens/tokens.json` (14 tokens; `on-accent` e `focus-ring` são aliases), `tokens/README.md > Usando no código`, `design.md` decisão 4
  - Criar/Alterar: reescrever `globals.css`: `@import "tailwindcss"; @source not "../../.work";` → `@theme { --color-*: initial; --color-bg-base: #121316; … --color-on-accent: var(--color-bg-base); --color-focus-ring: var(--color-accent); --color-upflow-blue: #1328db; --color-transparent: transparent; --color-current: currentColor; }` → `@theme inline { --font-sans: var(--font-body), ui-sans-serif, system-ui, sans-serif; --font-display: var(--font-heading), ui-sans-serif, system-ui, sans-serif; }` → `@layer base { html { color-scheme: dark } body { @apply bg-bg-base font-sans text-text-primary antialiased } :focus-visible { @apply outline-2 outline-offset-2 outline-focus-ring } ::placeholder { @apply text-text-muted } }`
  - Critério: todos os 14 nomes de `tokens.json` aparecem como `--color-<name>` com o mesmo valor; nenhuma outra cor no arquivo
- [x] 2.3 Script `check-tokens` [#L1]
  - Inspecionar: `design.md` decisão 11; `tokens.json > color.tokens[].value` (string ou alias `{name}`)
  - Criar/Alterar: `scripts/check-tokens.mjs` (ESM, sem dependências, raiz via `fileURLToPath`); em `package.json`: `"tokens:check": "node scripts/check-tokens.mjs"` e `"check": "npm run tokens:check && npm run lint && npm run typecheck && npm run test"`
  - Critério: `npm run tokens:check` passa; inserir temporariamente `#fff` num `.tsx` de `src/` faz o script falhar apontando `arquivo:linha` e sair com código 1; remover o teste
- [x] 2.4 `Button` e `ButtonLink` em `src/components/ui/Button.tsx` [#L1]
  - Inspecionar: `.work/design/components.md` linha `Button / ButtonLink`; botões "Anterior"/"Próxima" em `screens/Main.dc.html` (outline e primário, 44 px, raio 8 px, padding 0 20 px, peso 600)
  - Criar/Alterar: `Button.tsx` (shared) com `buttonClassName(variant: "primary" | "outline")`, `Button` (`type="button"` por padrão) e `ButtonLink` (`next/link`, aceita `aria-disabled`); `Button.test.tsx` com Testing Library: renderiza `ButtonLink` com `href` e nome acessível; `Button` dispara `onClick`
  - Critério: `npx vitest run src/components/ui` verde (depende da task 3.5; se ainda não existir a config, concluir após 3.5)

## 3. Shell da aplicação
- [x] 3.1 `Header` e `NavLink` [#L1]
  - Inspecionar: header em `screens/Main.dc.html` (logo "Catálogo." com ponto em accent; Explorar ativo com `surface-100`; Favoritos inativo `text-muted`), `components.md` linhas `Header` e `NavLink`, `design.md` decisão 6
  - Criar/Alterar: `src/components/layout/Header.tsx` (RSC); `src/components/layout/NavLink.tsx` (`"use client"`, `usePathname`); `src/components/layout/NavLink.test.tsx` mockando `next/navigation` (`usePathname`) e cobrindo: rota atual recebe `aria-current="page"`; `/` não fica ativo em `/favoritos`; `/favoritos` ativo em `/favoritos`
  - Critério: teste verde; nenhuma cor literal (task 2.3 passa)
- [x] 3.2 `src/app/layout.tsx` [#L1]
  - Inspecionar: container das três telas (`max-width: 1200px`, nav `16px 40px`, main `32px 40px 56px`), `design.md` decisão 7, `src/app/fonts.ts`
  - Criar/Alterar: reescrever `layout.tsx` com `lang="pt-BR"`, classes das fontes (`heading.variable`, `body.variable`), `Header`, `main` com o container, `metadata` com template `"%s · Catálogo."`; tipar com `LayoutProps<"/">`
  - Critério: `npm run dev` abre `/` com header, fontes aplicadas (inspecionar `font-family` no devtools) e fundo `#121316` vindo do token
- [x] 3.3 Páginas `/` e `/favoritos` com o esqueleto [#L1]
  - Inspecionar: `screens/Main.dc.html` (h1 "Filmes populares", 40 px, 800), `screens/Favoritos.dc.html` (h1 + subtítulo `text-muted`), `design.md` decisão 8
  - Criar/Alterar: reescrever `src/app/page.tsx`; criar `src/app/favoritos/page.tsx`; ambos com `metadata.title`; sem `searchParams`, sem fetch
  - Critério: `/` e `/favoritos` renderizam; `NavLink` marca a rota ativa; título da aba "Filmes populares · Catálogo." e "Meus favoritos · Catálogo."
- [x] 3.4 `next.config.ts` com toggle e `images.remotePatterns` [#L1]
  - Inspecionar: `next.config.ts` gerado; `design.md` decisão 2
  - Criar/Alterar: reescrever com `cacheComponents`/`partialPrefetching` condicionados a `CATALOGO_CACHE_COMPONENTS` (`1`/`true`, case-insensitive) e `images.remotePatterns` para `https://image.tmdb.org/t/p/**`
  - Critério: `npm run build` sem a variável não loga warning de `partialPrefetching`; `CATALOGO_CACHE_COMPONENTS=1 npm run build` (PowerShell: `$env:CATALOGO_CACHE_COMPONENTS="1"; npm run build`) mostra rotas `◐`/`○` do modo Cache Components
- [x] 3.5 Vitest configurado e scripts npm completos [#L1]
  - Inspecionar: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`; `design.md` decisões 10 e 12
  - Criar/Alterar: `vitest.config.mts` (`tsconfigPaths()`, `react()`, `environment: "jsdom"`, `setupFiles`, `include: ["src/**/*.test.{ts,tsx}"]`, `css: false`); `vitest.setup.ts` (`@testing-library/jest-dom/vitest`, `cleanup()` e `localStorage.clear()` em `afterEach`); scripts: `dev`, `build`, `start`, `lint: eslint`, `typecheck: next typegen && tsc --noEmit`, `test: vitest run`, `test:watch: vitest`, `tokens:check`, `check`
  - Critério: `npm run test` executa `NavLink.test.tsx` e `Button.test.tsx` verdes e termina (sem watch); `npm run typecheck` verde

## 4. Ambiente e documentação
- [x] 4.1 `.env.example` [#L1]
  - Inspecionar: `.work/config.yaml > context > Stack` (nomes das variáveis)
  - Criar/Alterar: `.env.example` com `TMDB_API_READ_TOKEN=` (comentário: API Read Access Token v4, só no servidor, nunca `NEXT_PUBLIC_`), `TMDB_LANGUAGE=pt-BR`, e `# CATALOGO_CACHE_COMPONENTS=1` comentada com uma linha explicando o toggle
  - Critério: arquivo versionado (`git check-ignore .env.example` sai com 1); `.env.local` ignorado
- [x] 4.2 README esqueleto [#L8]
  - Inspecionar: `DESAFIO.md > Entrega` (README obrigatório com execução, decisões, trade-offs); `design.md` decisão 14; `.work/design/decisoes.md` (D1–D11, D33, D34, D40)
  - Criar/Alterar: reescrever `README.md` com: título "Catálogo." e uma frase; "Como rodar" (Node 22, `npm ci`, copiar `.env.example` para `.env.local` em bash e PowerShell, token em themoviedb.org/settings/api, `npm run dev`); "Scripts" (tabela); "Flags" (`CATALOGO_CACHE_COMPONENTS`, o que liga, como testar); "Estrutura" (árvore de `src/` com os domínios previstos); "Processo" (`.work/` e `.claude/`: devflow, onde estão `decisoes.md`, `components.md`, changes); "Decisões técnicas e trade-offs" com um parágrafo por decisão deste change, citando o id D<n>; "Melhorias futuras" (vazio, preenchido no `readme-entrega`)
  - Critério: seguir o README do zero num clone limpo funciona até `npm run dev`
- [x] 4.3 `AGENTS.md` e docs da versão [#L1]
  - Inspecionar: `AGENTS.md` gerado pela CLI; bloco `nextjs-agent-rules`
  - Criar/Alterar: manter e commitar; se o `next dev` reescrever o bloco, commitar a versão regenerada
  - Critério: `git status` limpo após `npm run dev` + parar

## 5. Verificação nos dois modos (critério do change, D42)
- [x] 5.1 Build sem segredos [#L1]
  - Inspecionar: ausência de `.env.local` (renomear temporariamente se existir)
  - Criar/Alterar: nada; rodar `npm run build`
  - Critério: build verde sem `.env.local`; nenhuma requisição externa durante o build (não há fetch nem `next/font/google`); `grep -r "fonts.googleapis" .next/server/app | wc -l` = 0
- [x] 5.2 Build e dev com `CATALOGO_CACHE_COMPONENTS=1` [#L1]
  - Inspecionar: `design.md` decisão 2
  - Criar/Alterar: nada; rodar o build e depois `next dev` com a variável ligada, abrir `/` e `/favoritos`
  - Critério: build verde; `/` e `/favoritos` aparecem como estáticas (`○`) no resumo do build; `next dev` sem insight/erro de blocking-route ou IO síncrono no console e no overlay
- [x] 5.3 Conferência visual [#L1]
  - Inspecionar: `screens/pdf/listagem.png` e `favoritos.png` (header e títulos), 1280 px e 390 px
  - Criar/Alterar: nada
  - Critério: header com logo e dois links, link ativo com fundo `surface-100`, foco visível âmbar ao navegar por Tab; em 390 px o header quebra linha sem overflow horizontal

## 6. Validação
- [x] 6.1 Rodar comandos de validação existentes (comandos de config.yaml > apply.validation): `npm run tokens:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- [x] 6.2 Rodar testes existentes: `npm run test` (NavLink e Button) e registrar a saída na evidência
- [x] 6.3 Conferir que `.work/design/decisoes.md` D11 (já revisada no propose: fontes locais) bate com o que foi implementado; marcar `L1` como `doing` em `.work/backlog.md`; regenerar o HTML do change (`node .claude/devflow/tools/htmlgen.mjs setup-catalogo`)
