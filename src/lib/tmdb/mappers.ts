import { MAX_PAGE } from "./params";
import { pickOverview } from "./pickOverview";
import { pickTrailer } from "./pickTrailer";
import type {
  CastMember,
  Genre,
  ListingResult,
  MovieDetail,
  MovieSummary,
  TmdbCastDto,
  TmdbGenreDto,
  TmdbGenreListDto,
  TmdbMovieDetailDto,
  TmdbMovieListItemDto,
  TmdbPagedDto,
} from "./types";

/** Tamanho do elenco principal exibido no detalhe. */
export const MAIN_CAST_LIMIT = 8;

export function toGenre(dto: TmdbGenreDto): Genre {
  return { id: dto.id, name: dto.name };
}

export function toGenres(dto: TmdbGenreListDto): Genre[] {
  return dto.genres.map(toGenre);
}

export function toMovieSummary(dto: TmdbMovieListItemDto): MovieSummary {
  return {
    id: dto.id,
    title: dto.title,
    posterPath: dto.poster_path ?? null,
    voteAverage: dto.vote_average,
    voteCount: dto.vote_count,
    // A API manda "" quando o filme não tem data.
    releaseDate: dto.release_date || null,
  };
}

export function toListingResult(dto: TmdbPagedDto<TmdbMovieListItemDto>): ListingResult {
  return {
    movies: dto.results.map(toMovieSummary),
    page: dto.page,
    // Busca sem resultado vem com total_pages 0; a paginação mostra "Página 1 de 1".
    totalPages: Math.min(Math.max(dto.total_pages, 1), MAX_PAGE),
    totalResults: dto.total_results,
  };
}

export function toCastMember(dto: TmdbCastDto): CastMember {
  return {
    id: dto.id,
    name: dto.name,
    character: dto.character,
    profilePath: dto.profile_path ?? null,
    order: dto.order,
  };
}

export function toMovieDetail(dto: TmdbMovieDetailDto, requestedLanguage: string): MovieDetail {
  return {
    id: dto.id,
    title: dto.title,
    posterPath: dto.poster_path ?? null,
    releaseDate: dto.release_date || null,
    runtime: dto.runtime || null,
    genres: dto.genres.map(toGenre),
    voteAverage: dto.vote_average,
    voteCount: dto.vote_count,
    overview: pickOverview(dto, requestedLanguage),
    cast: [...(dto.credits?.cast ?? [])]
      .sort((a, b) => a.order - b.order)
      .slice(0, MAIN_CAST_LIMIT)
      .map(toCastMember),
    trailer: pickTrailer(dto.videos?.results),
  };
}
