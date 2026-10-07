import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button, ButtonLink, buttonClassName } from "./Button";

describe("Button", () => {
  it("renderiza um botão nativo que não envia formulário por padrão", () => {
    render(<Button>Próxima</Button>);

    expect(screen.getByRole("button", { name: "Próxima" })).toHaveAttribute("type", "button");
  });

  it("dispara onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tentar novamente</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("aplica as classes da variante", () => {
    render(<Button variant="outline">Anterior</Button>);

    expect(screen.getByRole("button", { name: "Anterior" })).toHaveClass(
      "border-border-strong",
      "bg-bg-base",
      "text-text-primary",
    );
  });
});

describe("ButtonLink", () => {
  it("renderiza um link com nome acessível e href", () => {
    render(<ButtonLink href="/favoritos">Explorar filmes</ButtonLink>);

    expect(screen.getByRole("link", { name: "Explorar filmes" })).toHaveAttribute("href", "/favoritos");
  });

  it("repassa aria-disabled", () => {
    render(
      <ButtonLink href="/" variant="outline" aria-disabled="true">
        Anterior
      </ButtonLink>,
    );

    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute("aria-disabled", "true");
  });
});

describe("buttonClassName", () => {
  it("usa primary como padrão, com accent e on-accent", () => {
    expect(buttonClassName()).toBe(buttonClassName("primary"));
    expect(buttonClassName("primary")).toContain("bg-accent text-on-accent");
  });

  it("mantém a altura mínima de 44 px nas duas variantes", () => {
    expect(buttonClassName("primary")).toContain("min-h-11");
    expect(buttonClassName("outline")).toContain("min-h-11");
  });
});
