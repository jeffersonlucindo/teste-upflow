"use client";

import { MovieGrid } from "@/components/movies/MovieGrid";
import { toMovieCardData } from "@/components/movies/MovieCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFavorites } from "@/lib/favorites/useFavorites";

/** Lista de /favoritos, montada só com o que está no navegador: nenhuma chamada ao TMDB. */
export function FavoritesList() {
  const { items, hydrated } = useFavorites();

  // Antes de hidratar não se sabe se há favoritos: mostrar o vazio enganaria quem tem.
  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Você ainda não salvou nenhum filme."
        description="Toque no coração de um pôster para guardá-lo aqui."
        action={{ href: "/", label: "Explorar filmes" }}
      />
    );
  }

  return <MovieGrid movies={items.map(toMovieCardData)} />;
}
