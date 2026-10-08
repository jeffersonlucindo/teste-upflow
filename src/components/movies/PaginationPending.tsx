"use client";

import { useLinkStatus } from "next/link";

/**
 * Indicador de carregamento do link de paginação. Ilha client mínima: só existe no client o
 * `useLinkStatus`, e ele exige ser descendente do `Link`. O ponto fica fora do fluxo (absoluto,
 * na folga do `px-5`; o link precisa ser `relative`), para o botão manter a largura e o rótulo
 * continuar centrado com ou sem indicador.
 */
export function PaginationPending() {
  const { pending } = useLinkStatus();

  return (
    <>
      <span
        aria-hidden="true"
        data-pending={pending}
        className={`absolute right-1.5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-current ${pending ? "animate-pulse" : "invisible"}`}
      />
      {pending ? <span className="sr-only">Carregando…</span> : null}
    </>
  );
}
