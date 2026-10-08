import "server-only";

import { TmdbError, errorKindFromStatus, type TmdbErrorKind } from "./errors";
import { toGenres, toListingResult, toMovieDetail } from "./mappers";
import { buildListingRequest, todayUtc, videoLanguages } from "./params";
import type {
  Genre,
  ListingQuery,
  ListingResult,
  MovieDetail,
  TmdbGenreListDto,
  TmdbMovieDetailDto,
  TmdbMovieListItemDto,
  TmdbPagedDto,
} from "./types";

export const TMDB_API_BASE = "https://api.themoviedb.org/3";
/** Usado quando TMDB_LANGUAGE não está definida. */
export const DEFAULT_LANGUAGE = "pt-BR";

// Segundos. O cache é só o do fetch, o único mecanismo honrado com e sem cacheComponents.
export const REVALIDATE_GENRES = 86_400;
export const REVALIDATE_LISTING = 3_600;
export const REVALIDATE_DETAIL = 3_600;

export const DETAIL_APPEND = "credits,videos,translations";

interface TmdbConfig {
  token: string;
  language: string;
}

/** Lido a cada chamada, nunca no escopo do módulo: o build passa sem .env.local. */
function readConfig(): TmdbConfig {
  const token = process.env.TMDB_API_READ_TOKEN?.trim();
  if (!token) {
    throw new TmdbError(
      "config",
      "Defina TMDB_API_READ_TOKEN em .env.local (API Read Access Token v4 do TMDB).",
    );
  }

  return { token, language: process.env.TMDB_LANGUAGE?.trim() || DEFAULT_LANGUAGE };
}

function httpErrorMessage(kind: TmdbErrorKind, path: string, status: number): string {
  switch (kind) {
    case "unauthorized":
      return `TMDB recusou o token (HTTP ${status}).`;
    case "not_found":
      return `TMDB não encontrou ${path} (HTTP ${status}).`;
    case "rate_limited":
      return `TMDB limitou as requisições (HTTP ${status}).`;
    default:
      return `TMDB indisponível (HTTP ${status}).`;
  }
}

async function tmdbFetch<T>(
  config: TmdbConfig,
  path: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<T> {
  const url = new URL(TMDB_API_BASE + path);
  // A URL é a chave do cache: language primeiro e o resto na ordem recebida.
  url.search = new URLSearchParams({ language: config.language, ...params }).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
      // Requisição com Authorization só entra no cache do Next com force-cache explícito.
      cache: "force-cache",
      next: { revalidate },
    });
  } catch (error) {
    // Só falha de rede; os erros de controle que o Next lança dentro do fetch seguem adiante.
    if (error instanceof TypeError) {
      throw new TmdbError("unavailable", "Falha de rede ao chamar o TMDB.", { cause: error });
    }
    throw error;
  }

  if (!response.ok) {
    const kind = errorKindFromStatus(response.status);
    throw new TmdbError(kind, httpErrorMessage(kind, path, response.status), {
      status: response.status,
    });
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new TmdbError("unavailable", "TMDB devolveu uma resposta que não é JSON.", {
      status: response.status,
      cause: error,
    });
  }
}

/** Gêneros no idioma de TMDB_LANGUAGE. Quem chama faz `await connection()` antes. */
export async function getGenres(): Promise<Genre[]> {
  return toGenres(
    await tmdbFetch<TmdbGenreListDto>(readConfig(), "/genre/movie/list", {}, REVALIDATE_GENRES),
  );
}

/**
 * Página da listagem: busca por título quando há `query`, senão discover com gênero e ordenação.
 * Página além do total volta com `movies: []`; a tela decide o que mostrar.
 */
export async function fetchListing(query: ListingQuery): Promise<ListingResult> {
  const { path, params } = buildListingRequest(query, todayUtc());

  return toListingResult(
    await tmdbFetch<TmdbPagedDto<TmdbMovieListItemDto>>(
      readConfig(),
      path,
      params,
      REVALIDATE_LISTING,
    ),
  );
}

/** Detalhe com elenco, vídeos e traduções em uma chamada. Devolve null quando o filme não existe. */
export async function getMovieDetail(id: number): Promise<MovieDetail | null> {
  const config = readConfig();

  try {
    const dto = await tmdbFetch<TmdbMovieDetailDto>(
      config,
      `/movie/${id}`,
      { append_to_response: DETAIL_APPEND, include_video_language: videoLanguages(config.language) },
      REVALIDATE_DETAIL,
    );

    return toMovieDetail(dto, config.language);
  } catch (error) {
    if (error instanceof TmdbError && error.kind === "not_found") return null;
    throw error;
  }
}
