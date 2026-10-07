import { describe, expect, it } from "vitest";

import type { ListingQuery } from "@/lib/tmdb/types";

import {
  DEFAULT_LISTING_QUERY,
  buildListingHref,
  buildListingSearch,
  parseListingParams,
  type ListingSearchParams,
} from "./params";

function listingQuery(overrides: Partial<ListingQuery> = {}): ListingQuery {
  return { ...DEFAULT_LISTING_QUERY, ...overrides };
}

function parseUrl(search: string): ListingQuery {
  return parseListingParams(new URLSearchParams(search));
}

describe("parseListingParams", () => {
  it("devolve os padrões para a URL vazia", () => {
    const defaults = { query: null, genreId: null, sort: "popularity", page: 1 };

    expect(parseListingParams({})).toEqual(defaults);
    expect(parseUrl("")).toEqual(defaults);
  });

  it("lê cada chave válida", () => {
    expect(parseUrl("q=matrix")).toEqual(listingQuery({ query: "matrix" }));
    expect(parseUrl("genre=28")).toEqual(listingQuery({ genreId: 28 }));
    expect(parseUrl("sort=rating")).toEqual(listingQuery({ sort: "rating" }));
    expect(parseUrl("sort=release")).toEqual(listingQuery({ sort: "release" }));
    expect(parseUrl("page=3")).toEqual(listingQuery({ page: 3 }));
  });

  it("combina gênero, ordenação e página", () => {
    expect(parseUrl("genre=28&sort=rating&page=3")).toEqual({
      query: null,
      genreId: 28,
      sort: "rating",
      page: 3,
    });
  });

  it.each(["abc", "0", "-1", ""])("descarta genre=%s", (genre) => {
    expect(parseListingParams({ genre }).genreId).toBeNull();
  });

  it("descarta ordenação desconhecida", () => {
    expect(parseUrl("sort=foo").sort).toBe("popularity");
  });

  it.each([
    ["abc", 1],
    ["0", 1],
    ["-4", 1],
    ["501", 500],
    ["2.7", 2],
  ])("normaliza page=%s para %i", (page, expected) => {
    expect(parseListingParams({ page }).page).toBe(expected);
  });

  it("usa a primeira ocorrência quando o Next entrega um array", () => {
    expect(parseListingParams({ page: ["3", "4"] }).page).toBe(3);
    expect(parseUrl("page=3&page=4").page).toBe(3);
  });

  it("ignora gênero e ordenação quando há busca", () => {
    expect(parseUrl("q=m&genre=28&sort=rating")).toEqual(listingQuery({ query: "m" }));
  });

  it("mantém a página da busca", () => {
    expect(parseUrl("q=matrix&page=2")).toEqual(listingQuery({ query: "matrix", page: 2 }));
  });

  it("apara a busca e trata só espaços como sem busca", () => {
    expect(parseListingParams({ q: "  matrix " }).query).toBe("matrix");
    expect(parseListingParams({ q: "   ", genre: "28" })).toEqual(listingQuery({ genreId: 28 }));
  });
});

describe("buildListingHref", () => {
  it("devolve / para o estado padrão", () => {
    expect(buildListingHref(DEFAULT_LISTING_QUERY)).toBe("/");
    expect(buildListingSearch(DEFAULT_LISTING_QUERY)).toBe("");
  });

  it("omite página 1 e ordenação por popularidade", () => {
    expect(buildListingHref(listingQuery({ genreId: 28 }))).toBe("/?genre=28");
    expect(buildListingHref(listingQuery({ sort: "rating" }))).toBe("/?sort=rating");
  });

  it("escreve as chaves na ordem genre, sort, page", () => {
    expect(buildListingHref({ query: null, genreId: 28, sort: "rating", page: 3 })).toBe(
      "/?genre=28&sort=rating&page=3",
    );
  });

  it("escreve q antes de page", () => {
    expect(buildListingHref(listingQuery({ query: "matrix", page: 2 }))).toBe("/?q=matrix&page=2");
  });

  it("codifica o espaço da busca como +", () => {
    expect(buildListingSearch(listingQuery({ query: "the matrix" }))).toBe("q=the+matrix");
  });

  it("remove gênero e ordenação quando há busca", () => {
    expect(buildListingHref({ query: "m", genreId: 28, sort: "rating", page: 1 })).toBe("/?q=m");
  });

  it("trata busca só com espaços como sem busca", () => {
    expect(buildListingHref(listingQuery({ query: "   ", genreId: 28 }))).toBe("/?genre=28");
  });

  it("limita a página a 500", () => {
    expect(buildListingHref(listingQuery({ page: 700 }))).toBe("/?page=500");
  });
});

describe("round-trip", () => {
  const inputs: ListingSearchParams[] = [
    { q: "the matrix", genre: "28", sort: "rating", page: "2" },
    { genre: "28", sort: "release", page: ["3", "9"] },
    { q: "  ", genre: "abc", sort: "foo", page: "700" },
  ];

  it.each(inputs)("parse(build(parse(x))) é igual a parse(x) (%#)", (input) => {
    const parsed = parseListingParams(input);

    expect(parseListingParams(new URLSearchParams(buildListingSearch(parsed)))).toEqual(parsed);
  });

  it("preserva o espaço da busca", () => {
    const search = buildListingSearch(listingQuery({ query: "the matrix" }));

    expect(parseUrl(search).query).toBe("the matrix");
  });
});
