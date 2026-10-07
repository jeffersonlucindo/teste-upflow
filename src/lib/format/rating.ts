const voteAverageFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 7.2 → "7,2" · 8 → "8,0" */
export function formatVoteAverage(value: number): string {
  return voteAverageFormat.format(value);
}

/** Sem votos a média da API é 0, que não é uma nota: a UI diz "Sem nota". */
export function formatRating(voteAverage: number, voteCount: number): string {
  return voteCount === 0 ? "Sem nota" : `Nota ${formatVoteAverage(voteAverage)}`;
}
