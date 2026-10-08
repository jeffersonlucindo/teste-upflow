## Requisitos ADICIONADOS

### Requisito: Build sem segredos e sem rede
O sistema DEVE gerar o build de produção sem `.env.local`, sem token do TMDB e sem acesso à rede.
Placement: `next.config.ts`, `src/app/fonts.ts`, `src/app/**` (nenhum `fetch` nem `next/font/google`).

#### Cenário: Build sem variáveis de ambiente
- QUANDO `npm run build` roda sem `.env.local` presente
- ENTÃO o build termina com sucesso
- E nenhuma URL de `fonts.googleapis.com` ou `api.themoviedb.org` aparece em `.next/server/app`

#### Cenário: Build com Cache Components ligado
- QUANDO `npm run build` roda com `CATALOGO_CACHE_COMPONENTS=1`
- ENTÃO o build termina com sucesso
- E as rotas `/` e `/favoritos` são reportadas como estáticas no resumo do build

### Requisito: Toggle de Cache Components por variável de ambiente
O sistema DEVE ler `CATALOGO_CACHE_COMPONENTS` em `next.config.ts` e ligar `cacheComponents` e
`partialPrefetching` juntos apenas quando o valor for `1` ou `true` (sem distinguir maiúsculas).
Placement: `next.config.ts`; documentação em `.env.example` e `README.md > Flags`.

#### Cenário: Variável ausente
- QUANDO `CATALOGO_CACHE_COMPONENTS` não está definida
- ENTÃO `next.config.ts` não declara `cacheComponents` nem `partialPrefetching`
- E `next dev` e `next build` não emitem warning sobre `partialPrefetching`

#### Cenário: Variável ligada
- QUANDO `CATALOGO_CACHE_COMPONENTS=1` (ou `true`, `TRUE`)
- ENTÃO `cacheComponents: true` e `partialPrefetching: true` estão no config
- E o `.env.local` é suficiente para ligar (a variável é lida antes da avaliação do config)

#### Cenário: Valor inválido
- QUANDO `CATALOGO_CACHE_COMPONENTS=yes` ou `=0`
- ENTÃO o comportamento é o de variável ausente

### Requisito: Tokens de cor como única fonte de cores
O sistema DEVE declarar no `@theme` de `src/app/globals.css` exatamente os tokens de
`.work/design/tokens/tokens.json`, com `--color-*: initial`, e DEVE impedir cor literal em `src/`
por meio de `scripts/check-tokens.mjs` (script `tokens:check`).

#### Cenário: Tokens em sincronia
- QUANDO `npm run tokens:check` roda com `globals.css` contendo os 14 tokens com os valores de `tokens.json` (aliases `{x}` como `var(--color-x)`)
- ENTÃO o script imprime sucesso com a contagem de tokens e sai com código 0

#### Cenário: Token ausente ou divergente
- QUANDO um token de `tokens.json` não existe no `@theme` ou tem valor diferente
- ENTÃO o script lista `globals.css: --color-<name> …` e sai com código 1

#### Cenário: Cor literal no código
- QUANDO um arquivo `.ts`, `.tsx` ou `.css` em `src/` (exceto `globals.css`) contém `#hex`, `rgb(`, `hsl(` ou classe arbitrária de cor (`bg-[#…]`)
- ENTÃO o script imprime `caminho:linha: cor literal — use um token` e sai com código 1

#### Cenário: Script portátil
- QUANDO o script roda no Windows (Git Bash ou PowerShell) ou no Linux
- ENTÃO resolve a raiz do projeto corretamente (via `fileURLToPath`) e lê `.work/design/tokens/tokens.json`

### Requisito: Navegação principal acessível
O sistema DEVE renderizar em todas as páginas um header com a marca "Catálogo." (ponto em `accent`)
e os links "Explorar" (`/`) e "Favoritos" (`/favoritos`), marcando o link da rota atual.
Placement: `src/components/layout/Header.tsx` (Server Component), `src/components/layout/NavLink.tsx` (client).

#### Cenário: Link da rota atual
- QUANDO o usuário está em `/favoritos`
- ENTÃO o link "Favoritos" tem `aria-current="page"` e fundo `surface-100`
- E o link "Explorar" não tem `aria-current`

#### Cenário: Home só por igualdade exata
- QUANDO o usuário está em `/favoritos`
- ENTÃO o link "Explorar" (`href="/"`) não é considerado ativo

#### Cenário: Foco visível
- QUANDO o usuário navega por teclado até um link ou botão
- ENTÃO o elemento mostra anel de foco de 2 px em `focus-ring` com offset de 2 px

#### Cenário: Largura de 390 px
- QUANDO a viewport tem 390 px de largura
- ENTÃO o header quebra linha sem overflow horizontal e os links mantêm altura mínima de 44 px

### Requisito: Fontes self-hosted
O sistema DEVE servir Plus Jakarta Sans (display) e IBM Plex Sans (corpo) a partir de arquivos em
`src/app/fonts/` via `next/font/local`, expostos como `font-display` e `font-sans`.
Placement: `src/app/fonts.ts`, `src/app/fonts/*.woff2`, `src/app/fonts/LICENSE-*.txt`, `@theme inline` em `globals.css`.

#### Cenário: Sem requisição externa
- QUANDO a página `/` é carregada em produção
- ENTÃO nenhuma requisição é feita a `fonts.googleapis.com` ou `fonts.gstatic.com`
- E o `h1` usa Plus Jakarta Sans e o corpo usa IBM Plex Sans

#### Cenário: Licença presente
- QUANDO o repositório é inspecionado
- ENTÃO `src/app/fonts/` contém a licença OFL de cada família ao lado dos `.woff2`

### Requisito: Esqueleto das páginas
O sistema DEVE responder `/` com o título "Filmes populares" e `/favoritos` com "Meus favoritos" e o
subtítulo "Os filmes salvos ficam neste navegador.", sem buscar dados nem ler `searchParams`.
Placement: `src/app/page.tsx`, `src/app/favoritos/page.tsx`.

#### Cenário: Títulos da aba
- QUANDO o usuário abre `/` ou `/favoritos`
- ENTÃO o `<title>` é "Filmes populares · Catálogo." ou "Meus favoritos · Catálogo."

#### Cenário: Páginas estáticas
- QUANDO `npm run build` roda (em qualquer modo de `cacheComponents`)
- ENTÃO `/` e `/favoritos` são prerenderizadas como estáticas
