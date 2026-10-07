import { backHref } from "@/lib/listing/backHref";

import { BackLink } from "./BackLink";

export interface BackLinkLoaderProps {
  searchParams: PageProps<"/movie/[id]">["searchParams"];
}

/** Único ponto do detalhe que lê a query string: o await fica sob o Suspense da página, fora do shell. */
export async function BackLinkLoader({ searchParams }: BackLinkLoaderProps) {
  const { from } = await searchParams;

  return <BackLink href={backHref(from)} />;
}
