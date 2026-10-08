import { afterEach, describe, expect, it, vi } from "vitest";

import type { MovieDetail, MovieSummary } from "@/lib/tmdb/types";

import {
  EMPTY_FAVORITES,
  FAVORITES_STORAGE_KEY,
  createFavoritesStore,
  hasFavorite,
  isFavoriteSnapshot,
  isFavoritesPayload,
  parseFavorites,
  serializeFavorites,
  sortFavorites,
  toFavoriteSnapshot,
  toggleInFavorites,
  type FavoriteSnapshot,
} from "./store";

const MATRIX = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  voteAverage: 8.2,
  voteCount: 25000,
  releaseDate: "1999-03-30",
} satisfies MovieSummary;

const DUNA = {
  id: 438631,
  title: "Duna",
  posterPath: null,
  voteAverage: 7.8,
  voteCount: 0,
  releaseDate: null,
} satisfies MovieSummary;

const SNAPSHOT_KEYS = [
  "id",
  "posterPath",
  "releaseDate",
  "savedAt",
  "title",
  "voteAverage",
  "voteCount",
];

function snapshot(overrides: Partial<FavoriteSnapshot> = {}): FavoriteSnapshot {
  return { ...MATRIX, savedAt: 100, ...overrides };
}

function payload(items: unknown[], version: number = 1): string {
  return JSON.stringify({ version, items });
}

function storedPayload(): unknown {
  return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "null");
}

/** Como a outra aba: grava direto e avisa pelo evento que o navegador dispararia aqui. */
function writeFromAnotherTab(key: string, newValue: string): void {
  localStorage.setItem(key, newValue);
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

function storageListenerCalls(spy: { mock: { calls: unknown[][] } }): number {
  return spy.mock.calls.filter(([type]) => type === "storage").length;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isFavoriteSnapshot", () => {
  it("aceita o snapshot completo", () => {
    expect(isFavoriteSnapshot(snapshot())).toBe(true);
  });

  it("aceita pôster e data nulos", () => {
    expect(isFavoriteSnapshot(snapshot({ posterPath: null, releaseDate: null }))).toBe(true);
  });

  it("aceita chaves a mais", () => {
    expect(isFavoriteSnapshot({ ...snapshot(), posterUrl: "https://exemplo/p.jpg" })).toBe(true);
  });

  it.each([
    ["null", null],
    ["texto", "603"],
    ["id em texto", { ...snapshot(), id: "1" }],
    ["id zero", snapshot({ id: 0 })],
    ["id fracionado", snapshot({ id: 1.5 })],
    ["título ausente", { ...snapshot(), title: undefined }],
    ["pôster numérico", { ...snapshot(), posterPath: 1 }],
    ["nota não finita", snapshot({ voteAverage: Number.NaN })],
    ["votos ausentes", { ...snapshot(), voteCount: undefined }],
    ["votos negativos", snapshot({ voteCount: -1 })],
    ["data numérica", { ...snapshot(), releaseDate: 1999 }],
    ["savedAt ausente", { ...MATRIX }],
    ["savedAt em texto", { ...snapshot(), savedAt: "100" }],
  ])("recusa %s", (_caso, value) => {
    expect(isFavoriteSnapshot(value)).toBe(false);
  });
});

describe("isFavoritesPayload", () => {
  it("aceita a versão 1 com items em array", () => {
    expect(isFavoritesPayload({ version: 1, items: [] })).toBe(true);
    expect(isFavoritesPayload({ version: 1, items: [snapshot()] })).toBe(true);
  });

  it.each([
    ["null", null],
    ["array solto", [snapshot()]],
    ["outra versão", { version: 2, items: [] }],
    ["items que não é array", { version: 1, items: {} }],
    ["sem items", { version: 1 }],
  ])("recusa %s", (_caso, value) => {
    expect(isFavoritesPayload(value)).toBe(false);
  });
});

