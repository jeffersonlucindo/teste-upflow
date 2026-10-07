import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorState } from "./ErrorState";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const refresh = vi.fn();
const reset = vi.fn();
const error = new Error("Defina TMDB_API_READ_TOKEN em .env.local");

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("ErrorState", () => {
  it("mostra o título padrão e um texto genérico fora do desenvolvimento", () => {
    render(<ErrorState error={error} reset={reset} />);

    expect(screen.getByText("Não foi possível carregar os filmes")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em instantes.")).toBeInTheDocument();
    expect(screen.queryByText(/TMDB_API_READ_TOKEN/)).not.toBeInTheDocument();
  });

  it("mostra a mensagem do erro em desenvolvimento", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(<ErrorState error={error} reset={reset} />);

    expect(screen.getByText("Defina TMDB_API_READ_TOKEN em .env.local")).toBeInTheDocument();
  });

  it("aceita outro título", () => {
    render(<ErrorState error={error} reset={reset} title="Não foi possível carregar o filme" />);

    expect(screen.getByText("Não foi possível carregar o filme")).toBeInTheDocument();
  });

  it("refaz os dados do servidor e limpa o erro ao tentar novamente", async () => {
    render(<ErrorState error={error} reset={reset} />);

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
