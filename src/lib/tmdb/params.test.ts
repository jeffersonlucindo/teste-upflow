import { describe, expect, it } from "vitest";

import {
  DEFAULT_SORT,
  LISTING_SORTS,
  MAX_PAGE,
  RATING_MIN_VOTE_COUNT,
  buildDiscoverParams,
  buildListingRequest,
  buildSearchParams,
  clampPage,
  todayUtc,
} from "./params";
import type { ListingQuery } from "./types";

const TODAY = "2026-10-07";

function listingQuery(overrides: Partial<ListingQuery> = {}): ListingQuery {
  return { query: null, genreId: null, sort: "popularity", page: 1, ...overrides };
}

describe("constantes da listagem", () => {
  it("expõe as três ordenações com popularidade como padrão", () => {
    expect(LISTING_SORTS).toEqual(["popularity", "rating", "release"]);
    expect(DEFAULT_SORT).toBe("popularity");
    expect(RATING_MIN_VOTE_COUNT).toBe(200);
    expect(MAX_PAGE).toBe(500);
  });
});

describe("buildDiscoverParams", () => {
  it("monta os populares só com include_adult, sort_by e page", () => {
    const params = buildDiscoverParams(listingQuery(), TODAY);

    expect(params).toEqual({ include_adult: "false", sort_by: "popularity.desc", page: "1" });
    expect(Object.keys(params)).toEqual(["include_adult", "sort_by", "page"]);
  });

  it("acrescenta with_genres quando há gênero", () => {
    expect(buildDiscoverParams(listingQuery({ genreId: 28 }), TODAY)).toMatchObject({
      with_genres: "28",
    });
  });

  it("aplica o corte de votos somente na ordenação por nota", () => {
    expect(buildDiscoverParams(listingQuery({ sort: "rating" }), TODAY)).toEqual({
      include_adult: "false",
      sort_by: "vote_average.desc",
      page: "1",
      "vote_count.gte": "200",
    });
    expect(Object.keys(buildDiscoverParams(listingQuery(), TODAY))).not.toContain(
      "vote_count.gte",
    );
    expect(Object.keys(buildDiscoverParams(listingQuery({ sort: "release" }), TODAY))).not.toContain(
      "vote_count.gte",
    );
  });

  it("aplica o corte de data somente na ordenação por lançamento", () => {
    expect(buildDiscoverParams(listingQuery({ sort: "release" }), TODAY)).toEqual({
      include_adult: "false",
      sort_by: "primary_release_date.desc",
      page: "1",
      "primary_release_date.lte": TODAY,
    });
    expect(Object.keys(buildDiscoverParams(listingQuery(), TODAY))).not.toContain(
      "primary_release_date.lte",
    );
    expect(Object.keys(buildDiscoverParams(listingQuery({ sort: "rating" }), TODAY))).not.toContain(
      "primary_release_date.lte",
    );
  });

  it("limita a página enviada", () => {
    expect(buildDiscoverParams(listingQuery({ page: 9999 }), TODAY).page).toBe("500");
  });

  it("não inclui language", () => {
    const params = buildDiscoverParams(listingQuery({ genreId: 28, sort: "release" }), TODAY);

    expect(Object.keys(params)).not.toContain("language");
  });
});

describe("buildSearchParams", () => {
  it("envia só include_adult, query aparada e page", () => {
    const params = buildSearchParams(listingQuery({ query: "  matrix ", page: 3 }));

    expect(params).toEqual({ include_adult: "false", query: "matrix", page: "3" });
    expect(Object.keys(params)).toEqual(["include_adult", "query", "page"]);
  });
});

describe("buildListingRequest", () => {
  it("usa o discover quando não há busca", () => {
    expect(buildListingRequest(listingQuery(), TODAY)).toEqual({
      path: "/discover/movie",
      params: { include_adult: "false", sort_by: "popularity.desc", page: "1" },
    });
  });

  it("usa o discover quando a busca só tem espaços", () => {
    expect(buildListingRequest(listingQuery({ query: "   " }), TODAY).path).toBe(
      "/discover/movie",
    );
  });

  it("usa a busca e descarta gênero e ordenação quando há título", () => {
    const request = buildListingRequest(
      listingQuery({ query: "matrix", genreId: 28, sort: "rating", page: 2 }),
      TODAY,
    );

    expect(request).toEqual({
      path: "/search/movie",
      params: { include_adult: "false", query: "matrix", page: "2" },
    });
  });

  it("não envia o corte de data na busca mesmo com ordenação por lançamento", () => {
    const { params } = buildListingRequest(
      listingQuery({ query: "matrix", sort: "release" }),
      TODAY,
    );

    expect(Object.keys(params)).toEqual(["include_adult", "query", "page"]);
  });
});

describe("clampPage", () => {
  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "devolve 1 para %s",
    (page) => {
      expect(clampPage(page)).toBe(1);
    },
  );

  it("limita ao máximo da API", () => {
    expect(clampPage(501)).toBe(500);
    expect(clampPage(500)).toBe(500);
  });

  it("trunca decimais", () => {
    expect(clampPage(2.7)).toBe(2);
  });

  it("aceita um máximo menor", () => {
    expect(clampPage(12, 5)).toBe(5);
  });
});

describe("todayUtc", () => {
  it("devolve a data em UTC, não a do fuso local", () => {
    expect(todayUtc(new Date("2026-10-07T23:30:00-03:00"))).toBe("2026-10-08");
  });

  it("sem argumento devolve uma data no formato YYYY-MM-DD", () => {
    expect(todayUtc()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
