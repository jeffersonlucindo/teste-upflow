import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./Pagination";

function renderPagination(page: number, totalPages: number) {
  render(
    <Pagination page={page} totalPages={totalPages} hrefFor={(target) => `/?page=${target}`} />,
  );

  return {
    anterior: screen.getByText("Anterior"),
    proxima: screen.getByText("Próxima"),
  };
}

describe("Pagination", () => {
  it("desabilita Anterior na primeira página", () => {
    const { anterior, proxima } = renderPagination(1, 5);

    expect(anterior).toHaveAttribute("aria-disabled", "true");
    expect(anterior).not.toHaveAttribute("href");
    expect(proxima).toHaveAttribute("href", "/?page=2");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("desabilita Próxima na última página", () => {
    const { anterior, proxima } = renderPagination(5, 5);

    expect(anterior).toHaveAttribute("href", "/?page=4");
    expect(proxima).toHaveAttribute("aria-disabled", "true");
    expect(proxima).not.toHaveAttribute("href");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("liga os dois lados em uma página intermediária", () => {
    const { anterior, proxima } = renderPagination(3, 5);

    expect(anterior).toHaveAttribute("href", "/?page=2");
    expect(anterior).toHaveAttribute("rel", "prev");
    expect(proxima).toHaveAttribute("href", "/?page=4");
    expect(proxima).toHaveAttribute("rel", "next");
    expect(screen.getByText("Página 3 de 5")).toBeInTheDocument();
  });

  it("ancora o indicador de carregamento no próprio link (relative nos dois lados)", () => {
    const { anterior, proxima } = renderPagination(3, 5);

    expect(anterior).toHaveClass("relative");
    expect(proxima).toHaveClass("relative");
  });

  it("não tem link quando só há uma página", () => {
    const { anterior, proxima } = renderPagination(1, 1);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(anterior).toHaveAttribute("aria-disabled", "true");
    expect(proxima).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("é uma navegação nomeada", () => {
    renderPagination(1, 5);

    expect(screen.getByRole("navigation", { name: "Paginação" })).toBeInTheDocument();
  });
});
