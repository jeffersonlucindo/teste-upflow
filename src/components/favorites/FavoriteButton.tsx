"use client";

import type { FavoriteMovie } from "@/lib/favorites/store";
import { useFavorites } from "@/lib/favorites/useFavorites";

export type FavoriteButtonVariant = "icon" | "full";

export interface FavoriteButtonProps {
  /** Sem savedAt: ele é carimbado no clique. Aceita MovieSummary, MovieDetail e MovieCardData. */
  movie: FavoriteMovie;
  variant: FavoriteButtonVariant;
}

const FAVORITE_LABELS = {
  add: "Adicionar aos favoritos",
  remove: "Remover dos favoritos",
} as const;

const BUTTON: Record<FavoriteButtonVariant, string> = {
  icon: "absolute top-2.5 right-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-overlay text-text-primary",
  full: "inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-[18px] font-semibold text-on-accent",
};

// A classe fill-* vence o atributo fill="none" do SVG. No `full` o botão já é accent.
const ACTIVE_HEART: Record<FavoriteButtonVariant, string> = {
  icon: "fill-accent text-accent",
  full: "fill-current",
};

/** Ilha client: antes de hidratar renderiza desligado, porque o servidor não conhece os favoritos. */
export function FavoriteButton({ movie, variant }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(movie.id);
  const label = active ? FAVORITE_LABELS.remove : FAVORITE_LABELS.add;

  return (
    <button
      type="button"
      aria-pressed={active}
      // No `full` o nome acessível é o texto visível.
      aria-label={variant === "icon" ? label : undefined}
      onClick={() => toggle(movie)}
      className={BUTTON[variant]}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        aria-hidden="true"
        className={active ? ACTIVE_HEART[variant] : undefined}
      >
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.8 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      {variant === "full" ? <span>{label}</span> : null}
    </button>
  );
}