describe("toFavoriteSnapshot", () => {
  it("monta as sete chaves a partir de um MovieSummary", () => {
    const result = toFavoriteSnapshot(MATRIX, 100);

    expect(result).toEqual({ ...MATRIX, savedAt: 100 });
    expect(Object.keys(result).sort()).toEqual(SNAPSHOT_KEYS);
  });

  it("descarta os campos de detalhe de um MovieDetail", () => {
    const detail = {
      ...MATRIX,
      runtime: 136,
      genres: [{ id: 28, name: "Ação" }],
      overview: { text: "Um hacker descobre a verdade.", language: "pt", fallback: false },
      cast: [{ id: 6384, name: "Keanu Reeves", character: "Neo", profilePath: null, order: 0 }],
      trailer: { key: "abc", name: "Trailer" },
    } satisfies MovieDetail;

    expect(Object.keys(toFavoriteSnapshot(detail, 100)).sort()).toEqual(SNAPSHOT_KEYS);
  });

  it("descarta os campos derivados do card", () => {
    const card = { ...MATRIX, posterUrl: "https://exemplo/p.jpg", releaseYear: 1999 };

    expect(Object.keys(toFavoriteSnapshot(card, 100)).sort()).toEqual(SNAPSHOT_KEYS);
  });
});

describe("toFavoriteSnapshot: pôster fora do formato", () => {
  it.each(["/../../etc.jpg", "https://evil.example/p.jpg", "p.jpg", "/a/b.jpg"])(
    "grava posterPath nulo para %s",
    (posterPath) => {
      expect(toFavoriteSnapshot({ ...MATRIX, posterPath }, 100).posterPath).toBeNull();
    },
  );

  it("mantém o caminho legítimo", () => {
    expect(toFavoriteSnapshot(MATRIX, 100).posterPath).toBe("/matrix.jpg");
  });
});

describe("parseFavorites", () => {
  it.each([
    ["chave ausente", null],
    ["texto vazio", ""],
    ["JSON inválido", "{"],
    ["array solto", "[]"],
    ["outra versão", payload([snapshot()], 2)],
    ["items que não é array", JSON.stringify({ version: 1, items: {} })],
  ])("devolve lista vazia para %s", (_caso, raw) => {
    expect(parseFavorites(raw)).toEqual([]);
  });

  it("ordena do mais recente para o mais antigo", () => {
    const raw = payload([
      snapshot({ id: 1, savedAt: 100 }),
      snapshot({ id: 2, savedAt: 300 }),
      snapshot({ id: 3, savedAt: 200 }),
    ]);

    expect(parseFavorites(raw).map((item) => item.id)).toEqual([2, 3, 1]);
  });

  it("descarta só o item inválido", () => {
    const raw = payload([
      snapshot({ id: 1, savedAt: 300 }),
      { id: 2, title: "Sem savedAt" },
      { ...snapshot({ savedAt: 250 }), id: "3" },
      snapshot({ id: 4, savedAt: 200 }),
    ]);

    expect(parseFavorites(raw).map((item) => item.id)).toEqual([1, 4]);
  });

  it("fica com o salvo por último quando o id se repete", () => {
    const raw = payload([
      snapshot({ title: "Antigo", savedAt: 100 }),
      snapshot({ title: "Recente", savedAt: 300 }),
      snapshot({ title: "Do meio", savedAt: 200 }),
    ]);

    expect(parseFavorites(raw)).toEqual([snapshot({ title: "Recente", savedAt: 300 })]);
  });

  it("mantém o item com posterPath adulterado, sem o pôster", () => {
    const raw = payload([snapshot({ id: 1, posterPath: "/../../etc.jpg" }), snapshot({ id: 2 })]);

    expect(parseFavorites(raw).map((item) => [item.id, item.posterPath]).sort()).toEqual([
      [1, null],
      [2, "/matrix.jpg"],
    ]);
  });

  it("remove chaves que não são do snapshot", () => {
    const raw = payload([{ ...snapshot(), posterUrl: "https://exemplo/p.jpg", cast: [] }]);

    expect(parseFavorites(raw)).toEqual([snapshot()]);
  });
});

describe("serializeFavorites", () => {
  it("grava o payload versionado", () => {
    expect(JSON.parse(serializeFavorites([]))).toEqual({ version: 1, items: [] });
    expect(JSON.parse(serializeFavorites([snapshot()]))).toEqual({
      version: 1,
      items: [snapshot()],
    });
  });

  it("volta igual ao passar por parseFavorites", () => {
    const items = [snapshot({ id: 2, savedAt: 200 }), snapshot({ id: 1, savedAt: 100 })];

    expect(parseFavorites(serializeFavorites(items))).toEqual(items);
  });
});

