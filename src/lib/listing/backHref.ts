import { buildListingHref, parseListingParams } from "./params";

/**
 * Href de "Voltar à listagem" a partir do `?from=` do detalhe. O valor passa pelo parser da
 * listagem, então a saída é sempre "/" ou "/?…" montada aqui, nunca o texto que veio na URL.
 */
export function backHref(from: string | string[] | undefined): string {
  const raw = Array.isArray(from) ? from[0] : from;
  if (!raw) return "/";

  return buildListingHref(parseListingParams(new URLSearchParams(raw)));
}
