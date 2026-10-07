import type { MovieDetail } from "@/lib/tmdb/types";

import { releaseYear } from "./releaseYear";
import { formatRuntime } from "./runtime";

export type MovieMetaInput = Pick<MovieDetail, "releaseDate" | "runtime" | "genres">;

/** "1999 · 2h 16min · Ação, Ficção científica". Pedaço ausente some com o separador; sem nenhum, null. */
export function formatMovieMeta(movie: MovieMetaInput): string | null {
  const parts = [
    releaseYear(movie.releaseDate),
    formatRuntime(movie.runtime),
    movie.genres.map((genre) => genre.name).join(", ") || null,
  ].filter((part) => part !== null);

  return parts.length > 0 ? parts.join(" · ") : null;
}
