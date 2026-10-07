import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { formatRating } from "@/lib/format/rating";
import { releaseYear } from "@/lib/format/releaseYear";
import { POSTER_SIZE, posterUrl } from "@/lib/tmdb/images";
import type { MovieSummary } from "@/lib/tmdb/types";

export interface MovieCardData {
  id: number;
  title: string;
  // Como vieram da API: o snapshot de favoritos é montado com eles.
  posterPath: string | null;
  releaseDate: string | null;
  // Derivados para o card.
  posterUrl: string | null;
  releaseYear: number | null;
  voteAverage: number;
  voteCount: number;
}

export interface MovieCardProps {
  movie: MovieCardData;
  /** Query string da listagem (sem "?") para o detalhe saber para onde voltar. */
  from?: string;
}

export function toMovieCardData(movie: MovieSummary): MovieCardData {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    posterUrl: posterUrl(movie.posterPath, POSTER_SIZE.card),
    releaseYear: releaseYear(movie.releaseDate),
    voteAverage: movie.voteAverage,
    voteCount: movie.voteCount,
  };
}

/** Sem diretiva e sem import server-only: é renderizado pela listagem (servidor) e pelos favoritos (client). */
export function MovieCard({ movie, from }: MovieCardProps) {
  const href = from
    ? `/movie/${movie.id}?from=${encodeURIComponent(from)}`
    : `/movie/${movie.id}`;
  const rating = formatRating(movie.voteAverage, movie.voteCount);
  const meta = movie.releaseYear === null ? rating : `${rating} · ${movie.releaseYear}`;

  return (
    <article className="flex flex-col gap-3">
      {/* Sem overflow-hidden: ele cortaria o anel de foco do link. Quem arredonda é a imagem. */}
      <div className="relative aspect-[2/3] rounded-xl bg-surface-200">
        <Link
          href={href}
          aria-label={`Ver detalhes de ${movie.title}`}
          className="absolute inset-0 flex items-center justify-center rounded-xl"
        >
          {movie.posterUrl ? (
            // alt vazio: o link já tem o título como nome acessível.
            <Image
              src={movie.posterUrl}
              alt=""
              fill
              sizes="(max-width: 639px) 50vw, 220px"
              className="rounded-xl object-cover"
            />
          ) : (
            <span aria-hidden="true" className="text-xs text-text-subtle">
              Pôster
            </span>
          )}
        </Link>
        {/* Irmão do <Link>, nunca dentro dele: botão dentro de link é HTML inválido. */}
        <FavoriteButton movie={movie} variant="icon" />
      </div>
      <div className="flex flex-col gap-1">
        <Link
          href={href}
          className="text-[15px] font-semibold text-text-primary hover:text-accent"
        >
          {movie.title}
        </Link>
        <span className="text-[13px] text-text-muted">{meta}</span>
      </div>
    </article>
  );
}
