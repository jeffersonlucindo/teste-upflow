import { describe, expect, it } from "vitest";

import { POSTER_SIZE, PROFILE_SIZE, TMDB_IMAGE_BASE, isTmdbImagePath, posterUrl, profileUrl } from "./images";

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

describe("isTmdbImagePath", () => {
  it.each(["/matrix-poster.jpg", "/ator-1.jpg", "/AbC_123-x.png", "/a.webp", "/a.jpeg", "/a.svg"])(
    "aceita %s",
    (path) => {
      expect(isTmdbImagePath(path)).toBe(true);
    },
  );

  it.each([
    "/../../etc.jpg",
    "abc.jpg",
    "/abc.jpg?x=1",
    "//abc.jpg",
    "/a/b.jpg",
    "https://evil.example/abc.jpg",
    "/abc.gif",
    "/abc",
    "/.jpg",
    "",
  ])("recusa %s", (path) => {
    expect(isTmdbImagePath(path)).toBe(false);
  });
});

describe("caminho fora do formato", () => {
  it("posterUrl e profileUrl devolvem null", () => {
    expect(posterUrl("/../../etc.jpg", POSTER_SIZE.card)).toBeNull();
    expect(posterUrl("https://evil.example/abc.jpg", POSTER_SIZE.detail)).toBeNull();
    expect(profileUrl("/abc.jpg?x=1")).toBeNull();
  });
});
