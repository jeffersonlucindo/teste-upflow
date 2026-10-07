import { connection } from "next/server";

import { getGenres } from "@/lib/tmdb/client";

import { FilterBar } from "./FilterBar";

export async function FilterBarLoader() {
  // Os gêneros não dependem da URL: sem isto o fetch entraria no shell e rodaria no build.
  await connection();
  const genres = await getGenres();

  return <FilterBar genres={genres} />;
}
