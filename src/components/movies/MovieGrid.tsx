import { MovieCard, type MovieCardData } from "./MovieCard";

/** Duas colunas no celular; do `sm` em diante, quantas couberem com 200 px. O skeleton usa a mesma grade. */
export const movieGridClassName =
  "grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]";

export interface MovieGridProps {
  movies: MovieCardData[];
  from?: string;
}

export function MovieGrid({ movies, from }: MovieGridProps) {
  return (
    // role="list" devolve a semântica de lista que o Safari remove com list-style: none.
    <ul role="list" className={movieGridClassName}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} from={from} />
        </li>
      ))}
    </ul>
  );
}
