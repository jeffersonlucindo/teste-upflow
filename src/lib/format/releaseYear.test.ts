import { describe, expect, it } from "vitest";

import { releaseYear } from "./releaseYear";

describe("releaseYear", () => {
  it("extrai o ano de uma data completa", () => {
    expect(releaseYear("1999-03-30")).toBe(1999);
  });

  it("aceita só o ano", () => {
    expect(releaseYear("2024")).toBe(2024);
  });

  it.each(["", null, undefined, "abc"])("devolve null para %j", (value) => {
    expect(releaseYear(value)).toBeNull();
  });
});
