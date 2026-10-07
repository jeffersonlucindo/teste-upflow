# Catálogo.

Catálogo de filmes sobre a API pública do TMDB, feito para o teste técnico de Desenvolvedor Frontend da UpFlow (enunciado em [`DESAFIO.md`](DESAFIO.md)).

> **Estado atual:** base do projeto. Já existem o scaffold, o Design System, o shell de navegação e as páginas `/` e `/favoritos` com o esqueleto visual. Listagem, busca, filtros, detalhe e favoritos ainda não foram implementados.

## Como rodar

Pré-requisitos: Node.js 22 (o `.nvmrc` fixa a versão; qualquer Node >= 20.9 funciona) e npm.

```bash
npm ci
cp .env.example .env.local          # bash, zsh, Git Bash
npm run dev
```

No PowerShell, a cópia é `Copy-Item .env.example .env.local`.

Abra <http://localhost:3000>.

Em `.env.local`, preencha `TMDB_API_READ_TOKEN` com o **API Read Access Token (v4)** da sua conta em <https://www.themoviedb.org/settings/api>. O token é lido só no servidor e nunca recebe o prefixo `NEXT_PUBLIC_`. Nesta etapa nenhuma página chama o TMDB, então `npm run dev` e `npm run build` funcionam mesmo sem `.env.local`.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack). |
| `npm run build` | Build de produção. Passa sem `.env.local` e sem rede. |
| `npm run start` | Serve o build de produção. |
| `npm run lint` | ESLint (flat config, `eslint-config-next`). O `next build` do Next 16 não roda lint. |
| `npm run typecheck` | `next typegen` (tipos de rota) e `tsc --noEmit`. |
| `npm run test` | Vitest em execução única (`vitest run`). |
| `npm run test:watch` | Vitest em modo watch. |
| `npm run tokens:check` | Confere `tokens.json` contra o `@theme` e proíbe cor literal em `src/`. |
| `npm run check` | `tokens:check`, `lint`, `typecheck` e `test` em sequência. |

## Flags

| Variável | Valores | Efeito |
| --- | --- | --- |
| `CATALOGO_CACHE_COMPONENTS` | `1` ou `true` (sem distinguir maiúsculas) | Liga `cacheComponents` e `partialPrefetching` juntos no `next.config.ts`. Qualquer outro valor, ou a ausência da variável, mantém os dois desligados. |

Desligado é o padrão. O código é escrito para valer nos dois modos, por isso não usa `"use cache"` nem `cacheLife`. Para testar o modo ligado:

```bash
CATALOGO_CACHE_COMPONENTS=1 npm run build     # bash
```

```powershell
$env:CATALOGO_CACHE_COMPONENTS="1"; npm run build
```

A variável também pode ir no `.env.local`, que é carregado antes de o `next.config.ts` ser avaliado.

## Estrutura

```
src/
├── app/                      rotas, layouts e arquivos de rota (Server Components)
│   ├── fonts/                .woff2 self-hosted e licenças OFL
│   ├── fonts.ts              next/font/local: heading e body
│   ├── globals.css           @theme com os tokens de cor e estilos base
│   ├── layout.tsx            html pt-BR, Header e container
│   ├── page.tsx              /            (listagem)
│   ├── favoritos/page.tsx    /favoritos
│   └── movie/[id]/           /movie/[id]  (previsto)
├── components/
│   ├── layout/               Header, NavLink
│   ├── ui/                   Button, ButtonLink
│   ├── movies/               previsto
│   ├── movie-detail/         previsto
│   └── favorites/            previsto
└── lib/                      previsto: tmdb/, listing/, favorites/, format/
scripts/check-tokens.mjs      guardrail do Design System
```

Os testes ficam ao lado do arquivo testado (`NavLink.test.tsx`). Não há pasta `utils/` ou `helpers/` genérica.

## Decisões técnicas e trade-offs

Decisões aplicadas até aqui, cada uma com a alternativa considerada e o que se perde com a escolha.

**Next.js 16.4, App Router, React 19.3 e TypeScript strict.** É a versão estável atual do npm; a alternativa era a 15.5. O preço são convenções novas: `params` e `searchParams` são `Promise`, `proxy` substitui `middleware`, o `next build` não roda lint e o Turbopack é o bundler padrão. A documentação consultada é a da versão instalada, em `node_modules/next/dist/docs/`.

