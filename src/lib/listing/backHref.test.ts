import { describe, expect, it } from "vitest";

import { backHref } from "./backHref";

describe("backHref", () => {
  it.each([undefined, ""])("sem from (%j) volta para a raiz", (from) => {
    expect(backHref(from)).toBe("/");
  });

  it.each([
    ["q=matrix&page=2", "/?q=matrix&page=2"],
    ["sort=rating", "/?sort=rating"],
    ["genre=28&sort=rating", "/?genre=28&sort=rating"],
    ["q=the+matrix", "/?q=the+matrix"],
  ])("preserva o estado válido de %j", (from, href) => {
    expect(backHref(from)).toBe(href);
  });

  it("normaliza como a própria listagem", () => {
    expect(backHref("page=999")).toBe("/?page=500");
    expect(backHref("q=m&genre=28&sort=rating")).toBe("/?q=m");
  });

  it.each(["sort=foo&genre=abc", "http://evil.example/x", "//evil.example", "lixo"])(
    "descarta o from inválido %j",
    (from) => {
      expect(backHref(from)).toBe("/");
    },
  );

  it("usa o primeiro valor quando a chave se repete na URL", () => {
    expect(backHref(["page=2", "page=3"])).toBe("/?page=2");
  });
});
