import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FAVORITES_STORAGE_KEY, type FavoriteSnapshot } from "@/lib/favorites/store";

import { FavoritesList } from "./FavoritesList";

const MATRIX: FavoriteSnapshot = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  voteAverage: 8.2,
  voteCount: 25000,
  releaseDate: "1999-03-30",
  savedAt: 100,
};

const DUNA: FavoriteSnapshot = {
  id: 438631,
  title: "Duna",
  posterPath: null,
  voteAverage: 0,
  voteCount: 0,
  releaseDate: null,
  savedAt: 200,
};

function saveFavorites(items: FavoriteSnapshot[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 1, items }));
}

describe("FavoritesList", () => {
  it("mostra o vazio do protótipo com a ação de explorar", () => {
    render(<FavoritesList />);

    expect(screen.getByText("Você ainda não salvou nenhum filme.")).toBeInTheDocument();
    expect(
      screen.getByText("Toque no coração de um pôster para guardá-lo aqui."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar filmes" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lista os favoritos do mais recente para o mais antigo", () => {
    saveFavorites([MATRIX, DUNA]);

    render(<FavoritesList />);
    const cards = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole("link", { name: "Duna" })).toBeInTheDocument();
    expect(within(cards[1]).getByRole("link", { name: "Matrix" })).toBeInTheDocument();
  });

  it("monta o card a partir do snapshot, com link para o detalhe sem from", () => {
    saveFavorites([MATRIX, DUNA]);

    const { container } = render(<FavoritesList />);

    expect(screen.getByText("Nota 8,2 · 1999")).toBeInTheDocument();
    expect(screen.getByText("Sem nota")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes de Matrix" })).toHaveAttribute(
      "href",
      "/movie/603",
    );
    expect(decodeURIComponent(container.querySelector("img")?.getAttribute("src") ?? "")).toContain(
      "https://image.tmdb.org/t/p/w342/matrix.jpg",
    );
  });

  it("mostra os corações ligados", () => {
    saveFavorites([MATRIX, DUNA]);

    render(<FavoritesList />);
    const buttons = screen.getAllByRole("button", { name: "Remover dos favoritos" });

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toHaveAttribute("aria-pressed", "true");
    }
  });

  it("tira o card ao remover e volta ao vazio com o último", async () => {
    const user = userEvent.setup();
    saveFavorites([MATRIX, DUNA]);
    render(<FavoritesList />);

    await user.click(screen.getAllByRole("button", { name: "Remover dos favoritos" })[0]);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Matrix" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Duna" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover dos favoritos" }));

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("Você ainda não salvou nenhum filme.")).toBeInTheDocument();
  });

  it("não renderiza nada no servidor, mesmo com favoritos gravados", () => {
    saveFavorites([MATRIX]);

    expect(renderToString(<FavoritesList />)).toBe("");
  });
});
