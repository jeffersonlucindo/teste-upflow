import { buildListingHref } from "./params";
import type { ListingQuery } from "@/lib/tmdb/types";

export interface ListingEmptyState {
  title: string;
  description: string;
  action: { label: string; href: string };
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Qual estado vazio a listagem mostra, ou `null` quando há filmes a exibir: página além do
 * total, busca sem resultado ou filtros sem resultado.
 */
export function resolveEmptyState(
  params: ListingQuery,
  result: { totalPages: number; movieCount: number },
): ListingEmptyState | null {
  if (params.page > result.totalPages) {
    return {
      title: "Esta página não existe",
      description: `A lista tem ${plural(result.totalPages, "página", "páginas")}.`,
      action: {
        label: "Ir para a última página",
        href: buildListingHref({ ...params, page: result.totalPages }),
      },
    };
  }

  if (result.movieCount > 0) return null;

  if (params.query !== null) {
    return {
      title: `Nenhum filme encontrado para “${params.query}”`,
      description: "Confira a grafia ou tente outro título.",
      action: { label: "Limpar busca", href: "/" },
    };
  }

  return {
    title: "Nenhum filme encontrado",
    description: "Nenhum filme corresponde a esses filtros.",
    action: { label: "Limpar filtros", href: "/" },
  };
}
