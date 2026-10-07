"use client";

import { useFavorites } from "@/lib/favorites/useFavorites";

/** Contagem na aba Favoritos. No servidor e na hidratação o total é 0, então nunca pisca. */
export function FavoritesBadge() {
  const { count } = useFavorites();

  if (count === 0) return null;

  return (
    <span
      aria-label={`${count} ${count === 1 ? "favorito" : "favoritos"}`}
      className="inline-flex h-5 min-w-6 items-center justify-center rounded-full bg-border-subtle px-2 text-xs font-semibold text-text-primary"
    >
      {count}
    </span>
  );
}
