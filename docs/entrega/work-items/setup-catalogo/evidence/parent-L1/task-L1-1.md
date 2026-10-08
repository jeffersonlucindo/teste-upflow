# Evidência — Task #L1-1 — Scaffold e higiene do repositório

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O projeto Next.js 16.4 foi gerado com `create-next-app@16.4.0` em um diretório temporário e movido para a raiz, porque a CLI recusa uma pasta que já tenha `.work/` e `DESAFIO.md`. Em seguida vieram a higiene de git e Node, a exclusão de `.work/` das ferramentas e a instalação das dependências de runtime e de teste.

## Tasks de execução realizadas
- [x] 1.1 Gerar o projeto com `create-next-app@16.4.0` num diretório temporário
- [x] 1.2 Mover o conteúdo gerado para a raiz do repositório
- [x] 1.3 Higiene de git e Node
- [x] 1.4 Excluir `.work/` do typecheck, do lint e da varredura do Tailwind
- [x] 1.5 Instalar dependências de runtime e de teste
- [x] 1.6 Limpar o template da CLI

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json` | criado | Nome `catalogo-filmes`, `private`, `engines.node >= 20.9`, dependências de runtime e de teste |
| `package-lock.json` | criado | Lockfile novo, gerado por `npm install` |
| `tsconfig.json` | criado | Gerado pela CLI (strict, alias `@/*`), com `.work` em `exclude` |
| `eslint.config.mjs` | criado | Flat config da CLI, com `.work/**` e `scripts/**` em `globalIgnores` |
| `postcss.config.mjs` | criado | Tailwind v4 via `@tailwindcss/postcss` |
| `.gitignore` | criado | Regras da CLI mais `.work/design/reference/` e `!.env.example` |
| `.gitattributes` | criado | `* text=auto eol=lf` e `*.woff2 binary` |
| `.nvmrc` | criado | `22` |
| `AGENTS.md` | criado | Gerado pela CLI, mantido para commit |
| `src/app/favicon.ico` | criado | Mantido do template |
| `public/*.svg` | removido | Os cinco SVGs do template foram apagados |

## Decisões técnicas
- D1: Next.js 16.4, App Router, React 19.3, TypeScript strict.
- D3: scaffold em diretório temporário e movido para a raiz; nada copiado de `.work/design/reference/`.
- D4: npm com lockfile versionado, `engines` e `.nvmrc`.
- D5: Tailwind v4 via PostCSS.
- D8 e D10: `.work/` versionado (o ferramental local, não), `reference/` ignorado, fim de linha LF.

## Resultado
`git check-ignore` confirma que `.work/design/reference/` e `.env.local` são ignorados e que `.env.example` é versionável. `npm ls vitest vite @vitejs/plugin-react` não mostra peer pendente. Versões instaladas: next 16.4.0, react 19.3.0, tailwindcss 4.3.3, vitest 5.0.3, vite 8.3.3.

## Observações
A CLI 16.4 aceitou `--no-cache-components`, mas gerou o loader `@tailwindcss/turbopack` em vez do PostCSS que o design supunha. O loader foi trocado por `@tailwindcss/postcss` para cumprir a D5. `npm audit` aponta 5 alertas altos no pacote transitivo `braces`, de ferramentas de desenvolvimento; a correção exige `--force` e não foi aplicada.
