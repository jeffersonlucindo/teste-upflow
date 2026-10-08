import type { Genre } from "@/lib/tmdb/types";

/** Id de gênero que o TMDB conhece, ou `null` ("Todos"): valor desconhecido vira o padrão. */
export function resolveGenreId(genreId: number | null, genres: readonly Genre[]): number | null {
  if (genreId === null) return null;
  return genres.some((genre) => genre.id === genreId) ? genreId : null;
}
