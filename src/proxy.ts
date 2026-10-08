import { NextResponse, type NextRequest } from "next/server";

import { parseMovieId } from "@/lib/tmdb/parseMovieId";

/** Caminho que nenhuma rota atende: o Next responde 404 com o not-found.tsx da raiz. */
const NO_ROUTE = "/_nao-encontrado";

/**
 * 404 de verdade para id de filme inválido (D46). Dentro do detalhe, `notFound()` roda depois de
 * a resposta começar a ser transmitida e o status já saiu como 200. Aqui o id é conferido antes
 * de qualquer render, com a mesma função do MovieDetails e sem consultar o TMDB.
 */
export function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2];
  if (parseMovieId(id) !== null) return NextResponse.next();

  return NextResponse.rewrite(new URL(NO_ROUTE, request.url));
}

// O matcher precisa ser constante: o Next o lê em tempo de build.
export const config = {
  matcher: "/movie/:id",
};
