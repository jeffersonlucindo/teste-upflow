import { describe, expect, it } from "vitest";

import movie603 from "./fixtures/movie-603.json";
import { pickOverview } from "./pickOverview";
import type { TmdbTranslationDto } from "./types";

const translations: TmdbTranslationDto[] = movie603.translations.translations;
const byLanguage = (language: string) =>
  translations.filter((translation) => translation.iso_639_1 === language);

const [ptBR] = byLanguage("pt");
const [enUS] = byLanguage("en");
const [ja] = byLanguage("ja");
const emptied = (translation: TmdbTranslationDto): TmdbTranslationDto => ({
  ...translation,
  data: { ...translation.data, overview: "" },
});

describe("pickOverview", () => {
  it("usa a sinopse do idioma pedido quando ela existe", () => {
    expect(pickOverview(movie603, "pt-BR")).toEqual({
      text: movie603.overview,
      language: "pt",
    });
  });

  it("deriva o idioma da subtag primária do idioma pedido", () => {
    expect(pickOverview(movie603, "es-MX")?.language).toBe("es");
    expect(pickOverview(movie603, "pt")?.language).toBe("pt");
  });

  it("cai na tradução en-US quando a sinopse pedida vem vazia", () => {
    expect(pickOverview({ ...movie603, overview: "" }, "pt-BR")).toEqual({
      text: enUS.data.overview,
      language: "en",
    });
  });

  it("prefere en-US a outra tradução em inglês", () => {
    const enGB: TmdbTranslationDto = {
      iso_639_1: "en",
      iso_3166_1: "GB",
      data: { overview: "A British overview." },
    };

    expect(
      pickOverview(
        { ...movie603, overview: "", translations: { translations: [enGB, ja, enUS] } },
        "pt-BR",
      ),
    ).toEqual({ text: enUS.data.overview, language: "en" });
    expect(
      pickOverview(
        { ...movie603, overview: "", translations: { translations: [ja, enGB] } },
        "pt-BR",
      ),
    ).toEqual({ text: "A British overview.", language: "en" });
  });

  it("sem inglês usa a tradução do idioma original", () => {
    const korean: TmdbTranslationDto = {
      iso_639_1: "ko",
      iso_3166_1: "KR",
      data: { overview: "해커가 현실이 가상임을 알게 된다." },
    };

    expect(
      pickOverview(
        {
          overview: "",
          original_language: "ja",
          translations: { translations: [korean, emptied(enUS), ja] },
        },
        "pt-BR",
      ),
    ).toEqual({ text: ja.data.overview, language: "ja" });
  });

  it("sem inglês e sem o idioma original usa a primeira tradução com texto", () => {
    expect(
      pickOverview(
        {
          overview: null,
          original_language: "fr",
          translations: { translations: [emptied(ptBR), emptied(enUS), ja] },
        },
        "pt-BR",
      ),
    ).toEqual({ text: ja.data.overview, language: "ja" });
  });

  it("devolve null quando nenhuma tradução tem texto", () => {
    expect(
      pickOverview(
        {
          overview: "",
          original_language: "en",
          translations: {
            translations: [
              emptied(ptBR),
              { iso_639_1: "en", iso_3166_1: "US", data: { overview: "   " } },
              { iso_639_1: "ja", iso_3166_1: "JP", data: {} },
            ],
          },
        },
        "pt-BR",
      ),
    ).toBeNull();
  });

  it("devolve null sem translations e com sinopse só de espaços", () => {
    expect(
      pickOverview({ overview: "  ", original_language: "en", translations: undefined }, "pt-BR"),
    ).toBeNull();
  });

  it("apara o texto escolhido", () => {
    expect(pickOverview({ ...movie603, overview: "  Texto.  " }, "pt-BR")?.text).toBe("Texto.");
  });
});
