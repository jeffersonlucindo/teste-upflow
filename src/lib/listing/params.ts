import { clampPage, DEFAULT_SORT, LISTING_SORTS } from "@/lib/tmdb/params";
import type { ListingQuery, ListingSort } from "@/lib/tmdb/types";

/** `useSearchParams()` no client ou o objeto `searchParams` que o Next entrega à página. */
export type ListingSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export const DEFAULT_LISTING_QUERY: ListingQuery = {
  query: null,
  genreId: null,
  sort: DEFAULT_SORT,
  page: 1,
};

/** Primeira ocorrência da chave: o Next entrega array quando ela se repete na URL. */
function first(input: ListingSearchParams, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;

  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseGenreId(value: string | undefined): number | null {
  const id = Number.parseInt(value ?? "", 10);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function parseSort(value: string | undefined): ListingSort {
  return LISTING_SORTS.find((sort) => sort === value) ?? DEFAULT_SORT;
}

/** URL → estado da listagem. Valor inválido vira o padrão; nunca lança. */
export function parseListingParams(input: ListingSearchParams): ListingQuery {
  const query = first(input, "q")?.trim() || null;
  const page = clampPage(Number.parseInt(first(input, "page") ?? "", 10));

  // A busca por título não aceita gênero nem ordenação: com `q`, os dois voltam ao padrão.
  if (query !== null) return { ...DEFAULT_LISTING_QUERY, query, page };

  return {
    query,
    genreId: parseGenreId(first(input, "genre")),
    sort: parseSort(first(input, "sort")),
    page,
  };
}

/** Estado da listagem → query string sem "?", com os padrões omitidos e as chaves em ordem fixa. */
export function buildListingSearch(query: ListingQuery): string {
  const search = new URLSearchParams();
  const title = query.query?.trim() || null;
  const page = clampPage(query.page);

  if (title !== null) {
    search.set("q", title);
  } else {
    if (query.genreId !== null) search.set("genre", String(query.genreId));
    if (query.sort !== DEFAULT_SORT) search.set("sort", query.sort);
  }
  if (page > 1) search.set("page", String(page));

  return search.toString();
}

export function buildListingHref(query: ListingQuery): string {
  const search = buildListingSearch(query);
  return search ? `/?${search}` : "/";
}
