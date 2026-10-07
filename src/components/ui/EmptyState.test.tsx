import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("mostra título e descrição", () => {
    render(
      <EmptyState
        icon="search"
        title="Nenhum filme encontrado"
        description="Nenhum filme corresponde a esses filtros."
      />,
    );

    expect(screen.getByText("Nenhum filme encontrado")).toBeInTheDocument();
    expect(screen.getByText("Nenhum filme corresponde a esses filtros.")).toBeInTheDocument();
  });

  it("renderiza a ação com href como link", () => {
    render(
      <EmptyState icon="search" title="Vazio" action={{ label: "Limpar busca", href: "/" }} />,
    );

    expect(screen.getByRole("link", { name: "Limpar busca" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renderiza a ação com onClick como botão e dispara", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState icon="alert" title="Erro" action={{ label: "Tentar novamente", onClick }} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("não renderiza botão nem link sem ação", () => {
    render(<EmptyState icon="film" title="Filme não encontrado" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("esconde o ícone de tecnologia assistiva", () => {
    const { container } = render(<EmptyState icon="heart" title="Vazio" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
