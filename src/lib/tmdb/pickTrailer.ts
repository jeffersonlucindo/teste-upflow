import type { MovieTrailer, TmdbVideoDto } from "./types";

const LANGUAGE_RANK: Record<string, number> = { pt: 0, en: 1 };
const OTHER_LANGUAGE_RANK = 2;

const languageRank = (video: TmdbVideoDto) =>
  LANGUAGE_RANK[video.iso_639_1] ?? OTHER_LANGUAGE_RANK;

/**
 * Um único Trailer do YouTube: oficial primeiro, depois pt > en > outros, depois o mais recente.
 * Teaser, Clip e outros sites ficam de fora; sem trailer devolve null e a seção é omitida.
 */
export function pickTrailer(videos: readonly TmdbVideoDto[] | undefined): MovieTrailer | null {
  const [best] = (videos ?? [])
    .filter((video) => video.site === "YouTube" && video.type === "Trailer" && video.key)
    .sort(
      (a, b) =>
        Number(b.official) - Number(a.official) ||
        languageRank(a) - languageRank(b) ||
        // Datas em ISO 8601 comparam como texto; ausente conta como a mais antiga.
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    );

  return best ? { key: best.key, name: best.name } : null;
}
