# Evidência — Task #L2-4 — UI compartilhada

**Parent item pai:** #L2 — Listagem de filmes populares com paginação
**Data:** 2026-10-07

## Resumo
`EmptyState` (ícones `search`, `heart`, `alert`, `film`; ação por `href` ou `onClick`), `MovieCard` com `toMovieCardData`, `MovieGrid` (`ul role="list"`) e `MovieGridSkeleton` (8 cards, `role="status"`). Commits `baa00fc` e `da43c35`.

## Tasks de execução realizadas
- [x] 4.1 `src/components/ui/EmptyState.tsx` + `EmptyState.test.tsx`
- [x] 4.2 `src/components/movies/MovieCard.tsx` + `MovieCard.test.tsx`
- [x] 4.3 `src/components/movies/MovieGrid.tsx` e `MovieGridSkeleton.tsx`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/ui/EmptyState.tsx` | criado | Caixa com ícone SVG de 32 px (`currentColor`), título, descrição e ação opcional |
| `src/components/ui/EmptyState.test.tsx` | criado | 5 testes |
| `src/components/movies/MovieCard.tsx` | criado | `article` com pôster `w342` (`next/image`, `fill`), dois links para `/movie/{id}` (com `from` quando houver) e meta "Nota X,X · AAAA" |
| `src/components/movies/MovieCard.test.tsx` | criado | 10 testes |
| `src/components/movies/MovieGrid.tsx` | criado | Lista de cards, 2 colunas no celular e `auto-fill` de 200 px de `sm` em diante |
| `src/components/movies/MovieGridSkeleton.tsx` | criado | Oito cards `animate-pulse` com "Carregando filmes" para leitor de tela |

## Decisões técnicas
Decisões 9 (card com `MovieCardData` de oito campos, sem importar o cliente TMDB), 10 (grid e skeleton) e 12 (`EmptyState`). O `MovieCard` reserva a posição do botão de favoritar como irmão do `<Link>`; o botão entra no change `favoritos`. Ajuste do apply: o pôster não usa `overflow-hidden`, para o anel de foco do link não ser cortado.

## Resultado
Componentes sem diretiva `"use client"` e só com tokens de cor. A exibição em tela está na evidência da task L2-8.

## Observações
Aviso de desenvolvimento não tratado: o `next/image` sugere `loading="eager"` no primeiro pôster (LCP); `priority` ficou nos não-objetivos.
