import type { MovieOverview, TmdbMovieDetailDto, TmdbTranslationDto } from "./types";

const primaryLanguage = (language: string) => language.split("-")[0].toLowerCase();

function overviewOf(translation: TmdbTranslationDto): string {
  return (translation.data.overview ?? "").trim();
}

/**
 * Sinopse na ordem: idioma pedido → inglês (en-US antes de outro en) → idioma original →
 * primeira tradução com texto → nenhuma. `language` sai em ISO 639-1 e `fallback` diz se o texto
 * saiu do idioma pedido, para o aviso do Overview.
 */
export function pickOverview(
  detail: Pick<TmdbMovieDetailDto, "overview" | "original_language" | "translations">,
  requestedLanguage: string,
): MovieOverview | null {
  const requested = (detail.overview ?? "").trim();
  if (requested !== "") {
    return { text: requested, language: primaryLanguage(requestedLanguage), fallback: false };
  }

  const withText = (detail.translations?.translations ?? []).filter(
    (translation) => overviewOf(translation) !== "",
  );
  const english = withText.filter((translation) => translation.iso_639_1 === "en");

  const chosen =
    english.find((translation) => translation.iso_3166_1 === "US") ??
    english[0] ??
    withText.find((translation) => translation.iso_639_1 === detail.original_language) ??
    withText[0];

  return chosen
    ? {
        text: overviewOf(chosen),
        language: chosen.iso_639_1,
        fallback: chosen.iso_639_1 !== primaryLanguage(requestedLanguage),
      }
    : null;
}
