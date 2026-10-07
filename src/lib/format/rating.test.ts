import { describe, expect, it } from "vitest";

import { formatRating, formatVoteAverage } from "./rating";

describe("formatVoteAverage", () => {
  it("usa vírgula e uma casa decimal", () => {
    expect(formatVoteAverage(7.2)).toBe("7,2");
  });

  it("mantém a casa decimal em número inteiro", () => {
    expect(formatVoteAverage(8)).toBe("8,0");
  });

  it("arredonda para uma casa", () => {
    expect(formatVoteAverage(7.26)).toBe("7,3");
  });
});

describe("formatRating", () => {
  it("prefixa a nota", () => {
    expect(formatRating(7.2, 10)).toBe("Nota 7,2");
  });

  it("diz que não há nota quando não há votos", () => {
    expect(formatRating(0, 0)).toBe("Sem nota");
    expect(formatRating(9.5, 0)).toBe("Sem nota");
  });
});