describe("sortFavorites", () => {
  it("devolve uma cópia ordenada sem mexer na entrada", () => {
    const items = [snapshot({ id: 1, savedAt: 100 }), snapshot({ id: 2, savedAt: 200 })];

    expect(sortFavorites(items).map((item) => item.id)).toEqual([2, 1]);
    expect(items.map((item) => item.id)).toEqual([1, 2]);
  });

  it("mantém a ordem de quem empata", () => {
    const items = [snapshot({ id: 1 }), snapshot({ id: 2 }), snapshot({ id: 3 })];

    expect(sortFavorites(items).map((item) => item.id)).toEqual([1, 2, 3]);
  });
});

describe("hasFavorite", () => {
  it("procura pelo id", () => {
    expect(hasFavorite([snapshot()], 603)).toBe(true);
    expect(hasFavorite([snapshot()], 604)).toBe(false);
    expect(hasFavorite([], 603)).toBe(false);
  });
});

describe("toggleInFavorites", () => {
  it("insere no topo quem não está na lista", () => {
    const items = [snapshot({ savedAt: 100 })];

    expect(toggleInFavorites(items, DUNA, 200)).toEqual([{ ...DUNA, savedAt: 200 }, items[0]]);
  });

  it("remove quem já está na lista", () => {
    const items = [{ ...DUNA, savedAt: 200 }, snapshot({ savedAt: 100 })];

    expect(toggleInFavorites(items, MATRIX, 300)).toEqual([{ ...DUNA, savedAt: 200 }]);
  });

  it("não muta a entrada", () => {
    const items = Object.freeze([snapshot()]);

    toggleInFavorites(items, DUNA, 200);
    toggleInFavorites(items, MATRIX, 200);

    expect(items).toEqual([snapshot()]);
  });
});

