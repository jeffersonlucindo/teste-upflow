import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CastMember } from "@/lib/tmdb/types";

import { CastList } from "./CastList";

const CAST: CastMember[] = [
  { id: 6384, name: "Keanu Reeves", character: "Neo", profilePath: "/keanu.jpg", order: 0 },
  { id: 2975, name: "Laurence Fishburne", character: "Morpheus", profilePath: null, order: 1 },
  { id: 530, name: "Carrie-Anne Moss", character: "", profilePath: "/carrie.jpg", order: 2 },
];

describe("CastList", () => {
  it("não renderiza nada sem elenco", () => {
    const { container } = render(<CastList cast={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lista cada pessoa como figura com nome e personagem, na ordem recebida", () => {
    render(<CastList cast={CAST} />);

    expect(screen.getByRole("heading", { level: 2, name: "Elenco principal" })).toBeInTheDocument();

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    const captions = items.map(
      (item) => within(item).getByRole("figure").querySelector("figcaption")?.textContent,
    );

    expect(captions).toEqual(["Keanu ReevesNeo", "Laurence FishburneMorpheus", "Carrie-Anne Moss"]);
  });

  it("renderiza a foto w185 sem texto alternativo", () => {
    const { container } = render(<CastList cast={[CAST[0]]} />);
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("sizes", "(max-width: 639px) 45vw, 160px");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
      "https://image.tmdb.org/t/p/w185/keanu.jpg",
    );
  });

  it("mostra o placeholder oculto quando não há foto", () => {
    const { container } = render(<CastList cast={[CAST[1]]} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("Foto")).toHaveAttribute("aria-hidden", "true");
  });

  it("omite a linha do personagem quando ela vem vazia", () => {
    render(<CastList cast={[CAST[2]]} />);

    expect(screen.getByRole("figure").querySelector("figcaption")?.children).toHaveLength(1);
  });
});
