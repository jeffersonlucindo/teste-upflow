import { describe, expect, it } from "vitest";

import { formatMovieMeta, type MovieMetaInput } from "./movieMeta";

const MATRIX: MovieMetaInput = {
  releaseDate: "1999-03-30",
  runtime: 136,
  genres: [
    { id: 28, name: "Ação" },
    { id: 878, name: "Ficção científica" },
  ],
};

describe("formatMovieMeta", () => {
  it("junta ano, duração e gêneros", () => {
    expect(formatMovieMeta(MATRIX)).toBe("1999 · 2h 16min · Ação, Ficção científica");
  });

  it("omite a duração ausente com o separador", () => {
    expect(formatMovieMeta({ ...MATRIX, runtime: null })).toBe("1999 · Ação, Ficção científica");
  });

  it("fica só com a duração quando não há data nem gêneros", () => {
    expect(formatMovieMeta({ releaseDate: null, runtime: 136, genres: [] })).toBe("2h 16min");
  });

  it("não põe vírgula com um gênero só", () => {
    expect(formatMovieMeta({ ...MATRIX, genres: [{ id: 28, name: "Ação" }] })).toBe(
      "1999 · 2h 16min · Ação",
    );
  });

  it("devolve null quando não há nada para mostrar", () => {
    expect(formatMovieMeta({ releaseDate: null, runtime: null, genres: [] })).toBeNull();
  });
});
