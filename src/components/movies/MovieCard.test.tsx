import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MovieSummary } from "@/lib/tmdb/types";

import { MovieCard, toMovieCardData, type MovieCardData } from "./MovieCard";

const MATRIX: MovieSummary = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  voteAverage: 7.2,
  voteCount: 10,
  releaseDate: "1999-03-30",
};

function cardData(overrides: Partial<MovieSummary> = {}): MovieCardData {
  return toMovieCardData({ ...MATRIX, ...overrides });
}

describe("toMovieCardData", () => {
  it("copia os campos de origem e deriva a URL do pôster e o ano", () => {
    expect(toMovieCardData(MATRIX)).toEqual({
      id: 603,
      title: "Matrix",
      posterPath: "/matrix.jpg",
      releaseDate: "1999-03-30",
      posterUrl: "https://image.tmdb.org/t/p/w342/matrix.jpg",
      releaseYear: 1999,
      voteAverage: 7.2,
      voteCount: 10,
    });
  });

  it("mantém null quando não há pôster nem data", () => {
    expect(toMovieCardData({ ...MATRIX, posterPath: null, releaseDate: null })).toMatchObject({
      posterPath: null,
      releaseDate: null,
      posterUrl: null,
      releaseYear: null,
    });
  });
});

describe("MovieCard", () => {
  it.each([
    [{}, "Nota 7,2 · 1999"],
    [{ releaseDate: null }, "Nota 7,2"],
    [{ voteCount: 0, releaseDate: "2024-05-01" }, "Sem nota · 2024"],
    [{ voteCount: 0, releaseDate: null }, "Sem nota"],
  ] satisfies [Partial<MovieSummary>, string][])("mostra a meta %#", (overrides, meta) => {
    render(<MovieCard movie={cardData(overrides)} />);

    expect(screen.getByText(meta)).toBeInTheDocument();
  });

  it("renderiza o pôster w342 com sizes e sem texto alternativo", () => {
    const { container } = render(<MovieCard movie={cardData()} />);
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("sizes", "(max-width: 639px) 50vw, 220px");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
      "https://image.tmdb.org/t/p/w342/matrix.jpg",
    );
  });

  it("mostra o placeholder oculto quando não há pôster", () => {
    const { container } = render(<MovieCard movie={cardData({ posterPath: null })} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("Pôster")).toHaveAttribute("aria-hidden", "true");
  });

  it("aponta os dois links para o detalhe", () => {
    render(<MovieCard movie={cardData()} />);

    expect(screen.getByRole("link", { name: "Ver detalhes de Matrix" })).toHaveAttribute(
      "href",
      "/movie/603",
    );
    expect(screen.getByRole("link", { name: "Matrix" })).toHaveAttribute("href", "/movie/603");
  });

  it("carrega o estado da listagem em from", () => {
    render(<MovieCard movie={cardData()} from="q=matrix&page=2" />);

    expect(screen.getByRole("link", { name: "Ver detalhes de Matrix" })).toHaveAttribute(
      "href",
      "/movie/603?from=q%3Dmatrix%26page%3D2",
    );
  });
});
