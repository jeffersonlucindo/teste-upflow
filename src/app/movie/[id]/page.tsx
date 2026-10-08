import { Suspense } from "react";
import type { Metadata } from "next";

import { BackLink } from "@/components/movie-detail/BackLink";
import { BackLinkLoader } from "@/components/movie-detail/BackLinkLoader";
import { DetailSkeleton } from "@/components/movie-detail/DetailSkeleton";
import { MovieDetails } from "@/components/movie-detail/MovieDetails";
import { getMovieDetail } from "@/lib/tmdb/client";
import { parseMovieId } from "@/lib/tmdb/parseMovieId";

const NOT_FOUND_TITLE = "Filme não encontrado";

// Mesma chamada do MovieDetails: o Next a memoiza no render, então é uma requisição só ao TMDB.
export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseMovieId(id);
  if (movieId === null) return { title: NOT_FOUND_TITLE };

  try {
    // null é o filme que o TMDB não tem: mesmo título do id inválido, igual à tela.
    const movie = await getMovieDetail(movieId);
    return { title: movie?.title ?? NOT_FOUND_TITLE };
  } catch {
    // O título nunca é a origem do erro: quem o mostra é o MovieDetails, pelo error.tsx.
    return { title: "Filme" };
  }
}

// A página não lê a URL: as duas Promises descem, cada uma para o seu Suspense, e o shell
// (link de volta para "/" e skeleton) continua estático.
export default function MoviePage({ params, searchParams }: PageProps<"/movie/[id]">) {
  return (
    <article className="flex flex-col gap-6">
      <Suspense fallback={<BackLink href="/" />}>
        <BackLinkLoader searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<DetailSkeleton />}>
        <MovieDetails params={params} />
      </Suspense>
    </article>
  );
}
