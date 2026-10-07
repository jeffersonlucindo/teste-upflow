import type { ListingQuery, ListingSort } from "./types";

/** Fonte única dos valores de `sort`: parser da URL e opções do FilterBar leem daqui. */
export const LISTING_SORTS = [
  "popularity",
  "rating",
  "release",
] as const satisfies readonly ListingSort[];

export const DEFAULT_SORT: ListingSort = "popularity";

export const SORT_BY: Record<ListingSort, string> = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  release: "primary_release_date.desc",
};

/** Só com sort=rating: sem o corte, o topo é filme com um voto e nota 10. */
export const RATING_MIN_VOTE_COUNT = 200;

/** Limite da API: acima da página 500 o TMDB responde com erro. */
export const MAX_PAGE = 500;

export function clampPage(page: number, max: number = MAX_PAGE): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.trunc(page), max);
}

/** Data em UTC, "YYYY-MM-DD". Chamada na requisição, nunca no escopo do módulo. */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** "Populares" é o discover ordenado por popularidade; os filtros compõem no mesmo endpoint. */
export function buildDiscoverParams(query: ListingQuery, today: string): Record<string, string> {
  const params: Record<string, string> = {
    include_adult: "false",
    sort_by: SORT_BY[query.sort],
    page: String(clampPage(query.page)),
  };

  if (query.genreId !== null) params.with_genres = String(query.genreId);
  if (query.sort === "rating") params["vote_count.gte"] = String(RATING_MIN_VOTE_COUNT);
  // Sem o corte, a ordenação por data começa por filmes anunciados para anos à frente.
  if (query.sort === "release") params["primary_release_date.lte"] = today;

  return params;
}

/** /search/movie não aceita gênero nem ordenação: só o título e a página seguem. */
export function buildSearchParams(query: ListingQuery): Record<string, string> {
  return {
    include_adult: "false",
    query: (query.query ?? "").trim(),
    page: String(clampPage(query.page)),
  };
}

export function buildListingRequest(
  query: ListingQuery,
  today: string,
): { path: "/discover/movie" | "/search/movie"; params: Record<string, string> } {
  if ((query.query ?? "").trim() !== "") {
    return { path: "/search/movie", params: buildSearchParams(query) };
  }

  return { path: "/discover/movie", params: buildDiscoverParams(query, today) };
}
