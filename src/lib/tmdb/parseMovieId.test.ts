import { describe, expect, it } from "vitest";

import { parseMovieId } from "./parseMovieId";

describe("parseMovieId", () => {
  it.each([
    ["603", 603],
    ["1", 1],
  ])("aceita o inteiro positivo %j", (raw, id) => {
    expect(parseMovieId(raw)).toBe(id);
  });

  it.each([
    "abc",
    "0",
    "-1",
    "1.5",
    "0603",
    "603abc",
    " 603",
    "",
    undefined,
    "99999999999999999",
  ])("rejeita %j", (raw) => {
    expect(parseMovieId(raw)).toBeNull();
  });
});
