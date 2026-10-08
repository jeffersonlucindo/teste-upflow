import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MovieSummary } from "@/lib/tmdb/types";

import { EMPTY_FAVORITES, FAVORITES_STORAGE_KEY } from "./store";
import { useFavorites } from "./useFavorites";

const MATRIX = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  voteAverage: 8.2,
  voteCount: 25000,
  releaseDate: "1999-03-30",
} satisfies MovieSummary;

const DUNA = { ...MATRIX, id: 438631, title: "Duna" } satisfies MovieSummary;

function storedPayload(): unknown {
  return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "null");
}

describe("useFavorites", () => {
  it("começa vazio e já hidratado quando renderiza no client", () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.items).toBe(EMPTY_FAVORITES);
    expect(result.current.count).toBe(0);
    expect(result.current.hydrated).toBe(true);
    expect(result.current.isFavorite(603)).toBe(false);
  });

  it("adiciona e grava ao alternar", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggle(MATRIX, 100));

    expect(result.current.items).toEqual([{ ...MATRIX, savedAt: 100 }]);
    expect(result.current.count).toBe(1);
    expect(result.current.isFavorite(603)).toBe(true);
    expect(storedPayload()).toEqual({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] });
  });

  it("remove ao alternar de novo", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggle(MATRIX, 100));
    act(() => result.current.toggle(MATRIX, 200));

    expect(result.current.items).toEqual([]);
    expect(result.current.isFavorite(603)).toBe(false);
  });

  it("lista do mais recente para o mais antigo", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggle(MATRIX, 100));
    act(() => result.current.toggle(DUNA, 200));

    expect(result.current.items.map((item) => item.id)).toEqual([DUNA.id, MATRIX.id]);
  });

  it("lê o que já estava gravado", () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] }),
    );

    const { result } = renderHook(() => useFavorites());

    expect(result.current.count).toBe(1);
    expect(result.current.isFavorite(603)).toBe(true);
  });

  it("acompanha o que outra aba gravou", () => {
    const { result } = renderHook(() => useFavorites());
    const newValue = JSON.stringify({ version: 1, items: [{ ...DUNA, savedAt: 300 }] });

    localStorage.setItem(FAVORITES_STORAGE_KEY, newValue);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: FAVORITES_STORAGE_KEY, newValue }));
    });

    expect(result.current.items.map((item) => item.id)).toEqual([DUNA.id]);
  });

  it("trata o payload corrompido como lista vazia", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, "{oops");

    const { result } = renderHook(() => useFavorites());

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("mantém a referência de items entre renders sem mudança", () => {
    const { result, rerender } = renderHook(() => useFavorites());
    act(() => result.current.toggle(MATRIX, 100));
    const before = result.current.items;

    rerender();

    expect(result.current.items).toBe(before);
  });

  it("compartilha os favoritos entre os consumidores da mesma aba", () => {
    const first = renderHook(() => useFavorites());
    const second = renderHook(() => useFavorites());

    act(() => first.result.current.toggle(MATRIX, 100));

    expect(second.result.current.isFavorite(603)).toBe(true);
  });

  it("deixa de escutar o evento storage ao desmontar", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useFavorites());

    unmount();

    expect(remove.mock.calls.filter(([type]) => type === "storage")).toHaveLength(1);
    remove.mockRestore();
  });
});
