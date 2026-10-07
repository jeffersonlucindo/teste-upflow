import { connection } from "next/server";

import { EmptyState } from "@/components/ui/EmptyState";
import { buildListingHref, buildListingSearch, parseListingParams } from "@/lib/listing/params";
import { fetchListing } from "@/lib/tmdb/client";

import { toMovieCardData } from "./MovieCard";
import { MovieGrid } from "./MovieGrid";
import { Pagination } from "./Pagination";

export interface MovieResultsProps {
  searchParams: PageProps<"/">["searchParams"];
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? singular : pluralForm}`;
}

/** Único ponto da listagem que lê a URL no servidor: o await mantém a busca fora do shell. */
export async function MovieResults({ searchParams }: MovieResultsProps) {
  const params = parseListingParams(await searchParams);
  // A URL sozinha não basta: ela também é resolvida ao prerenderizar o destino de um link, e a
  // ordenação por data lê o relógio. A listagem só é montada com uma requisição de verdade.
  await connection();
  const result = await fetchListing(params);

  // Sem redirect: uma resposta só, e a URL digitada continua visível para ser corrigida.
  if (params.page > result.totalPages) {
    return (
      <EmptyState
        icon="search"
        title="Esta página não existe"
        description={`A lista tem ${plural(result.totalPages, "página", "páginas")}.`}
        action={{
          label: "Ir para a última página",
          href: buildListingHref({ ...params, page: result.totalPages }),
        }}
      />
    );
  }

  if (result.movies.length === 0) {
    return params.query !== null ? (
      <EmptyState
        icon="search"
        title={`Nenhum filme encontrado para “${params.query}”`}
        description="Confira a grafia ou tente outro título."
        action={{ label: "Limpar busca", href: "/" }}
      />
    ) : (
      <EmptyState
        icon="search"
        title="Nenhum filme encontrado"
        description="Nenhum filme corresponde a esses filtros."
        action={{ label: "Limpar filtros", href: "/" }}
      />
    );
  }

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
