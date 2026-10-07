# Evidência — Task #L1-2 — Design System

**Parent item pai:** #L1 — Setup do projeto: scaffold Next.js (App Router) + TypeScript, cliente TMDB com token via variável de ambiente, .env.example
**Data:** 2026-10-07

## Resumo
O Design System "Catálogo." virou a única fonte de cores do código: os 14 tokens de `tokens.json` estão no `@theme` com nomes 1:1 e a paleta padrão do Tailwind foi removida. As fontes são servidas de arquivos locais, e um script próprio verifica a sincronia dos tokens e proíbe cor literal em `src/`. `Button` e `ButtonLink` concentram as classes de botão.

## Tasks de execução realizadas
- [x] 2.1 Fontes self-hosted (D11 revisada)
- [x] 2.2 Tokens no `@theme` e estilos base em `src/app/globals.css`
- [x] 2.3 Script `check-tokens`
- [x] 2.4 `Button` e `ButtonLink` em `src/components/ui/Button.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/app/fonts/*.woff2` | criado | Plus Jakarta Sans variável e IBM Plex Sans 400, 500 e 600 (latin) |
| `src/app/fonts/LICENSE-*.txt` | criado | Licenças OFL-1.1 das duas famílias |
| `src/app/fonts.ts` | criado | `heading` e `body` via `next/font/local`, com `display: "swap"` |
| `src/app/globals.css` | alterado | `--color-*: initial`, 14 tokens, `@theme inline` das fontes, estilos base e foco visível |
| `scripts/check-tokens.mjs` | criado | Confere `tokens.json` contra o `@theme` e varre `src/` atrás de cor literal |
| `src/components/ui/Button.tsx` | criado | `buttonClassName`, `Button` e `ButtonLink`, variantes `primary` e `outline` |
| `src/components/ui/Button.test.tsx` | criado | 7 testes: papel, nome acessível, `href`, `onClick`, `aria-disabled`, classes |
| `package.json` | alterado | Scripts `tokens:check` e `check` |

## Decisões técnicas
- D11: fontes locais em vez de `next/font/google`, que baixa arquivos durante o build.
- D33: tokens com nomes 1:1 e `--color-*: initial`.
- D34: placeholder em `text-muted`; `border-strong` mantido no botão outline.
- D9: `check-tokens` sem dependências, com raiz resolvida por `fileURLToPath`.
- D40: classes de botão em um lugar só.

## Resultado
`npm run tokens:check` imprime "14 tokens em sincronia" e sai com código 0. O script sai com código 1, apontando `arquivo:linha`, para cor literal em `.tsx`, token divergente, token ausente, token extra e cor fora dos tokens em `globals.css`. Os pacotes fontsource não ficaram no `package.json`.

## Observações
O script cobre três casos além do design: token extra no `@theme`, ausência do `--color-*: initial` e cor literal em `globals.css` fora das declarações de token.
