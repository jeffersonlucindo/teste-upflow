import { describe, expect, it } from "vitest";

import movie603 from "./fixtures/movie-603.json";
import { pickTrailer as pick } from "./pickTrailer";
import type { TmdbVideoDto } from "./types";

// Os casos existentes valem para o idioma padrão do projeto.
const pickTrailer = (videos: Parameters<typeof pick>[0]) => pick(videos, "pt-BR");

const fixtureVideos: TmdbVideoDto[] = movie603.videos.results;

function video(overrides: Partial<TmdbVideoDto> = {}): TmdbVideoDto {
  return {
    id: "vid",
    key: "chave",
    name: "Trailer",
    site: "YouTube",
    type: "Trailer",
    official: true,
    iso_639_1: "en",
    iso_3166_1: "US",
    published_at: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("pickTrailer", () => {
  it("devolve null sem vídeos", () => {
    expect(pickTrailer(undefined)).toBeNull();
    expect(pickTrailer([])).toBeNull();
  });

  it("ignora Teaser, Clip e Featurette", () => {
    expect(
      pickTrailer([
        video({ type: "Teaser" }),
        video({ type: "Clip" }),
        video({ type: "Featurette" }),
      ]),
    ).toBeNull();
  });

  it("ignora vídeos fora do YouTube e sem chave", () => {
    expect(pickTrailer([video({ site: "Vimeo" }), video({ key: "" })])).toBeNull();
  });

  it("escolhe o oficial em inglês antes do não oficial em português", () => {
    expect(
      pickTrailer([
        video({ key: "pt-fan", official: false, iso_639_1: "pt" }),
        video({ key: "en-oficial", official: true, iso_639_1: "en" }),
      ])?.key,
    ).toBe("en-oficial");
  });

  it("entre dois oficiais escolhe o português", () => {
    expect(
      pickTrailer([
        video({ key: "en", iso_639_1: "en", published_at: "2024-01-01T00:00:00.000Z" }),
        video({ key: "pt", iso_639_1: "pt", published_at: "2012-01-01T00:00:00.000Z" }),
      ])?.key,
    ).toBe("pt");
  });

  it("escolhe inglês antes de outros idiomas", () => {
    expect(
      pickTrailer([video({ key: "fr", iso_639_1: "fr" }), video({ key: "en", iso_639_1: "en" })])
        ?.key,
    ).toBe("en");
  });

  it("entre dois oficiais em inglês escolhe o publicado por último", () => {
    expect(
      pickTrailer([
        video({ key: "antigo", published_at: "2010-05-01T12:00:00.000Z" }),
        video({ key: "recente", published_at: "2014-03-01T12:00:00.000Z" }),
      ])?.key,
    ).toBe("recente");
  });

  it("devolve exatamente key e name", () => {
    expect(pickTrailer([video({ key: "abc", name: "Official Trailer" })])).toEqual({
      key: "abc",
      name: "Official Trailer",
    });
  });

  it("escolhe o trailer oficial em inglês da fixture", () => {
    expect(pickTrailer(fixtureVideos)).toEqual({ key: "trailerEN2014", name: "Official Trailer" });
  });

  it("não reordena a lista recebida", () => {
    const keys = fixtureVideos.map((item) => item.key);

    pickTrailer(fixtureVideos);

    expect(fixtureVideos.map((item) => item.key)).toEqual(keys);
  });

  it("com es-ES pedido, o trailer em espanhol vem antes do inglês e do português", () => {
    const videos = [
      video({ key: "en", iso_639_1: "en" }),
      video({ key: "pt", iso_639_1: "pt" }),
      video({ key: "es", iso_639_1: "es", published_at: "2010-01-01T00:00:00.000Z" }),
    ];

    expect(pick(videos, "es-ES")?.key).toBe("es");
  });

  it("com es-ES pedido e sem espanhol, o inglês vem antes dos outros", () => {
    const videos = [video({ key: "pt", iso_639_1: "pt" }), video({ key: "en", iso_639_1: "en" })];

    expect(pick(videos, "es-ES")?.key).toBe("en");
  });

  it("com en-US pedido, o inglês é o idioma pedido", () => {
    const videos = [video({ key: "pt", iso_639_1: "pt" }), video({ key: "en", iso_639_1: "en" })];

    expect(pick(videos, "en-US")?.key).toBe("en");
  });
});
