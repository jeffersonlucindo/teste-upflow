import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrailerEmbed, trailerEmbedUrl } from "./TrailerEmbed";

describe("trailerEmbedUrl", () => {
  it("aponta para o domínio sem cookies do YouTube", () => {
    expect(trailerEmbedUrl("abc")).toBe("https://www.youtube-nocookie.com/embed/abc");
  });

  it("codifica a chave", () => {
    expect(trailerEmbedUrl("a b")).toBe("https://www.youtube-nocookie.com/embed/a%20b");
  });
});

describe("TrailerEmbed", () => {
  it("não renderiza nada sem trailer", () => {
    const { container } = render(<TrailerEmbed trailer={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza o player nomeado pelo vídeo, com carregamento tardio e tela cheia", () => {
    render(<TrailerEmbed trailer={{ key: "abc", name: "Official Trailer" }} />);

    expect(screen.getByRole("heading", { level: 2, name: "Trailer" })).toBeInTheDocument();

    const player = screen.getByTitle("Trailer: Official Trailer");
    expect(player.tagName).toBe("IFRAME");
    expect(player).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc");
    expect(player).toHaveAttribute("loading", "lazy");
    expect(player).toHaveAttribute("allowfullscreen");
  });
});
