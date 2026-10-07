import { describe, expect, it } from "vitest";

import discoverPage from "./fixtures/discover-page.json";
import genres from "./fixtures/genres.json";
import movie603 from "./fixtures/movie-603.json";
import {
  MAIN_CAST_LIMIT,
  toCastMember,
  toGenres,
  toListingResult,
  toMovieDetail,
  toMovieSummary,
} from "./mappers";
import type { MovieDetail, MovieSummary, TmdbMovieDetailDto, TmdbMovieListItemDto } from "./types";

const [matrix, semPoster, semVotos]: TmdbMovieListItemDto[] = discoverPage.results;
const detailDto: TmdbMovieDetailDto = movie603;

describe("toGenres", () => {
  it("converte a lista de gêneros", () => {
    expect(toGenres(genres)).toEqual([
      { id: 28, name: "Ação" },
      { id: 12, name: "Aventura" },
      { id: 878, name: "Ficção científica" },
    ]);
  });
});

describe("toMovieSummary", () => {
  it("copia os campos do item completo e descarta o resto", () => {
    expect(toMovieSummary(matrix)).toEqual({
      id: 603,
      title: "Matrix",
      posterPath: "/matrix-poster.jpg",
      voteAverage: 8.2,
      voteCount: 25000,
      releaseDate: "1999-03-30",
    });
  });

  it("devolve null para pôster ausente e data vazia", () => {
    expect(toMovieSummary(semPoster)).toMatchObject({
      id: 900001,
      posterPath: null,
      releaseDate: null,
      voteAverage: 6.4,
    });
  });

  it("devolve null para data ausente", () => {
    const withoutDate: TmdbMovieListItemDto = { ...matrix, release_date: undefined };

    expect(toMovieSummary(withoutDate).releaseDate).toBeNull();
  });

  it("mantém zero votos e nota zero", () => {
    expect(toMovieSummary(semVotos)).toMatchObject({ voteCount: 0, voteAverage: 0 });
  });
});

describe("toListingResult", () => {
  it("mapeia os filmes e copia página e total de resultados", () => {
    const result = toListingResult(discoverPage);

    expect(result.movies).toHaveLength(3);
    expect(result.movies.map((movie) => movie.id)).toEqual([603, 900001, 900002]);
    expect(result.page).toBe(1);
    expect(result.totalResults).toBe(1024680);
  });

  it("limita o total de páginas ao máximo da API", () => {
    expect(toListingResult(discoverPage).totalPages).toBe(500);
  });

  it("devolve uma página quando a API informa zero", () => {
    expect(
      toListingResult({ page: 1, results: [], total_pages: 0, total_results: 0 }),
    ).toEqual({ movies: [], page: 1, totalPages: 1, totalResults: 0 });
  });

  it("mantém totais abaixo do limite", () => {
    expect(toListingResult({ ...discoverPage, total_pages: 37 }).totalPages).toBe(37);
  });
});

describe("toCastMember", () => {
  it("converte para camelCase e mantém foto ausente como null", () => {
    expect(
      toCastMember({ id: 1008, name: "Ator Oito", character: "Mouse", profile_path: null, order: 7 }),
    ).toEqual({ id: 1008, name: "Ator Oito", character: "Mouse", profilePath: null, order: 7 });
  });
});

describe("toMovieDetail", () => {
  it("mapeia os campos do detalhe", () => {
    expect(toMovieDetail(detailDto, "pt-BR")).toMatchObject({
      id: 603,
      title: "Matrix",
      posterPath: "/matrix-poster.jpg",
      releaseDate: "1999-03-30",
      runtime: 136,
      genres: [
        { id: 28, name: "Ação" },
        { id: 878, name: "Ficção científica" },
      ],
      voteAverage: 8.2,
      voteCount: 25000,
    });
  });

  it("corta o elenco em oito pessoas na ordem de order", () => {
    const { cast } = toMovieDetail(detailDto, "pt-BR");

    expect(cast).toHaveLength(MAIN_CAST_LIMIT);
    expect(cast.map((member) => member.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(cast[0]).toEqual({
      id: 1001,
      name: "Ator Um",
      character: "Neo",
      profilePath: "/ator-1.jpg",
      order: 0,
    });
  });

  it("não reordena o elenco do DTO", () => {
    const orders = movie603.credits.cast.map((member) => member.order);

    toMovieDetail(detailDto, "pt-BR");

    expect(movie603.credits.cast.map((member) => member.order)).toEqual(orders);
  });

  it("preenche sinopse e trailer pelas seleções", () => {
    const detail = toMovieDetail(detailDto, "pt-BR");

    expect(detail.overview).toEqual({ text: movie603.overview, language: "pt" });
    expect(detail.trailer).toEqual({ key: "trailerEN2014", name: "Official Trailer" });
  });

  it("devolve sinopse e trailer nulos e elenco vazio quando os anexos faltam", () => {
    const bare: TmdbMovieDetailDto = {
      ...detailDto,
      overview: "",
      credits: undefined,
      videos: undefined,
      translations: undefined,
    };

    expect(toMovieDetail(bare, "pt-BR")).toMatchObject({
      overview: null,
      cast: [],
      trailer: null,
    });
  });

  it.each([0, null])("devolve runtime null para %s", (runtime) => {
    expect(toMovieDetail({ ...detailDto, runtime }, "pt-BR").runtime).toBeNull();
  });

  it("devolve data null quando vem vazia", () => {
    expect(toMovieDetail({ ...detailDto, release_date: "" }, "pt-BR").releaseDate).toBeNull();
  });

  it("compartilha com o item de lista os campos do snapshot de favoritos", () => {
    type Snapshot = Pick<
      MovieSummary,
      "id" | "title" | "posterPath" | "voteAverage" | "voteCount" | "releaseDate"
    >;
    const fromSummary: Snapshot = toMovieSummary(matrix);
    const fromDetail: Snapshot = toMovieDetail(detailDto, "pt-BR") satisfies MovieDetail;
    const fields = ["id", "title", "posterPath", "voteAverage", "voteCount", "releaseDate"] as const;

    for (const field of fields) {
      expect(fromDetail[field]).toEqual(fromSummary[field]);
    }
  });
});
