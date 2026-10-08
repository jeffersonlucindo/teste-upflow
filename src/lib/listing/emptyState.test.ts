import { describe, expect, it } from "vitest";

import { plural, resolveEmptyState } from "./emptyState";

const BASE = { query: null, genreId: null, sort: "popularity", page: 1 } as const;

describe("plural", () => {
  it("usa o singular só para 1 e formata o número em pt-BR", () => {
    expect(plural(1, "página", "páginas")).toBe("1 página");
    expect(plural(0, "página", "páginas")).toBe("0 páginas");
    expect(plural(1500, "resultado", "resultados")).toBe("1.500 resultados");
  });
});

describe("resolveEmptyState", () => {
  it("não há estado vazio quando existem filmes na página", () => {
    expect(resolveEmptyState(BASE, { totalPages: 3, movieCount: 20 })).toBeNull();
  });

  it("busca sem resultado oferece Limpar busca", () => {
    expect(resolveEmptyState({ ...BASE, query: "zzzz" }, { totalPages: 1, movieCount: 0 })).toEqual({
      title: "Nenhum filme encontrado para “zzzz”",
      description: "Confira a grafia ou tente outro título.",
      action: { label: "Limpar busca", href: "/" },
    });
  });

  it("filtros sem resultado oferecem Limpar filtros", () => {
    expect(
      resolveEmptyState({ ...BASE, genreId: 28, sort: "rating" }, { totalPages: 1, movieCount: 0 }),
    ).toEqual({
      title: "Nenhum filme encontrado",
      description: "Nenhum filme corresponde a esses filtros.",
      action: { label: "Limpar filtros", href: "/" },
    });
  });

  it("página além do total aponta para a última, preservando os filtros", () => {
    expect(
      resolveEmptyState({ ...BASE, genreId: 28, sort: "rating", page: 9 }, { totalPages: 3, movieCount: 0 }),
    ).toEqual({
      title: "Esta página não existe",
      description: "A lista tem 3 páginas.",
      action: { label: "Ir para a última página", href: "/?genre=28&sort=rating&page=3" },
    });
  });

  it("página além do total vale mesmo com lista vazia de filmes ou singular de página", () => {
    expect(
      resolveEmptyState({ ...BASE, query: "matrix", page: 2 }, { totalPages: 1, movieCount: 0 }),
    ).toMatchObject({
      description: "A lista tem 1 página.",
      action: { href: "/?q=matrix" },
    });
  });
});
