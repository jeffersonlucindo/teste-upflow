import { act, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NavLink } from "@/components/layout/NavLink";
import { FAVORITES_STORAGE_KEY, favoritesStore } from "@/lib/favorites/store";

import { FavoritesBadge } from "./FavoritesBadge";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

function saveFavorites(total: number): void {
  const items = Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    title: `Filme ${index + 1}`,
    posterPath: null,
    voteAverage: 7,
    voteCount: 10,
    releaseDate: null,
    savedAt: index + 1,
  }));

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 1, items }));
}

describe("FavoritesBadge", () => {
  it("não renderiza nada sem favoritos", () => {
    const { container } = render(<FavoritesBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o total com o nome no plural", () => {
    saveFavorites(3);

    render(<FavoritesBadge />);

    expect(screen.getByText("3")).toHaveAttribute("aria-label", "3 favoritos");
    expect(screen.getByText("3")).toHaveClass("bg-border-subtle", "text-text-primary");
  });

  it("usa o singular para um favorito", () => {
    saveFavorites(1);

    render(<FavoritesBadge />);

    expect(screen.getByText("1")).toHaveAttribute("aria-label", "1 favorito");
  });

  it("não renderiza nada no servidor, mesmo com favoritos gravados", () => {
    saveFavorites(3);

    expect(renderToString(<FavoritesBadge />)).toBe("");
  });

  it("compõe o nome acessível do link com o total", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    saveFavorites(3);

    render(
      <NavLink href="/favoritos">
        Favoritos
        <FavoritesBadge />
      </NavLink>,
    );

    // O jsdom não carrega o Tailwind: sem o inline-flex do link o espaço entre texto e badge some.
    expect(screen.getByRole("link", { name: /^Favoritos\s?3 favoritos$/ })).toHaveAttribute(
      "href",
      "/favoritos",
    );
  });

  it("acompanha o store e some quando o total volta a zero", () => {
    const movie = {
      id: 603,
      title: "Matrix",
      posterPath: null,
      voteAverage: 8.2,
      voteCount: 25000,
      releaseDate: null,
    };
    const { container } = render(<FavoritesBadge />);

    act(() => favoritesStore.toggle(movie, 100));
    expect(screen.getByText("1")).toBeInTheDocument();

    act(() => favoritesStore.toggle(movie, 200));
    expect(container).toBeEmptyDOMElement();
  });
});
