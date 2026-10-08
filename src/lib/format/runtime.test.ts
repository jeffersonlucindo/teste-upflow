import { describe, expect, it } from "vitest";

import { formatRuntime } from "./runtime";

describe("formatRuntime", () => {
  it.each([
    [136, "2h 16min"],
    [45, "45min"],
    [120, "2h"],
    [60, "1h"],
    [59, "59min"],
  ])("formata %d minutos", (minutes, text) => {
    expect(formatRuntime(minutes)).toBe(text);
  });

  it("descarta a fração de minuto", () => {
    expect(formatRuntime(90.6)).toBe("1h 30min");
    expect(formatRuntime(0.9)).toBeNull();
  });

  it.each([0, null, undefined, Number.NaN, -5, Number.POSITIVE_INFINITY])(
    "devolve null para %j",
    (minutes) => {
      expect(formatRuntime(minutes)).toBeNull();
    },
  );
});
