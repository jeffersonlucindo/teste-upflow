import { render, screen } from "@testing-library/react";
import { useLinkStatus } from "next/link";
import { describe, expect, it, vi } from "vitest";

import { PaginationPending } from "./PaginationPending";

vi.mock("next/link", () => ({ useLinkStatus: vi.fn() }));

describe("PaginationPending", () => {
  it("fica invisível e sem texto quando a navegação não está pendente", () => {
    vi.mocked(useLinkStatus).mockReturnValue({ pending: false });
    const { container } = render(<PaginationPending />);

    expect(screen.queryByText("Carregando…")).not.toBeInTheDocument();
    expect(container.querySelector("[data-pending]")).toHaveAttribute("data-pending", "false");
    expect(container.querySelector("[data-pending]")).toHaveClass("invisible");
  });

  it.each([false, true])("fica fora do fluxo para não ocupar espaço ao lado do rótulo (pending=%s)", (pending) => {
    vi.mocked(useLinkStatus).mockReturnValue({ pending });
    const { container } = render(<PaginationPending />);

    expect(container.querySelector("[data-pending]")).toHaveClass("absolute");
  });

  it("mostra o indicador e o texto para leitor de tela enquanto carrega", () => {
    vi.mocked(useLinkStatus).mockReturnValue({ pending: true });
    const { container } = render(<PaginationPending />);

    expect(screen.getByText("Carregando…")).toHaveClass("sr-only");
    expect(container.querySelector("[data-pending]")).toHaveAttribute("data-pending", "true");
    expect(container.querySelector("[data-pending]")).not.toHaveClass("invisible");
  });
});