**`cacheComponents` desligado por padrão, com toggle.** `CATALOGO_CACHE_COMPONENTS` liga `cacheComponents` e `partialPrefetching` juntos, porque o segundo sem o primeiro falha a validação do config e o primeiro sem o segundo gera warning. O padrão desligado dá previsibilidade e build offline; o toggle demonstra shell estático e prefetch parcial sem fork de código. O custo é escrever na interseção dos dois modelos, sem `"use cache"` nem `cacheLife`.

**Scaffold com `create-next-app@16.4.0` em diretório temporário.** A CLI recusa uma pasta que já tenha outros arquivos, então o projeto foi gerado fora e movido para a raiz. Isso dá lockfile novo e nada herdado, ao custo de um passo manual.

**npm com `package-lock.json` versionado.** `engines.node >= 20.9`, `.nvmrc` com 22 e `npm ci` nas instruções. O pnpm é mais rápido, mas exigiria corepack de quem avalia.

**Tailwind CSS v4 via PostCSS.** Usa `@tailwindcss/postcss` em `postcss.config.mjs`, o caminho documentado e que também funciona com `--webpack`. A CLI 16.4 gera por padrão o loader `@tailwindcss/turbopack` em `turbopack.rules`; ele foi trocado pelo PostCSS, abrindo mão de um dev ligeiramente mais rápido. O `@source not "../../.work"` em `globals.css` impede o Tailwind de varrer arquivos de documentação fora de `src/`.

**`src/` organizado por domínio.** `app/` para rotas, `components/<domínio>/` e `lib/<domínio>/`, com o teste ao lado do arquivo. Fica claro quem é dono de cada arquivo; o custo é um nível a mais de pasta.

**Vitest 5 com Testing Library (jsdom).** `npm run test` é execução única, sem watch. Funções puras e componentes client ou shared têm teste unitário. Server Components assíncronos não são testáveis no Vitest, então são verificados no browser.

**`scripts/check-tokens.mjs`.** Script próprio, sem dependências, que confere `tokens.json` contra o `@theme` e falha se houver cor literal em `src/`. É um guardrail barato e visível para o Design System; custa manter o script. A alternativa era stylelint ou nenhuma verificação.

**`.gitattributes` com `* text=auto eol=lf`.** Evita diff de CRLF entre Windows e Linux. O `AGENTS.md` que o `next dev` gera é commitado para a árvore não ficar suja a cada execução.

**Fontes self-hosted via `next/font/local`.** Plus Jakarta Sans (variável, títulos) e IBM Plex Sans 400, 500 e 600 (corpo) estão em `src/app/fonts/` com as licenças OFL-1.1. Os arquivos foram extraídos uma vez dos pacotes `@fontsource-variable/plus-jakarta-sans` e `@fontsource/ibm-plex-sans` com `npm pack`, e os pacotes não são dependência. O `next/font/google` foi descartado porque baixa CSS e fontes durante o build, o que quebraria o build sem rede. O custo são cerca de 100 KB de binários no repositório.

**Tokens no `@theme` com nomes 1:1.** `--color-text-muted` vira a classe `text-text-muted`, e `--color-*: initial` remove a paleta padrão do Tailwind. O nome fica redundante de ler, mas é rastreável até `tokens.json` e o `check-tokens` não precisa de mapeamento.

**Dois contrastes herdados do protótipo foram mantidos.** `text-subtle` (3,1:1) só aparece em texto decorativo com `aria-hidden`, e o placeholder de input usa `text-muted`. `border-strong` (1,7:1) continua na borda do botão outline: o texto (15,8:1) e o anel de foco (10,4:1) identificam o controle. Subir a borda para 3:1 mudaria a aparência do botão.

**`Button` e `ButtonLink` em `components/ui/`.** Variantes `primary` (`bg-accent text-on-accent`) e `outline` (`border-border-strong bg-bg-base text-text-primary`), ambas com 44 px de altura mínima. As classes de botão ficam em um lugar só, o que evita que botão e link divirjam.

## Melhorias futuras

A definir ao final da implementação.
