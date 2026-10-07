import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Genre } from "@/lib/tmdb/types";

import { FilterBar, SEARCH_DEBOUNCE_MS } from "./FilterBar";

vi.mock("next/navigation", () => ({ useRouter: vi.fn(), useSearchParams: vi.fn() }));

const GENRES: Genre[] = [
  { id: 28, name: "Ação" },
  { id: 35, name: "Comédia" },
];

const push = vi.fn();
const replace = vi.fn();

function mockUrl(search: string) {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as unknown as ReturnType<typeof useSearchParams>,
  );
}

function renderAt(search: string) {
  mockUrl(search);
  const view = render(<FilterBar genres={GENRES} />);

  return {
    ...view,
    busca: screen.getByRole<HTMLInputElement>("searchbox", { name: "Buscar por título" }),
    genero: screen.getByRole<HTMLSelectElement>("combobox", { name: /Gênero/ }),
    ordenacao: screen.getByRole<HTMLSelectElement>("combobox", { name: /Ordenar por/ }),
  };
}

function type(input: HTMLInputElement, text: string) {
  for (let length = 1; length <= text.length; length += 1) {
    fireEvent.change(input, { target: { value: text.slice(0, length) } });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useRouter).mockReturnValue({ push, replace } as unknown as ReturnType<
    typeof useRouter
  >);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("FilterBar: busca por título", () => {
  it("só atualiza a URL depois de 350 ms sem digitação, uma única vez", () => {
    const { busca } = renderAt("");

    type(busca, "mat");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/?q=mat", { scroll: false });
    expect(push).not.toHaveBeenCalled();
  });

  it("reinicia a espera a cada tecla", () => {
    const { busca } = renderAt("");

    type(busca, "ma");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    type(busca, "mat");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("aplica na hora com Enter e cancela a espera", () => {
    const { busca } = renderAt("");

    type(busca, "matrix");
    fireEvent.submit(screen.getByRole("search"));
    expect(replace).toHaveBeenCalledWith("/?q=matrix", { scroll: false });

    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("volta para / ao apagar a busca", () => {
    const { busca } = renderAt("q=matrix");
    expect(busca).toHaveValue("matrix");

    fireEvent.change(busca, { target: { value: "" } });
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(replace).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("não navega quando o texto é o mesmo da URL", () => {
    const { busca } = renderAt("q=matrix");

    fireEvent.change(busca, { target: { value: " matrix " } });
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(replace).not.toHaveBeenCalled();
  });

  it("remove gênero e ordenação da URL ao buscar", () => {
    const { busca } = renderAt("genre=28&sort=rating&page=3");

    type(busca, "matrix");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(replace).toHaveBeenCalledWith("/?q=matrix", { scroll: false });
  });

  it("acompanha a URL quando ela muda por fora", () => {
    const { busca, rerender } = renderAt("q=matrix");

    mockUrl("");
    rerender(<FilterBar genres={GENRES} />);

    expect(busca).toHaveValue("");
    expect(replace).not.toHaveBeenCalled();
  });

  it("limpa o campo quando a busca enviada é superada por outra navegação", () => {
    const { busca, rerender } = renderAt("");

    type(busca, "mat");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    expect(replace).toHaveBeenCalledTimes(1);

    // A busca não chegou a virar URL: outra navegação, também sem q, tomou o lugar.
    mockUrl("genre=28");
    rerender(<FilterBar genres={GENRES} />);
    expect(busca).toHaveValue("");

    // O campo voltou a valer: a mesma busca pode ser enviada de novo.
    type(busca, "mat");
    fireEvent.submit(screen.getByRole("search"));
    expect(replace).toHaveBeenCalledTimes(2);
  });

  it("não sobrescreve o que foi digitado quando a URL da própria busca chega", () => {
    const { busca, rerender } = renderAt("");

    type(busca, "mat");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    type(busca, "matr");
    mockUrl("q=mat");
    rerender(<FilterBar genres={GENRES} />);

    expect(busca).toHaveValue("matr");
  });
});

describe("FilterBar: gênero e ordenação", () => {
  it("lista Todos e os gêneros recebidos", () => {
    const { genero } = renderAt("");

    expect([...genero.options].map((option) => option.text)).toEqual(["Todos", "Ação", "Comédia"]);
    expect(genero).toHaveValue("");
  });

  it("filtra por gênero com push", () => {
    const { genero } = renderAt("");

    fireEvent.change(genero, { target: { value: "28" } });

    expect(push).toHaveBeenCalledWith("/?genre=28");
    expect(replace).not.toHaveBeenCalled();
  });

  it("zera a página e preserva a ordenação ao trocar o gênero", () => {
    const { genero } = renderAt("sort=rating&page=3");

    fireEvent.change(genero, { target: { value: "28" } });

    expect(push).toHaveBeenCalledWith("/?genre=28&sort=rating");
  });

  it("volta a Todos removendo o gênero", () => {
    const { genero } = renderAt("genre=28");
    expect(genero).toHaveValue("28");

    fireEvent.change(genero, { target: { value: "" } });

    expect(push).toHaveBeenCalledWith("/");
  });

  it("mostra as três ordenações com Popularidade como padrão", () => {
    const { ordenacao } = renderAt("");

    expect([...ordenacao.options].map((option) => option.text)).toEqual([
      "Popularidade",
      "Nota",
      "Data de lançamento",
    ]);
    expect(ordenacao).toHaveValue("popularity");
  });

  it("ordena com push e omite o padrão", () => {
    const { ordenacao } = renderAt("genre=28&page=2");

    fireEvent.change(ordenacao, { target: { value: "rating" } });
    expect(push).toHaveBeenLastCalledWith("/?genre=28&sort=rating");

    fireEvent.change(ordenacao, { target: { value: "popularity" } });
    expect(push).toHaveBeenLastCalledWith("/?genre=28");
  });
});

describe("FilterBar: busca exclusiva", () => {
  it("desabilita gênero e ordenação e os descreve pelo hint", () => {
    const { genero, ordenacao, busca } = renderAt("q=matrix&genre=28&sort=rating");
    const hint = screen.getByText(
      "Gênero e ordenação não se aplicam à busca por título (limitação da API).",
    );

    expect(busca).toBeEnabled();
    expect(genero).toBeDisabled();
    expect(ordenacao).toBeDisabled();
    expect(genero).toHaveValue("");
    expect(ordenacao).toHaveValue("popularity");
    expect(hint.id).not.toBe("");
    expect(genero).toHaveAttribute("aria-describedby", hint.id);
    expect(ordenacao).toHaveAttribute("aria-describedby", hint.id);
  });

  it("não mostra o hint fora da busca", () => {
    const { genero, ordenacao } = renderAt("genre=28");

    expect(screen.queryByText(/não se aplicam à busca/)).not.toBeInTheDocument();
    expect(genero).toBeEnabled();
    expect(ordenacao).toBeEnabled();
    expect(genero).not.toHaveAttribute("aria-describedby");
  });
});

describe("FilterBar: fallback", () => {
  it("renderiza os três controles desabilitados sem ler a URL", () => {
    vi.mocked(useSearchParams).mockImplementation(() => {
      throw new Error("useSearchParams não pode ser chamado no fallback");
    });

    render(<FilterBar genres={[]} disabled />);
    const genero = screen.getByRole<HTMLSelectElement>("combobox", { name: /Gênero/ });

    expect(screen.getByRole("searchbox", { name: "Buscar por título" })).toBeDisabled();
    expect(genero).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /Ordenar por/ })).toBeDisabled();
    expect([...genero.options].map((option) => option.text)).toEqual(["Carregando gêneros…"]);
  });
});
