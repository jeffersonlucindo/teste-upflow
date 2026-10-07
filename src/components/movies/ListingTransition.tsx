"use client";

import {
  createContext,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

interface ListingTransitionValue {
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

const ListingTransitionContext = createContext<ListingTransitionValue | null>(null);

/**
 * Compartilha a transição de navegação entre a barra de filtros, que a dispara, e a região dos
 * resultados, que a sinaliza. As duas ficam em <Suspense> irmãos, por isso o Context.
 */
export function ListingTransition({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const value = useMemo(() => ({ isPending, startTransition }), [isPending, startTransition]);

  return <ListingTransitionContext value={value}>{children}</ListingTransitionContext>;
}

/** Mantém os resultados anteriores visíveis, esmaecidos, até os novos chegarem. */
export function ListingTransitionRegion({ children }: { children: ReactNode }) {
  const { isPending } = useListingTransition();

  return (
    <>
      {/* Fora da região: anúncio dentro de uma subárvore aria-busy pode ser adiado ou suprimido. */}
      <p role="status" className="sr-only">
        {isPending ? "Atualizando resultados…" : ""}
      </p>
      <div
        aria-busy={isPending}
        className={`flex flex-col gap-6 transition-opacity${isPending ? " opacity-60" : ""}`}
      >
        {children}
      </div>
    </>
  );
}

/** Fora do provider devolve uma transição local: quem usa continua funcional sozinho. */
export function useListingTransition(): ListingTransitionValue {
  const shared = useContext(ListingTransitionContext);
  const [isPending, startTransition] = useTransition();

  return shared ?? { isPending, startTransition };
}
