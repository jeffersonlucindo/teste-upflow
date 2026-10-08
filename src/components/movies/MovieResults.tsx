import { connection } from "next/server";

import { EmptyState } from "@/components/ui/EmptyState";
import { buildListingHref, buildListingSearch, parseListingParams } from "@/lib/listing/params";
import { plural, resolveEmptyState } from "@/lib/listing/emptyState";
import { resolveGenreId } from "@/lib/listing/resolveGenre";
import { fetchListing, getGenres } from "@/lib/tmdb/client";

import { toMovieCardData } from "./MovieCard";
import { MovieGrid } from "./MovieGrid";
import { Pagination } from "./Pagination";

export interface MovieResultsProps {
  searchParams: PageProps<"/">["searchParams"];
}

/** Único ponto da listagem que lê a URL no servidor: o await mantém a busca fora do shell. */
export async function MovieResults({ searchParams }: MovieResultsProps) {
  const parsed = parseListingParams(await searchParams);
  // A URL sozinha não basta: ela também é resolvida ao prerenderizar o destino de um link, e a
  // ordenação por data lê o relógio. A listagem só é montada com uma requisição de verdade.
  await connection();
  // Gênero que o TMDB não lista vira "Todos", como `sort` inválido vira o padrão.
  const genreId =
    parsed.genreId === null ? null : resolveGenreId(parsed.genreId, await getGenres());
  const params = { ...parsed, genreId };
  const result = await fetchListing(params);

  // Sem redirect: uma resposta só, e a URL digitada continua visível para ser corrigida.
  const empty = resolveEmptyState(params, {
    totalPages: result.totalPages,
    movieCount: result.movies.length,
  });
  if (empty) return <EmptyState icon="search" {...empty} />;

  return (
    <>
      {params.query !== null ? (
        <p className="text-[13px] text-text-muted">
          {plural(result.totalResults, "resultado", "resultados")} para “{params.query}”
        </p>
      ) : null}
      <MovieGrid
        movies={result.movies.map(toMovieCardData)}
        from={buildListingSearch(params) || undefined}
      />
      <Pagination
        page={params.page}
        totalPages={result.totalPages}
        hrefFor={(page) => buildListingHref({ ...params, page })}
      />
    </>
  );
}
