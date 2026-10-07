import { useSyncExternalStore } from "react";

import {
  favoritesStore,
  hasFavorite,
  type FavoriteMovie,
  type FavoriteSnapshot,
} from "./store";

export interface UseFavoritesResult {
  /** Do mais recente para o mais antigo. Vazio no servidor e durante a hidratação. */
  items: readonly FavoriteSnapshot[];
  count: number;
  /** false no servidor e durante a hidratação: ali ainda não dá para saber se há favoritos. */
  hydrated: boolean;
  isFavorite: (id: number) => boolean;
  toggle: (movie: FavoriteMovie, savedAt?: number) => void;
}

const subscribeNoop = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/**
 * Favoritos do navegador. O servidor e a hidratação veem a lista vazia, então o HTML bate; os
 * itens reais chegam no render seguinte. Sem diretiva: quem importa já é ilha client.
 */
export function useFavorites(): UseFavoritesResult {
  const items = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );
  // "Já hidratou?" sem estado nem efeito: o snapshot do servidor é false e o do client é true.
  const hydrated = useSyncExternalStore(subscribeNoop, getHydrated, getServerHydrated);

  return {
    items,
    count: items.length,
    hydrated,
    isFavorite: (id) => hasFavorite(items, id),
    toggle: favoritesStore.toggle,
  };
}
