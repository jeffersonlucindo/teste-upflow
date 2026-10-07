import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ListingTransition,
  ListingTransitionRegion,
  useListingTransition,
} from "./ListingTransition";

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

/** Faz o papel da barra de filtros: dispara uma transição que dura até a promise resolver. */
function Trigger({ work }: { work: Promise<void> }) {
  const { isPending, startTransition } = useListingTransition();

  return (
    <button type="button" data-pending={isPending} onClick={() => startTransition(() => work)}>
      Navegar
    </button>
  );
}

describe("ListingTransition", () => {
  it("marca a região dos resultados enquanto a navegação do irmão está pendente", async () => {
    const work = deferred();
    render(
      <ListingTransition>
        <Trigger work={work.promise} />
        <ListingTransitionRegion>
          <p>Resultados</p>
        </ListingTransitionRegion>
      </ListingTransition>,
    );
    const region = screen.getByText("Resultados").parentElement;
    const status = screen.getByRole("status");

    expect(region).toHaveAttribute("aria-busy", "false");
    expect(region).not.toHaveClass("opacity-60");
    expect(status).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "Navegar" }));

    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveClass("opacity-60");
    expect(status).toHaveTextContent("Atualizando resultados…");
    expect(screen.getByText("Resultados")).toBeInTheDocument();

    await act(async () => {
      work.resolve();
      await work.promise;
    });

    expect(region).toHaveAttribute("aria-busy", "false");
    expect(region).not.toHaveClass("opacity-60");
    expect(status).toBeEmptyDOMElement();
  });

  it("anuncia o status fora da região ocupada", () => {
    render(
      <ListingTransition>
        <ListingTransitionRegion>
          <p>Resultados</p>
        </ListingTransitionRegion>
      </ListingTransition>,
    );

    expect(screen.getByRole("status").closest("[aria-busy]")).toBeNull();
  });

  it("devolve uma transição local fora do provider", async () => {
    const work = deferred();
    render(<Trigger work={work.promise} />);
    const button = screen.getByRole("button", { name: "Navegar" });

    fireEvent.click(button);
    expect(button).toHaveAttribute("data-pending", "true");

    await act(async () => {
      work.resolve();
      await work.promise;
    });
    expect(button).toHaveAttribute("data-pending", "false");
  });
});
