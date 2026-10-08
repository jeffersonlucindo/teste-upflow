export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const POSTER_SIZE = { card: "w342", detail: "w500" } as const;
export const PROFILE_SIZE = "w185";

export type PosterSize = (typeof POSTER_SIZE)[keyof typeof POSTER_SIZE];

const IMAGE_PATH = /^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|svg)$/;

/** Formato dos caminhos que o TMDB devolve: "/arquivo.ext", sem subpasta, query ou "..". */
export function isTmdbImagePath(path: string): boolean {
  return IMAGE_PATH.test(path);
}

/**
 * O caminho da API já começa com "/". Sem caminho, ou com um fora do formato (o valor pode vir
 * do localStorage), devolve null e a UI mostra o placeholder.
 */
function imageUrl(path: string | null | undefined, size: string): string | null {
  return path && isTmdbImagePath(path) ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
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
