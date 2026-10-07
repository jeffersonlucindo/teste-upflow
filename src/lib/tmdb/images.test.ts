import { describe, expect, it } from "vitest";

import { POSTER_SIZE, PROFILE_SIZE, TMDB_IMAGE_BASE, posterUrl, profileUrl } from "./images";

describe("posterUrl", () => {
  it("monta a URL do card em w342", () => {
    expect(posterUrl("/abc.jpg", POSTER_SIZE.card)).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg",
    );
  });

  it("monta a URL do detalhe em w500", () => {
    expect(posterUrl("/abc.jpg", POSTER_SIZE.detail)).toBe(`${TMDB_IMAGE_BASE}/w500/abc.jpg`);
  });

  it.each([null, undefined, ""])("devolve null sem caminho (%s)", (path) => {
    expect(posterUrl(path, POSTER_SIZE.card)).toBeNull();
  });
});

describe("profileUrl", () => {
  it("usa w185 por padrão", () => {
    expect(PROFILE_SIZE).toBe("w185");
    expect(profileUrl("/p.jpg")).toBe("https://image.tmdb.org/t/p/w185/p.jpg");
  });

  it("aceita outro tamanho", () => {
    expect(profileUrl("/p.jpg", "h632")).toBe("https://image.tmdb.org/t/p/h632/p.jpg");
  });

  it.each([null, undefined, ""])("devolve null sem caminho (%s)", (path) => {
    expect(profileUrl(path)).toBeNull();
  });
});
