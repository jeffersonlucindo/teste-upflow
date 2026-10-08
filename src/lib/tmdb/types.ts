// Domínio: o que os componentes recebem. Nenhum componente lê o JSON cru da API.

/** Opção do filtro de gênero (FilterBar) e etiqueta do detalhe (MovieHeader). */
export interface Genre {
  id: number;
  name: string;
}

/** Item da listagem (MovieGrid/MovieCard) e base do snapshot de favoritos. */
export interface MovieSummary {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  voteCount: number;
  /** "YYYY-MM-DD" */
  releaseDate: string | null;
}

/** Valores de `sort` na URL da listagem e opções de ordenação do FilterBar. */
export type ListingSort = "popularity" | "rating" | "release";

/** Estado da listagem lido da URL e entregue a fetchListing. */
export interface ListingQuery {
  /** Busca por título; null = sem busca. Com busca, genreId e sort são ignorados. */
  query: string | null;
  /** id de Genre */
  genreId: number | null;
  sort: ListingSort;
  /** Inteiro >= 1; limitado a MAX_PAGE em fetchListing. */
  page: number;
}

/** Página de resultados consumida pela listagem (MovieGrid e Pagination). */
export interface ListingResult {
  movies: MovieSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
}

/** Pessoa do elenco principal (CastList/CastCard). */
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

/** Sinopse escolhida e o idioma dela em ISO 639-1 ("pt", "en", "ja"…), para o Overview. */
export interface MovieOverview {
  text: string;
  language: string;
  /** true quando o texto não veio no idioma pedido (TMDB_LANGUAGE): o Overview avisa. */
  fallback: boolean;
}

/** Trailer do YouTube para o TrailerEmbed. */
export interface MovieTrailer {
  key: string;
  name: string;
}

/** Página de detalhe (MovieHeader, Overview, CastList, TrailerEmbed) e base do snapshot de favoritos. */
export interface MovieDetail {
  id: number;
  title: string;
  posterPath: string | null;
  /** "YYYY-MM-DD" */
  releaseDate: string | null;
  runtime: number | null;
  genres: Genre[];
  voteAverage: number;
  voteCount: number;
  overview: MovieOverview | null;
  cast: CastMember[];
  trailer: MovieTrailer | null;
}

// API v3: só os campos lidos, com os nomes do JSON. Campos extras da resposta são ignorados.

export interface TmdbGenreDto {
  id: number;
  name: string;
}

export interface TmdbGenreListDto {
  genres: TmdbGenreDto[];
}

export interface TmdbPagedDto<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieListItemDto {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  genre_ids?: number[];
}

export interface TmdbCastDto {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCreditsDto {
  cast: TmdbCastDto[];
}

export interface TmdbVideoDto {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
  iso_3166_1: string;
  published_at: string;
}

export interface TmdbVideosDto {
  results: TmdbVideoDto[];
}

export interface TmdbTranslationDto {
  iso_639_1: string;
  iso_3166_1: string;
  data: { overview?: string };
}

export interface TmdbTranslationsDto {
  translations: TmdbTranslationDto[];
}

export interface TmdbMovieDetailDto {
  id: number;
  title: string;
  original_language: string;
  overview: string | null;
  poster_path: string | null;
  release_date?: string;
  runtime: number | null;
  genres: TmdbGenreDto[];
  vote_average: number;
  vote_count: number;
  credits?: TmdbCreditsDto;
  videos?: TmdbVideosDto;
  translations?: TmdbTranslationsDto;
}
