import type { CastMember } from "@/lib/tmdb/types";

import { CastCard } from "./CastCard";

/** Duas colunas no celular; do `sm` em diante, quantas couberem com 140 px. O skeleton usa a mesma grade. */
export const castGridClassName =
  "grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]";

export interface CastListProps {
  /** Já ordenado e limitado ao elenco principal pelo mapeador. */
  cast: CastMember[];
}

/** Sem elenco a seção inteira some, inclusive o título. */
export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-bold">Elenco principal</h2>
      {/* role="list" devolve a semântica de lista que o Safari remove com list-style: none. */}
      <ul role="list" className={castGridClassName}>
        {cast.map((member) => (
          <li key={member.id}>
            <CastCard member={member} />
          </li>
        ))}
      </ul>
    </section>
  );
}
