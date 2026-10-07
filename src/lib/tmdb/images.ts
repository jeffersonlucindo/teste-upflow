export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const POSTER_SIZE = { card: "w342", detail: "w500" } as const;
export const PROFILE_SIZE = "w185";

export type PosterSize = (typeof POSTER_SIZE)[keyof typeof POSTER_SIZE];

/** O caminho da API já começa com "/". Sem caminho devolve null e a UI mostra o placeholder. */
function imageUrl(path: string | null | undefined, size: string): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function posterUrl(path: string | null | undefined, size: PosterSize): string | null {
  return imageUrl(path, size);
}

export function profileUrl(
  path: string | null | undefined,
  size: string = PROFILE_SIZE,
): string | null {
  return imageUrl(path, size);
}
