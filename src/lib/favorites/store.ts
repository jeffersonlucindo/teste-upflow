// Favoritos: formato, validação e regras em funções puras, mais o store que faz a ponte com o
// localStorage. Sem diretiva e sem `window` no nível do módulo: o FavoriteButton é renderizado
// no servidor e importa este arquivo.

export const FAVORITES_STORAGE_KEY = "catalogo.favorites.v1";
export const FAVORITES_PAYLOAD_VERSION = 1;

/** O filme como o FavoriteButton recebe. MovieSummary, MovieDetail e MovieCardData servem sem adaptador. */
export interface FavoriteMovie {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  voteCount: number;
  /** "YYYY-MM-DD" */
  releaseDate: string | null;
}

/** O que fica gravado por filme. */
export interface FavoriteSnapshot extends FavoriteMovie {
  /** Epoch em ms, carimbado no clique. */
  savedAt: number;
}

export interface FavoritesPayload {
  version: typeof FAVORITES_PAYLOAD_VERSION;
  items: FavoriteSnapshot[];
}

/** Lista vazia única: é o snapshot do servidor e o do client sem favoritos. */
export const EMPTY_FAVORITES: readonly FavoriteSnapshot[] = Object.freeze([]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isFavoriteSnapshot(value: unknown): value is FavoriteSnapshot {
  return (
    isRecord(value) &&
    Number.isInteger(value.id) &&
    (value.id as number) >= 1 &&
    typeof value.title === "string" &&
    isStringOrNull(value.posterPath) &&
    Number.isFinite(value.voteAverage) &&
    Number.isFinite(value.voteCount) &&
    (value.voteCount as number) >= 0 &&
    isStringOrNull(value.releaseDate) &&
    Number.isFinite(value.savedAt)
  );
}

/** Confere só o envelope. Os itens são validados um a um em parseFavorites. */
export function isFavoritesPayload(value: unknown): value is FavoritesPayload {
  return (
    isRecord(value) && value.version === FAVORITES_PAYLOAD_VERSION && Array.isArray(value.items)
  );
}

/** Copia campo a campo: o que a origem tiver a mais (elenco, sinopse, URL do pôster) não é gravado. */
export function toFavoriteSnapshot(movie: FavoriteMovie, savedAt: number): FavoriteSnapshot {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    voteAverage: movie.voteAverage,
    voteCount: movie.voteCount,
    releaseDate: movie.releaseDate,
    savedAt,
  };
}

/** Cópia ordenada do mais recente para o mais antigo. */
export function sortFavorites(items: readonly FavoriteSnapshot[]): FavoriteSnapshot[] {
  return [...items].sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Nunca lança. Payload ilegível vira lista vazia; item inválido é descartado sozinho, sem levar
 * a lista junto; de um id repetido fica o salvo por último.
 */
export function parseFavorites(raw: string | null): FavoriteSnapshot[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isFavoritesPayload(parsed)) return [];

  const byId = new Map<number, FavoriteSnapshot>();
  const items: unknown[] = parsed.items;
  for (const item of items) {
    if (!isFavoriteSnapshot(item)) continue;

    const known = byId.get(item.id);
    if (!known || item.savedAt > known.savedAt) {
      byId.set(item.id, toFavoriteSnapshot(item, item.savedAt));
    }
  }

  return sortFavorites([...byId.values()]);
}

export function serializeFavorites(items: readonly FavoriteSnapshot[]): string {
  const payload: FavoritesPayload = { version: FAVORITES_PAYLOAD_VERSION, items: [...items] };
  return JSON.stringify(payload);
}

export function hasFavorite(items: readonly FavoriteSnapshot[], id: number): boolean {
  return items.some((item) => item.id === id);
}

/** Remove se já está na lista; senão insere no topo. Não muta a entrada. */
export function toggleInFavorites(
  items: readonly FavoriteSnapshot[],
  movie: FavoriteMovie,
  savedAt: number,
): FavoriteSnapshot[] {
  if (hasFavorite(items, movie.id)) return items.filter((item) => item.id !== movie.id);
  return [toFavoriteSnapshot(movie, savedAt), ...items];
}

export interface FavoritesStore {
  /** Mesma referência enquanto a string gravada não muda, como o useSyncExternalStore exige. */
  getSnapshot(): readonly FavoriteSnapshot[];
  /** Sempre vazio: o servidor não conhece o localStorage. */
  getServerSnapshot(): readonly FavoriteSnapshot[];
  write(items: readonly FavoriteSnapshot[]): void;
  toggle(movie: FavoriteMovie, savedAt?: number): void;
  subscribe(listener: () => void): () => void;
}

/** `getStorage` é um thunk porque só o acesso a `window.localStorage` já pode lançar. */
export function createFavoritesStore(getStorage: () => Storage): FavoritesStore {
  // Última string lida ou gravada. É o que vale quando o storage falha.
  let memoryRaw: string | null = null;
  // Trava na primeira exceção: dali em diante a sessão segue só em memória.
  let storageBroken = false;
  let cachedRaw: string | null = null;
  let cachedItems: readonly FavoriteSnapshot[] = EMPTY_FAVORITES;
  const listeners = new Set<() => void>();

  function readRaw(): string | null {
    if (storageBroken) return memoryRaw;

    try {
      memoryRaw = getStorage().getItem(FAVORITES_STORAGE_KEY);
    } catch {
      storageBroken = true;
    }
    return memoryRaw;
  }

  function writeRaw(raw: string): void {
    memoryRaw = raw;
    if (storageBroken) return;

    try {
      getStorage().setItem(FAVORITES_STORAGE_KEY, raw);
    } catch {
      storageBroken = true;
    }
  }

  function notify(): void {
    for (const listener of listeners) listener();
  }

  // Dispara só nas outras abas. `key` nula é um clear() feito por lá.
  function onStorage(event: StorageEvent): void {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) notify();
  }

  // Lê o storage a cada chamada, e assim se corrige quando a chave muda por fora; o parse só
  // roda quando a string muda.
  function getSnapshot(): readonly FavoriteSnapshot[] {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      const items = parseFavorites(raw);
      cachedRaw = raw;
      cachedItems = items.length === 0 ? EMPTY_FAVORITES : Object.freeze(items);
    }
    return cachedItems;
  }

  function getServerSnapshot(): readonly FavoriteSnapshot[] {
    return EMPTY_FAVORITES;
  }

  // Grava sempre o payload inteiro: é aqui que um conteúdo corrompido é sobrescrito.
  function write(items: readonly FavoriteSnapshot[]): void {
    writeRaw(serializeFavorites(sortFavorites(items)));
    notify();
  }

  // O único relógio do domínio, avaliado no clique e nunca no render.
  function toggle(movie: FavoriteMovie, savedAt: number = Date.now()): void {
    write(toggleInFavorites(getSnapshot(), movie, savedAt));
  }

  function subscribe(listener: () => void): () => void {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  }

  return { getSnapshot, getServerSnapshot, write, toggle, subscribe };
}

export const favoritesStore: FavoritesStore = createFavoritesStore(() => window.localStorage);
