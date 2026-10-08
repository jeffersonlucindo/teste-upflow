import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toMovieCardData } from "@/components/movies/MovieCard";
import { FAVORITES_STORAGE_KEY } from "@/lib/favorites/store";
import type { MovieDetail, MovieSummary } from "@/lib/tmdb/types";

import { FavoriteButton } from "./FavoriteButton";

const MATRIX = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  voteAverage: 8.2,
  voteCount: 25000,
  releaseDate: "1999-03-30",
} satisfies MovieSummary;

const MATRIX_DETAIL = {
  ...MATRIX,
  runtime: 136,
  genres: [{ id: 28, name: "Ação" }],
  overview: { text: "Um hacker descobre a verdade.", language: "pt", fallback: false },
  cast: [],
  trailer: null,
} satisfies MovieDetail;

function storedItems(): Record<string, unknown>[] {
  const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return raw ? JSON.parse(raw).items : [];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FavoriteButton", () => {
  it("no servidor renderiza desligado, mesmo com o filme gravado", () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] }),
    );

    const html = renderToString(<FavoriteButton movie={MATRIX} variant="icon" />);

    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).toContain("Adicionar aos favoritos");
  });

  it("icon começa desligado, com nome acessível e sem texto visível", () => {
    render(<FavoriteButton movie={MATRIX} variant="icon" />);
    const button = screen.getByRole("button", { name: "Adicionar aos favoritos" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("");
    expect(button).toHaveClass("h-10", "w-10", "bg-bg-overlay", "text-text-primary");
    expect(button.querySelector("svg")).not.toHaveClass("fill-accent");
  });

  it("icon liga no clique e preenche o coração em accent", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton movie={MATRIX} variant="icon" />);

    await user.click(screen.getByRole("button", { name: "Adicionar aos favoritos" }));

    const button = screen.getByRole("button", { name: "Remover dos favoritos" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector("svg")).toHaveClass("fill-accent", "text-accent");
  });

  it("grava só as sete chaves do snapshot, mesmo recebendo os dados do card", async () => {
    const user = userEvent.setup();
    vi.spyOn(Date, "now").mockReturnValue(1234);
    render(<FavoriteButton movie={toMovieCardData(MATRIX)} variant="icon" />);

    await user.click(screen.getByRole("button"));

    const [item] = storedItems();
    expect(Object.keys(item).sort()).toEqual([
      "id",
      "posterPath",
      "releaseDate",
      "savedAt",
      "title",
      "voteAverage",
      "voteCount",
    ]);
    expect(item).toMatchObject(MATRIX);
    expect(item.savedAt).toBe(1234);
  });

  it("remove no segundo clique", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton movie={MATRIX} variant="icon" />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button", { name: "Adicionar aos favoritos" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(storedItems()).toEqual([]);
  });

  it("alterna pelo teclado", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton movie={MATRIX} variant="icon" />);

    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("full mostra o texto visível, sem aria-label, e aceita um MovieDetail", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton movie={MATRIX_DETAIL} variant="full" />);
    const button = screen.getByRole("button", { name: "Adicionar aos favoritos" });

    expect(button).toHaveTextContent("Adicionar aos favoritos");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveClass("min-h-11", "bg-accent", "text-on-accent");

    await user.click(button);

    expect(button).toHaveTextContent("Remover dos favoritos");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector("svg")).toHaveClass("fill-current");
    expect(Object.keys(storedItems()[0])).not.toContain("cast");
  });

  it("mantém em sincronia dois botões do mesmo filme", async () => {
    const user = userEvent.setup();
    render(
      <>
        <FavoriteButton movie={MATRIX} variant="icon" />
        <FavoriteButton movie={MATRIX} variant="full" />
        <FavoriteButton movie={{ ...MATRIX, id: 604 }} variant="icon" />
      </>,
    );
    const [icon, full, other] = screen.getAllByRole("button");

    await user.click(icon);

    expect(icon).toHaveAttribute("aria-pressed", "true");
    expect(full).toHaveAttribute("aria-pressed", "true");
    expect(other).toHaveAttribute("aria-pressed", "false");
  });

  it("começa ligado quando o filme já está gravado", () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ ...MATRIX, savedAt: 100 }] }),
    );

    render(<FavoriteButton movie={MATRIX} variant="icon" />);

    expect(screen.getByRole("button", { name: "Remover dos favoritos" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
