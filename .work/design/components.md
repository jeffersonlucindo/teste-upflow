# Inventário de componentes — Catálogo.

> Capturado no `/devflow:explore` de 2026-10-06. Lido pelos hooks `design_context` e `examples`
> enquanto o repo não tem código. Cada linha é um contrato: o `design.md` do change que cria o
> componente cita a linha; mudanças de contrato atualizam este arquivo.
> Tokens: nomes de `tokens/tokens.json` usados como classes 1:1 (`bg-surface-200`, `text-text-muted`).
> Medidas vêm de `README.md > Tipografia e medidas`. Decisões citadas como D<n> estão em `decisoes.md`.

## Fronteira server × client

```
                    servidor                               │   client
src/app/layout.tsx ── Header ──────────────────────────────┼── NavLink (usePathname)
                                                           ├── FavoritesBadge (store)
src/app/page.tsx ── h1 "Filmes populares"                  │
             ── <Suspense fallback=FilterBar vazio> ───────┼── FilterBar (useSearchParams, useRouter, useTransition)
             │     └─ FilterBarLoader: await connection(); getGenres()
             ── <Suspense fallback=MovieGridSkeleton>      │
                   └─ MovieResults: await searchParams; fetchListing()
                        ├─ MovieGrid ── MovieCard ─────────┼── FavoriteButton icon (store)
                        ├─ Pagination (links)              │
                        └─ EmptyState (busca vazia)        │
src/app/error.tsx ─────────────────────────────────────────┼── ErrorState (reset)
src/app/movie/[id]/page.tsx ── BackLink                    │
             ── <Suspense fallback=DetailSkeleton>         │
                   └─ MovieDetails: await params; getMovieDetail()
                        ├─ MovieHeader ── RatingChip ──────┼── FavoriteButton full (store)
                        ├─ Overview · CastList/CastCard · TrailerEmbed
src/app/movie/[id]/not-found.tsx ── EmptyState             │
src/app/favoritos/page.tsx ── h1 + subtítulo ──────────────┼── FavoritesList (store) ── MovieGrid/MovieCard
```

Tipos: **RSC** = Server Component; **client** = `"use client"`; **shared** = sem diretiva e sem
import `server-only`, renderizável dos dois lados (MovieCard é shared porque FavoritesList, client,
o renderiza).

## Inventário

