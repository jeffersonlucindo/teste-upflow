import { describe, expect, it } from "vitest";

import type { Genre } from "@/lib/tmdb/types";

import { resolveGenreId } from "./resolveGenre";

const GENRES: Genre[] = [
  { id: 28, name: "Ação" },
  { id: 16, name: "Animação" },
];

describe("resolveGenreId", () => {
  it("mantém o id presente na lista", () => {
    expect(resolveGenreId(16, GENRES)).toBe(16);
  });

  it("devolve null para id ausente da lista", () => {
    expect(resolveGenreId(999999, GENRES)).toBeNull();
  });

  it("devolve null quando não há gênero", () => {
    expect(resolveGenreId(null, GENRES)).toBeNull();
  });

  it("devolve null com a lista vazia", () => {
    expect(resolveGenreId(28, [])).toBeNull();
  });
});
