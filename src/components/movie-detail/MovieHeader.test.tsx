import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MovieDetail } from "@/lib/tmdb/types";

import { MovieHeader } from "./MovieHeader";

const MATRIX = {
  id: 603,
  title: "Matrix",
  posterPath: "/matrix.jpg",
  releaseDate: "1999-03-30",
  runtime: 136,
  genres: [{ id: 28, name: "Ação" }],
  voteAverage: 8.7,
  voteCount: 25000,
  overview: { text: "Um hacker descobre a verdade.", language: "pt" },
  cast: [],
  trailer: null,
} satisfies MovieDetail;

describe("MovieHeader", () => {
  it("mostra o título como único h1, a meta, a nota e o botão de favorito desligado", () => {
    render(<MovieHeader movie={MATRIX} />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Matrix" })).toBeInTheDocument();
    expect(screen.getByText("1999 · 2h 16min · Ação")).toBeInTheDocument();
    expect(screen.getByText("Nota 8,7")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Adicionar aos favoritos" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveTextContent("Adicionar aos favoritos");
  });

  it("renderiza o pôster w500 pré-carregado e sem texto alternativo", () => {
    const { container } = render(<MovieHeader movie={MATRIX} />);
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("sizes", "300px");
    expect(image).not.toHaveAttribute("loading", "lazy");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
      "https://image.tmdb.org/t/p/w500/matrix.jpg",
    );
  });

  it("mostra o placeholder oculto quando não há pôster", () => {
    const { container } = render(<MovieHeader movie={{ ...MATRIX, posterPath: null }} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("Pôster")).toHaveAttribute("aria-hidden", "true");
  });

  it("omite a linha de meta quando não há ano, duração nem gêneros", () => {
    const { container } = render(
      <MovieHeader movie={{ ...MATRIX, releaseDate: null, runtime: null, genres: [] }} />,
    );

    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("diz que não há nota quando não há votos", () => {
    render(<MovieHeader movie={{ ...MATRIX, voteAverage: 0, voteCount: 0 }} />);

    expect(screen.getByText("Sem nota")).toBeInTheDocument();
  });

  it("renderiza as seções na coluna do título, depois dele", () => {
    render(
      <MovieHeader movie={MATRIX}>
        <section aria-label="Sinopse" />
      </MovieHeader>,
    );

    const title = screen.getByRole("heading", { level: 1 });
    const section = screen.getByRole("region", { name: "Sinopse" });

    expect(section.parentElement).toBe(title.parentElement?.parentElement);
    expect(section.previousElementSibling).toBe(title.parentElement);
  });
});