| Componente | Pasta | Tela(s) | Tipo | Tokens e medidas | Props essenciais | Estados |
|---|---|---|---|---|---|---|
| `Header` | `components/layout/` | todas | RSC | `border-b border-border-subtle`; logo `font-display text-xl font-extrabold text-text-primary`, ponto `text-accent`; nav `max-w-[1200px] px-4 sm:px-10 py-4 flex flex-wrap justify-between gap-4` | — | — |
| `NavLink` | `components/layout/` | todas | client | ativo `bg-surface-100 text-text-primary font-semibold`; inativo `text-text-muted hover:text-text-primary font-medium`; `min-h-11 px-4 rounded-lg inline-flex items-center gap-2` | `href`, `children` | ativo (`aria-current="page"`; `/` só exato, `/favoritos` por prefixo), inativo, foco |
| `FavoritesBadge` | `components/favorites/` | todas (dentro do NavLink Favoritos) | client | `bg-border-subtle text-text-primary text-xs font-semibold rounded-full min-w-6 h-5 px-2 inline-flex items-center justify-center` | — | oculto até montar e quando o total é 0 (D31); `aria-label="N favoritos"` |
| `FilterBar` | `components/movies/` | listagem | client | label `text-[13px] font-semibold text-text-muted flex flex-col gap-2`; input/select `h-11 px-4 rounded-lg border border-border-subtle bg-surface-100 text-text-primary`; placeholder `text-text-muted`; chevron `text-text-muted`; busca `flex-1 basis-80`, selects `min-w-0 flex-1 basis-36 sm:flex-initial sm:basis-52` (lado a lado a 390 px); `form role="search" flex flex-wrap gap-4 items-end` | `genres: Genre[]`, `disabled?` (fallback) | idle; pending (`aria-busy` e opacidade no grid; os selects mostram a escolha antes de a URL mudar, D26); modo busca (gênero e ordenação `disabled`, descritos por um hint único via `aria-describedby`, D14); fallback (select de gênero desabilitado "Carregando gêneros…") |
| `ListingTransition` / `ListingTransitionRegion` | `components/movies/` | listagem | client | região `flex flex-col gap-6 transition-opacity`, `opacity-60` quando pendente | `children` | provider com `useTransition()` compartilhado pelo `FilterBar` (`useListingTransition()`, com transição local fora do provider); região: idle; pendente (`aria-busy="true"` e opacidade; o `role="status"` "Atualizando resultados…" é irmão da região, fora da subárvore ocupada) (D26) |
| `FilterBarLoader` | `components/movies/` | listagem | RSC async | — | — | faz `await connection()` e `getGenres()`, renderiza `FilterBar` (D22) |
| `MovieResults` | `components/movies/` | listagem | RSC async | — | `searchParams: PageProps<"/">["searchParams"]` | faz `await searchParams` e `await connection()` antes de `fetchListing`; resultados (contagem em modo busca); vazio (busca → "Limpar busca"; filtros → "Limpar filtros"); página acima do total → "Esta página não existe" (D17); erro propaga ao `error.tsx` |
| `MovieGrid` | `components/movies/` | listagem, favoritos | shared | `movieGridClassName` (exportado; o skeleton reutiliza): `grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-5 gap-y-6` (D35) | `movies: MovieCardData[]`, `from?: string` | `ul role="list"` com um `li` por card |
| `MovieGridSkeleton` | `components/movies/` | listagem | shared | card `rounded-xl bg-surface-200 aspect-[2/3] animate-pulse`; linhas `h-4 bg-surface-100 rounded` | `count = 8` | `aria-hidden` nos cards; container `role="status"` com texto sr-only "Carregando filmes" |
| `MovieCard` | `components/movies/` | listagem, favoritos | shared | `flex flex-col gap-3`; pôster `relative aspect-[2/3] rounded-xl bg-surface-200` (sem `overflow-hidden`, que cortaria o anel de foco do link; a imagem leva `rounded-xl object-cover`); placeholder `text-text-subtle text-xs` com `aria-hidden`; título `text-[15px] font-semibold text-text-primary hover:text-accent`; meta `text-[13px] text-text-muted` | `movie: MovieCardData` = `{ id, title, posterPath: string \| null, releaseDate: string \| null, posterUrl: string \| null, releaseYear: number \| null, voteAverage, voteCount }` (oito campos: `posterPath`/`releaseDate` de origem, `posterUrl`/`releaseYear` derivados), `from?`; `toMovieCardData(movie: MovieSummary)` monta o objeto | com pôster (`next/image` com `sizes`), sem pôster (placeholder), sem data (só "Nota 7,2"), sem votos ("Sem nota"); link no pôster com `aria-label="Ver detalhes de {title}"`; posição do `FavoriteButton` marcada por comentário (irmão do `<Link>` do pôster) |
| `FavoriteButton` | `components/favorites/` | card (`icon`), detalhe (`full`) | client | `icon`: `w-10 h-10 rounded-full bg-bg-overlay text-text-primary absolute top-2.5 right-2.5`, ativo coração `fill-accent text-accent`; `full`: `bg-accent text-on-accent min-h-11 px-[18px] rounded-lg font-semibold inline-flex items-center gap-2` | `movie: FavoriteSnapshot`, `variant: 'icon' \| 'full'` | off (`aria-pressed=false`, label "Adicionar aos favoritos"); on (`aria-pressed=true`, "Remover dos favoritos"); antes de hidratar renderiza off (D31); irmão do `<Link>`, nunca dentro |
| `Pagination` | `components/movies/` | listagem | RSC | Anterior `outline`; "Página X de N" `text-text-muted`; Próxima `primary`; `nav aria-label="Paginação" flex flex-wrap items-center justify-center gap-4` | `page`, `totalPages`, `hrefFor(page)` | primeira (Anterior `aria-disabled`), última (Próxima `aria-disabled`), página única (ambos desabilitados) (D28) |
| `EmptyState` | `components/ui/` | listagem, favoritos, erro, not-found | shared | `rounded-xl border border-border-subtle bg-surface-100 py-16 px-6 text-center flex flex-col items-center gap-4`; ícone 32 px `text-text-muted`; título `text-base font-semibold text-text-primary`; descrição `text-text-muted`; ação `primary` | `icon: EmptyStateIcon` (`"search" \| "heart" \| "alert" \| "film"`), `title`, `description?`, `action?: { href \| onClick, label }` | busca vazia ("Nenhum filme encontrado para “x”", ação "Limpar busca"); favoritos vazio (textos do protótipo, ação "Explorar filmes"); erro ("Não foi possível carregar os filmes", ação "Tentar novamente"); not-found ("Filme não encontrado", ação "Voltar à listagem") (D36) |
| `ErrorState` | `components/ui/` (renderizado por `src/app/error.tsx` e `src/app/movie/[id]/error.tsx`) | listagem, detalhe | client | usa `EmptyState` (`icon="alert"`) | `error`, `reset`, `title?` (padrão "Não foi possível carregar os filmes") | genérico; "Tentar novamente" faz `router.refresh()` + `reset()` em transição; em dev mostra `error.message` (em produção o Next redige mensagens do servidor, D21) |
| `Button` / `ButtonLink` | `components/ui/` | todas | shared | `primary`: `bg-accent text-on-accent`; `outline`: `border border-border-strong bg-bg-base text-text-primary`; ambos `min-h-11 px-5 rounded-lg font-semibold inline-flex items-center gap-2` (D40) | `variant`, `href` (link) | foco `outline-focus-ring`; `aria-disabled` no link desabilitado |
| `BackLink` | `components/movie-detail/` | detalhe | RSC | `text-text-muted font-medium min-h-11 inline-flex items-center gap-2 hover:text-accent self-start`; ícone seta 16 px | `href` (de `?from=` validado, senão `/`, D39) | — |
| `MovieDetails` | `components/movie-detail/` | detalhe | RSC async | — | `params: Promise<{ id: string }>`, `from?` | valida id (inteiro positivo) antes do fetch; `not_found` → `notFound()` |
| `MovieHeader` | `components/movie-detail/` | detalhe | RSC | layout `flex flex-wrap gap-10 items-start`; pôster `basis-60 max-w-[300px] aspect-[2/3] rounded-xl bg-surface-200`; coluna `basis-[560px] flex-1 min-w-0 flex flex-col gap-7`; h1 `font-display text-[44px] leading-[1.1] font-extrabold tracking-tight`; meta `text-text-muted`; linha de chips `flex flex-wrap gap-3 mt-3` | `movie: MovieDetail`, `from?` | sem pôster; sem duração ou sem gêneros (omite o pedaço e o separador "·") |
| `RatingChip` | `components/movie-detail/` | detalhe | RSC | `min-h-11 px-4 rounded-lg bg-surface-200 text-text-primary font-semibold inline-flex items-center` | `voteAverage`, `voteCount` | "Nota 7,2" (vírgula pt-BR, 1 casa); `voteCount === 0` → "Sem nota" |
| `Overview` | `components/movie-detail/` | detalhe | RSC | h2 `font-display text-xl font-bold`; p `leading-relaxed text-text-secondary max-w-[720px]`; aviso `text-[13px] text-text-muted` | `overview: { text, language } \| null` | pt-BR; outro idioma (aviso "Sinopse disponível apenas em inglês"); ausente ("Sinopse não disponível.") (D18) |
| `CastList` / `CastCard` | `components/movie-detail/` | detalhe | RSC | grid `grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4`; foto `aspect-square rounded-xl bg-surface-200`; nome `font-semibold text-text-primary`; personagem `text-[13px] text-text-muted`; `figure`/`figcaption` | `cast: CastMember[]` (até 8, ordenados por `order`) | sem foto (placeholder); lista vazia (seção inteira omitida) |
| `TrailerEmbed` | `components/movie-detail/` | detalhe | RSC | `aspect-video max-w-[800px] rounded-xl border border-border-subtle bg-surface-100 overflow-hidden`; iframe `youtube-nocookie.com/embed/{key}` com `title="Trailer: {name}"`, `loading="lazy"`, `allowFullScreen` (D38) | `trailer: { key, name } \| null` | `null` → seção omitida |
| `DetailSkeleton` | `components/movie-detail/` | detalhe | shared | mesmas superfícies do skeleton do grid | — | fallback do Suspense do detalhe |
| `FavoritesList` | `components/favorites/` | favoritos | client | — | — | não montado (nada); vazio (`EmptyState`); com itens (`savedAt` desc, D30) via `MovieGrid` |

