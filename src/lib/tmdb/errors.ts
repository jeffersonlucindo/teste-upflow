export type TmdbErrorKind =
  | "config"
  | "unauthorized"
  | "not_found"
  | "rate_limited"
  | "unavailable";

/**
 * Toda falha do cliente TMDB. O `kind` serve ao servidor e ao log: em produção o Next redige
 * a mensagem de erros do servidor e o error.tsx do segmento mostra um texto genérico.
 */
export class TmdbError extends Error {
  readonly kind: TmdbErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: TmdbErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = "TmdbError";
    this.kind = kind;
    this.status = options?.status;
  }
}

export function errorKindFromStatus(status: number): TmdbErrorKind {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  return "unavailable";
}
