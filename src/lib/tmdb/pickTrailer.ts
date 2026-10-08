import type { MovieTrailer, TmdbVideoDto } from "./types";

/** Idioma pedido (0) → inglês (1) → outros (2). Os vídeos trazem só a subtag primária. */
function languageRank(video: TmdbVideoDto, requestedLanguage: string): number {
  if (video.iso_639_1 === requestedLanguage.split("-")[0].toLowerCase()) return 0;
  return video.iso_639_1 === "en" ? 1 : 2;
}

/**
 * Um único Trailer do YouTube: oficial primeiro, depois idioma pedido > en > outros, depois o
 * mais recente.
 * Teaser, Clip e outros sites ficam de fora; sem trailer devolve null e a seção é omitida.
 */
export function pickTrailer(
  videos: readonly TmdbVideoDto[] | undefined,
  requestedLanguage: string,
): MovieTrailer | null {
  const [best] = (videos ?? [])
    .filter((video) => video.site === "YouTube" && video.type === "Trailer" && video.key)
    .sort(
      (a, b) =>
        Number(b.official) - Number(a.official) ||
        languageRank(a, requestedLanguage) - languageRank(b, requestedLanguage) ||
        // Datas em ISO 8601 comparam como texto; ausente conta como a mais antiga.
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    );

  return best ? { key: best.key, name: best.name } : null;
}