## Páginas e arquivos de rota

| Arquivo | Tipo | Conteúdo |
|---|---|---|
| `src/app/layout.tsx` | RSC | `html lang="pt-BR"`, fontes (`--font-heading`, `--font-body`, D11), `Header`, `main max-w-[1200px] mx-auto w-full px-4 sm:px-10 pt-8 pb-14`; `metadata` com template "%s · Catálogo." |
| `src/app/page.tsx` | RSC | h1 + dois Suspense (D37); `metadata.title` "Filmes populares" |
| `src/app/error.tsx` | client | `ErrorState` |
| `src/app/movie/[id]/page.tsx` | RSC | `BackLink` + Suspense com `MovieDetails`; `generateMetadata` com título do filme (mesmo fetch cacheado, sem chamada extra) |
| `src/app/movie/[id]/not-found.tsx` | RSC | `EmptyState` "Filme não encontrado" |
| `src/app/movie/[id]/error.tsx` | client | `ErrorState` |
| `src/app/favoritos/page.tsx` | RSC estático | h1 "Meus favoritos", p "Os filmes salvos ficam neste navegador." `text-text-muted`, `FavoritesList` |

## Estados que o protótipo não desenha (decididos)

| Estado | Decisão |
|---|---|
| Loading da listagem | `MovieGridSkeleton` (8 cards) como fallback do Suspense; FilterBar com select de gênero desabilitado enquanto gêneros carregam |
| Loading do detalhe | `DetailSkeleton` como fallback |
| Busca sem resultado | `EmptyState` com o termo e ação "Limpar busca" |
| Favoritos vazio | Já desenhado em `Favoritos.dc.html` (`sc-if noFavs`): é a base visual do `EmptyState` |
| Erro de API | `error.tsx` por segmento, `EmptyState` com "Tentar novamente"; header continua visível |
| Token ausente | Em dev, mensagem nomeando `TMDB_API_READ_TOKEN`; em produção, texto genérico (D21) |
| Filme sem pôster / ator sem foto | placeholder `bg-surface-200` com rótulo `text-text-subtle aria-hidden` |
| Filme sem data / sem votos | meta omite o ano / chip "Sem nota" |
| Id inválido ou inexistente | `not-found.tsx` |
| Mobile 390 px | grid 2 colunas (`minmax(160px)`), header e FilterBar quebram linha, detalhe empilha, elenco 2 colunas, paginação quebra linha; gutter 16 px (D35) |

## Acessibilidade (baseline herdada do protótipo e decidida)

- Elementos nativos: `<a>` para navegação, `<button>` para ação, `<label>` envolvendo input e select, `<nav aria-label>`, `<form role="search">`.
- `aria-pressed` no `FavoriteButton`; `aria-current="page"` no `NavLink`; `aria-label` em botão só com ícone; `aria-busy` no grid durante transição; `role="status"` nos skeletons.
- Foco visível global: `outline-2 outline-offset-2 outline-focus-ring`.
- Controles com `min-h-11` (44 px); botão circular de favorito com 40 px, como no protótipo.
- Contrastes herdados mantidos conforme D34.
