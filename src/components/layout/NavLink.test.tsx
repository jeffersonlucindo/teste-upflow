import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { NavLink } from "./NavLink";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

function renderNavAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);

  render(
    <nav>
      <NavLink href="/">Explorar</NavLink>
      <NavLink href="/favoritos">Favoritos</NavLink>
    </nav>,
  );

  return {
    explorar: screen.getByRole("link", { name: "Explorar" }),
    favoritos: screen.getByRole("link", { name: "Favoritos" }),
  };
}

describe("NavLink", () => {
  it("marca o link da rota atual com aria-current", () => {
    const { explorar, favoritos } = renderNavAt("/");

    expect(explorar).toHaveAttribute("aria-current", "page");
    expect(favoritos).not.toHaveAttribute("aria-current");
  });

  it("não considera a home ativa em /favoritos", () => {
    const { explorar, favoritos } = renderNavAt("/favoritos");

    expect(explorar).not.toHaveAttribute("aria-current");
    expect(favoritos).toHaveAttribute("aria-current", "page");
  });

  it("mantém o link ativo nas rotas filhas", () => {
    const { favoritos } = renderNavAt("/favoritos/recentes");

    expect(favoritos).toHaveAttribute("aria-current", "page");
  });

  it("não ativa por prefixo parcial do segmento", () => {
    const { favoritos } = renderNavAt("/favoritos-antigos");

    expect(favoritos).not.toHaveAttribute("aria-current");
  });

  it("destaca o ativo com surface-100 e deixa o inativo em text-muted", () => {
    const { explorar, favoritos } = renderNavAt("/favoritos");

    expect(favoritos).toHaveClass("bg-surface-100", "text-text-primary");
    expect(explorar).toHaveClass("text-text-muted");
    expect(explorar).not.toHaveClass("bg-surface-100");
  });

  it("aponta para o href recebido", () => {
    const { explorar, favoritos } = renderNavAt("/");

    expect(explorar).toHaveAttribute("href", "/");
    expect(favoritos).toHaveAttribute("href", "/favoritos");
  });
});
