import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Overview, overviewNotice } from "./Overview";

const TEXT = "Um hacker descobre a verdade sobre a realidade.";

describe("overviewNotice", () => {
  it("não avisa quando a sinopse está em português", () => {
    expect(overviewNotice("pt")).toBeNull();
  });

  it.each([
    ["en", "Sinopse disponível apenas em inglês."],
    ["ja", "Sinopse disponível apenas em japonês."],
  ])("nomeia o idioma %j", (language, notice) => {
    expect(overviewNotice(language)).toBe(notice);
  });

  it("usa o aviso genérico para um idioma sem nome conhecido", () => {
    expect(overviewNotice("xx")).toBe("Sinopse disponível apenas em outro idioma.");
  });
});

describe("Overview", () => {
  it("em português mostra só o texto, sem aviso e sem lang", () => {
    render(<Overview overview={{ text: TEXT, language: "pt" }} />);

    expect(screen.getByRole("heading", { level: 2, name: "Sinopse" })).toBeInTheDocument();
    expect(screen.getByText(TEXT)).not.toHaveAttribute("lang");
    expect(screen.queryByText(/Sinopse disponível apenas/)).not.toBeInTheDocument();
  });

  it("em outro idioma avisa antes do texto e marca o idioma do parágrafo", () => {
    render(<Overview overview={{ text: "A hacker learns the truth.", language: "en" }} />);

    const notice = screen.getByText("Sinopse disponível apenas em inglês.");
    const text = screen.getByText("A hacker learns the truth.");

    expect(text).toHaveAttribute("lang", "en");
    expect(notice).not.toHaveAttribute("lang");
    expect(notice.nextElementSibling).toBe(text);
  });

  it("com idioma sem nome conhecido usa o aviso genérico e mantém o lang", () => {
    render(<Overview overview={{ text: TEXT, language: "xx" }} />);

    expect(screen.getByText("Sinopse disponível apenas em outro idioma.")).toBeInTheDocument();
    expect(screen.getByText(TEXT)).toHaveAttribute("lang", "xx");
  });

  it("sem sinopse mantém a seção e informa a ausência", () => {
    render(<Overview overview={null} />);

    expect(screen.getByRole("heading", { level: 2, name: "Sinopse" })).toBeInTheDocument();
    expect(screen.getByText("Sinopse não disponível.")).toBeInTheDocument();
    expect(screen.queryByText(/Sinopse disponível apenas/)).not.toBeInTheDocument();
  });
});
