import { parseListingParams } from "@/lib/listing/params";

export const LISTING_TITLE_CLASS = "font-display text-4xl font-extrabold tracking-tight";

export interface ListingTitleProps {
  searchParams: PageProps<"/">["searchParams"];
}

/** `h1` da listagem: segue a URL (busca ou populares). Lê `searchParams`, então fica sob Suspense. */
export async function ListingTitle({ searchParams }: ListingTitleProps) {
  const { query } = parseListingParams(await searchParams);

  return (
    <h1 className={LISTING_TITLE_CLASS}>
      {query !== null ? "Resultados da busca" : "Filmes populares"}
    </h1>
  );
}
