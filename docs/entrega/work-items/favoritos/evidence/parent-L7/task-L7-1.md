# Evidência — Task #L7-1 — Inspeção da base

**Parent item pai:** #L7 — Favoritos: persistência no client e página/aba que liste os favoritos
**Data:** 2026-10-07

## Resumo
Inspeção do que `setup-catalogo`, `tmdb-client` e `listagem-filmes` deixaram: `MovieCardData` já com `posterPath` e `releaseDate`, o comentário da posição do `FavoriteButton` no `MovieCard`, a assinatura de `useSyncExternalStore` com `getServerSnapshot` e as regras `react-hooks/*` do React Compiler. Nenhum arquivo foi criado ou alterado.

## Tasks de execução realizadas
- [x] 1.1 Inspecionar o que os três changes anteriores deixaram e a assinatura de `useSyncExternalStore`

## Arquivos impactados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| (leitura) | — | Sem alteração de arquivos; divergências entre `design.md` e o instalado anotadas para as tasks seguintes |

## Decisões técnicas
Ajustes do apply registrados no `design.md`: o componente da página mantém o nome `FavoritosPage` do esqueleto, e o `div` do pôster do `MovieCard` real não tem `overflow-hidden` (cortaria o anel de foco), então o botão entra como irmão do `<Link>` nesse `div`.

## Resultado
Pré-requisitos confirmados: `src/lib/favorites/` e `src/components/favorites/` não existiam; `server-only` só em `src/lib/tmdb/client.ts`; `npm run check` verde antes de começar.

## Observações
Nenhuma.
