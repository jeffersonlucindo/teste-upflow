import type { ReactNode } from "react";
import Image from "next/image";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { formatMovieMeta } from "@/lib/format/movieMeta";
import { POSTER_SIZE, posterUrl } from "@/lib/tmdb/images";
import type { MovieDetail } from "@/lib/tmdb/types";

import { RatingChip } from "./RatingChip";

export interface MovieHeaderProps {
  movie: MovieDetail;
  /** Seções do detalhe (sinopse, elenco, trailer): ficam na coluna do título, abaixo dele. */
  children?: ReactNode;
}

/** Dono das duas colunas do detalhe; elas empilham sozinhas quando a do texto não cabe ao lado do pôster. */
export function MovieHeader({ movie, children }: MovieHeaderProps) {
  const poster = posterUrl(movie.posterPath, POSTER_SIZE.detail);
  const meta = formatMovieMeta(movie);

  return (
    <div className="flex flex-wrap items-start gap-10">
      <div className="relative aspect-[2/3] w-full max-w-[300px] grow basis-60 overflow-hidden rounded-xl bg-surface-200">
        {poster ? (
          // alt vazio: o h1 ao lado já diz de que filme é o pôster. Pré-carregado por ser a imagem LCP.
          <Image src={poster} alt="" fill sizes="300px" preload className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-xs text-text-subtle"
          >
            Pôster
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 basis-[560px] flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl leading-[1.1] font-extrabold tracking-tight break-words sm:text-[44px]">
            {movie.title}
          </h1>
          {meta ? <p className="text-text-muted">{meta}</p> : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <RatingChip voteAverage={movie.voteAverage} voteCount={movie.voteCount} />
            <FavoriteButton movie={movie} variant="full" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