describe("createFavoritesStore", () => {
  it("devolve a lista vazia única enquanto não há nada gravado", () => {
    const store = createFavoritesStore(() => localStorage);

    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    expect(store.getServerSnapshot()).toBe(EMPTY_FAVORITES);
  });

  it("grava o payload versionado ao alternar", () => {
    const store = createFavoritesStore(() => localStorage);

    store.toggle(MATRIX, 100);

    expect(storedPayload()).toEqual({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] });
    expect(store.getSnapshot()).toEqual([{ ...MATRIX, savedAt: 100 }]);
  });

  it("carimba o momento do clique quando savedAt não é informado", () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const store = createFavoritesStore(() => localStorage);

    store.toggle(MATRIX);

    expect(store.getSnapshot()[0].savedAt).toBe(1234);
  });

  it("lista do mais recente para o mais antigo e grava na mesma ordem", () => {
    const store = createFavoritesStore(() => localStorage);

    store.toggle(MATRIX, 100);
    store.toggle(DUNA, 200);

    expect(store.getSnapshot().map((item) => item.id)).toEqual([DUNA.id, MATRIX.id]);
    expect(storedPayload()).toMatchObject({ items: [{ id: DUNA.id }, { id: MATRIX.id }] });
  });

  it("a próxima gravação salva com posterPath nulo o item de pôster adulterado", () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      payload([snapshot({ id: 1, posterPath: "/../../etc.jpg", savedAt: 50 })]),
    );
    const store = createFavoritesStore(() => localStorage);

    store.toggle(DUNA, 200);

    expect(storedPayload()).toMatchObject({
      items: [{ id: DUNA.id }, { id: 1, posterPath: null }],
    });
  });

  it("toggle de um filme com pôster fora do formato grava posterPath nulo", () => {
    const store = createFavoritesStore(() => localStorage);

    store.toggle({ ...MATRIX, posterPath: "https://evil.example/p.jpg" }, 100);

    expect(storedPayload()).toMatchObject({ items: [{ id: MATRIX.id, posterPath: null }] });
  });

  it("remove ao alternar de novo", () => {
    const store = createFavoritesStore(() => localStorage);

    store.toggle(MATRIX, 100);
    store.toggle(MATRIX, 200);

    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    expect(storedPayload()).toEqual({ version: 1, items: [] });
  });

  it("mantém a referência entre leituras e troca depois de gravar", () => {
    const store = createFavoritesStore(() => localStorage);
    const empty = store.getSnapshot();

    store.write([snapshot()]);
    const written = store.getSnapshot();

    expect(written).not.toBe(empty);
    expect(store.getSnapshot()).toBe(written);
    expect(Object.isFrozen(written)).toBe(true);
  });

  it("ordena o que recebe em write", () => {
    const store = createFavoritesStore(() => localStorage);

    store.write([snapshot({ id: 1, savedAt: 100 }), snapshot({ id: 2, savedAt: 200 })]);

    expect(store.getSnapshot().map((item) => item.id)).toEqual([2, 1]);
  });

  it("avisa os assinantes ao gravar, até cancelarem", () => {
    const store = createFavoritesStore(() => localStorage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.toggle(MATRIX, 100);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.toggle(DUNA, 200);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reflete o que outra aba gravou", () => {
    const store = createFavoritesStore(() => localStorage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    writeFromAnotherTab(FAVORITES_STORAGE_KEY, payload([snapshot()]));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual([snapshot()]);
    unsubscribe();
  });

  it("avisa quando outra aba limpa o storage", () => {
    const store = createFavoritesStore(() => localStorage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.toggle(MATRIX, 100);
    listener.mockClear();

    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    unsubscribe();
  });

  it("ignora o evento de outra chave", () => {
    const store = createFavoritesStore(() => localStorage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    writeFromAnotherTab("outra", "valor");

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("escuta o evento storage só enquanto há assinantes", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const store = createFavoritesStore(() => localStorage);

    const first = store.subscribe(() => {});
    const second = store.subscribe(() => {});
    expect(storageListenerCalls(add)).toBe(1);

    first();
    expect(storageListenerCalls(remove)).toBe(0);

    second();
    expect(storageListenerCalls(remove)).toBe(1);
  });

  it("mantém o snapshot do servidor vazio mesmo com itens gravados", () => {
    const store = createFavoritesStore(() => localStorage);

    store.toggle(MATRIX, 100);

    expect(store.getServerSnapshot()).toBe(EMPTY_FAVORITES);
  });

  it("lê o payload corrompido como vazio e só o sobrescreve na gravação seguinte", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, "{oops");
    const store = createFavoritesStore(() => localStorage);

    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe("{oops");

    store.toggle(MATRIX, 100);

    expect(storedPayload()).toEqual({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] });
  });

  it("segue em memória quando o acesso ao storage lança", () => {
    const store = createFavoritesStore(() => {
      throw new Error("blocked");
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);

    store.toggle(MATRIX, 100);

    expect(store.getSnapshot()).toEqual([{ ...MATRIX, savedAt: 100 }]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();

    store.toggle(MATRIX, 200);
    expect(store.getSnapshot()).toBe(EMPTY_FAVORITES);
    unsubscribe();
  });

  it("segue em memória quando a leitura lança, sem perder o que já foi lido", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, payload([snapshot({ savedAt: 100 })]));
    const store = createFavoritesStore(() => localStorage);
    expect(store.getSnapshot()).toHaveLength(1);

    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    expect(() => store.getSnapshot()).not.toThrow();
    expect(store.getSnapshot().map((item) => item.id)).toEqual([MATRIX.id]);

    store.toggle(DUNA, 200);

    expect(store.getSnapshot().map((item) => item.id)).toEqual([DUNA.id, MATRIX.id]);
    expect(setItem).not.toHaveBeenCalled();
    getItem.mockRestore();
    expect(storedPayload()).toEqual({ version: 1, items: [snapshot({ savedAt: 100 })] });
  });

  it("segue em memória quando a gravação lança, sem perder o que já estava salvo", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, payload([snapshot({ savedAt: 100 })]));
    const store = createFavoritesStore(() => localStorage);
    expect(store.getSnapshot()).toHaveLength(1);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    store.toggle(DUNA, 200);

    expect(store.getSnapshot().map((item) => item.id)).toEqual([DUNA.id, MATRIX.id]);
    expect(storedPayload()).toEqual({ version: 1, items: [snapshot({ savedAt: 100 })] });
  });
});
