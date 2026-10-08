import { formatRating } from "@/lib/format/rating";

export interface RatingChipProps {
  voteAverage: number;
  voteCount: number;
}

/** Não é controle: a altura de 44 px só alinha o chip com o botão de favorito ao lado. */
export function RatingChip({ voteAverage, voteCount }: RatingChipProps) {
  return (
    <span className="inline-flex min-h-11 items-center rounded-lg bg-surface-200 px-4 font-semibold text-text-primary">
      {formatRating(voteAverage, voteCount)}
    </span>
  );
}
