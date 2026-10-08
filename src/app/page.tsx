import { Suspense } from "react";
import type { Metadata } from "next";

import { FilterBar } from "@/components/movies/FilterBar";
import { FilterBarLoader } from "@/components/movies/FilterBarLoader";
import { LISTING_TITLE_CLASS, ListingTitle } from "@/components/movies/ListingTitle";
import { ListingTransition, ListingTransitionRegion } from "@/components/movies/ListingTransition";
import { MovieGridSkeleton } from "@/components/movies/MovieGridSkeleton";
import { MovieResults } from "@/components/movies/MovieResults";

// O title.template do layout raiz só vale para segmentos filhos; a home está no mesmo
// segmento do layout, então declara o título completo.
export const metadata: Metadata = {
  title: { absolute: "Filmes populares · Catálogo." },
};

// A página não lê a URL: a Promise desce para MovieResults e o shell (título, barra e
// skeleton) continua estático.
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <section className="flex flex-col gap-6">
      <Suspense fallback={<h1 className={LISTING_TITLE_CLASS}>Filmes populares</h1>}>
        <ListingTitle searchParams={searchParams} />
      </Suspense>
      <ListingTransition>
        <Suspense fallback={<FilterBar genres={[]} disabled />}>
          <FilterBarLoader />
        </Suspense>
        <ListingTransitionRegion>
          <Suspense fallback={<MovieGridSkeleton />}>
            <MovieResults searchParams={searchParams} />
          </Suspense>
        </ListingTransitionRegion>
      </ListingTransition>
    </section>
  );
}
