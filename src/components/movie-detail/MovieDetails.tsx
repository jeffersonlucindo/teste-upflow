import { notFound } from "next/navigation";

import { getMovieDetail } from "@/lib/tmdb/client";
import { parseMovieId } from "@/lib/tmdb/parseMovieId";

import { CastList } from "./CastList";
import { MovieHeader } from "./MovieHeader";
import { Overview } from "./Overview";
import { TrailerEmbed } from "./TrailerEmbed";

export interface MovieDetailsProps {
  params: PageProps<"/movie/[id]">["params"];
}

/** Único ponto do detalhe que lê o id e busca o filme: o await mantém os dois fora do shell. */
export async function MovieDetails({ params }: MovieDetailsProps) {
  const { id } = await params;

  // Id que não é um inteiro positivo nem chega ao TMDB.
  const movieId = parseMovieId(id);
  if (movieId === null) notFound();

  // null é o 404 do TMDB; os demais erros sobem para o error.tsx do segmento.
  const movie = await getMovieDetail(movieId);
  if (!movie) notFound();

  return (
    <MovieHeader movie={movie}>
      <Overview overview={movie.overview} />
      <CastList cast={movie.cast} />
      <TrailerEmbed trailer={movie.trailer} />
    </MovieHeader>
  );
}
