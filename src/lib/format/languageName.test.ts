import { describe, expect, it } from "vitest";

import { languageName } from "./languageName";

describe("languageName", () => {
  it.each([
    ["en", "inglês"],
    ["ja", "japonês"],
    ["pt", "português"],
  ])("traduz %j para o português", (code, name) => {
    expect(languageName(code)).toBe(name);
  });

  it.each(["xx", "", "não é código"])("devolve null para %j sem lançar", (code) => {
    expect(languageName(code)).toBeNull();
  });
});
