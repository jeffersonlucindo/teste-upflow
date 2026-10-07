"use client";

import {
  useEffect,
  useId,
  useOptimistic,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
  type Ref,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_LISTING_QUERY,
  buildListingHref,
  parseListingParams,
} from "@/lib/listing/params";
import { LISTING_SORTS } from "@/lib/tmdb/params";
import type { Genre, ListingQuery, ListingSort } from "@/lib/tmdb/types";

import { useListingTransition } from "./ListingTransition";

export const SEARCH_DEBOUNCE_MS = 350;

export interface FilterBarProps {
  genres: Genre[];
  /** Fallback do Suspense: os três controles desabilitados, sem ler a URL. */
  disabled?: boolean;
}

const SORT_LABELS: Record<ListingSort, string> = {
  popularity: "Popularidade",
  rating: "Nota",
  release: "Data de lançamento",
};

const LABEL = "flex flex-col gap-2 text-[13px] font-semibold text-text-muted";
const CONTROL =
  "h-11 w-full rounded-lg border border-border-subtle bg-surface-100 px-4 text-sm text-text-primary disabled:cursor-not-allowed disabled:opacity-60";

/** Ilha client da listagem: lê a URL por conta própria e a reescreve a cada mudança. */
export function FilterBar({ genres, disabled = false }: FilterBarProps) {
  // Dois componentes, e não um hook condicional: o fallback é prerenderizado e não pode ler a URL.
  return disabled ? (
    <FilterBarFields genres={genres} current={DEFAULT_LISTING_QUERY} disabled />
  ) : (
    <LiveFilterBar genres={genres} />
  );
}

function LiveFilterBar({ genres }: { genres: Genre[] }) {
  const searchParams = useSearchParams();
  const url = searchParams.toString();
  const current = parseListingParams(searchParams);
  const router = useRouter();
  const { isPending, startTransition } = useListingTransition();
  const hintId = useId();
  // A URL só muda quando a navegação termina; até lá os selects mostram o que foi escolhido.
  const [shown, showOptimistic] = useOptimistic(current);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Última busca que este componente pôs na URL ou leu dela.
  const committedRef = useRef(current.query);
  // Última URL com a qual o campo foi conferido.
  const syncedUrlRef = useRef(url);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // A URL mudou por fora (voltar, avançar, link) ou uma busca enviada foi superada por outra
  // navegação: o campo acompanha a URL. A conferência acontece a cada URL nova, depois que a
  // navegação daqui assenta, e não só quando `q` muda: a busca superada deixa `q` como estava.
  // Escrever no DOM, e não em estado, preserva o que foi digitado entre o envio de uma busca e
  // a chegada da nova URL.
  useEffect(() => {
    if (isPending || url === syncedUrlRef.current) return;

    syncedUrlRef.current = url;
    if (current.query === committedRef.current) return;

    clearTimeout(timerRef.current);
    committedRef.current = current.query;
    if (inputRef.current) inputRef.current.value = current.query ?? "";
  }, [url, current.query, isPending]);

  function commitQuery(value: string) {
    const query = value.trim() || null;
    if (query === committedRef.current) return;

    committedRef.current = query;
    // A busca não combina com gênero nem ordenação: o destino só depende do texto.
    const href = buildListingHref({ ...DEFAULT_LISTING_QUERY, query });
    startTransition(() => router.replace(href, { scroll: false }));
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitQuery(value), SEARCH_DEBOUNCE_MS);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timerRef.current);
    commitQuery(inputRef.current?.value ?? "");
  }

  // Filtro novo sempre volta à primeira página.
  function pushFilter(change: Partial<ListingQuery>) {
    // Parte do que está na tela: duas escolhas seguidas se somam antes de a primeira chegar.
    const next = { ...shown, ...change, page: 1 };
    startTransition(() => {
      showOptimistic(next);
      router.push(buildListingHref(next));
    });
  }

  return (
    <FilterBarFields
      genres={genres}
      current={shown}
      busy={isPending}
      hintId={hintId}
      inputRef={inputRef}
      onSubmit={handleSubmit}
      onQueryChange={handleQueryChange}
      onGenreChange={(event) => {
        const { value } = event.currentTarget;
        pushFilter({ genreId: value ? Number(value) : null });
      }}
      onSortChange={(event) => pushFilter({ sort: event.currentTarget.value as ListingSort })}
    />
  );
}

interface FilterBarFieldsProps {
  genres: Genre[];
  current: ListingQuery;
  disabled?: boolean;
  busy?: boolean;
  hintId?: string;
  inputRef?: Ref<HTMLInputElement>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onQueryChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onGenreChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSortChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

/** Marcação da barra, sem hooks. Com `name` e `action`, Enter funciona mesmo sem JavaScript. */
function FilterBarFields({
  genres,
  current,
  disabled = false,
  busy = false,
  hintId,
  inputRef,
  onSubmit,
  onQueryChange,
  onGenreChange,
  onSortChange,
}: FilterBarFieldsProps) {
  // Com busca preenchida, gênero e ordenação não se aplicam.
  const searchMode = current.query !== null;
  const selectsDisabled = disabled || searchMode;
  const describedBy = searchMode ? hintId : undefined;

  return (
    <form
      role="search"
      action="/"
      method="get"
      aria-busy={busy}
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-4"
    >
      <label className={`${LABEL} flex-1 basis-80`}>
        Buscar por título
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={current.query ?? ""}
          placeholder="Digite o nome de um filme"
          autoComplete="off"
          enterKeyHint="search"
          disabled={disabled}
          onChange={onQueryChange}
          className={`${CONTROL} font-normal`}
        />
      </label>

      <label className={`${LABEL} min-w-0 flex-1 basis-36 sm:flex-initial sm:basis-52`}>
        Gênero
        <Select
          name="genre"
          value={current.genreId ?? ""}
          disabled={selectsDisabled}
          aria-describedby={describedBy}
          onChange={onGenreChange}
        >
          {disabled ? (
            <option value="">Carregando gêneros…</option>
          ) : (
            <>
              <option value="">Todos</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </>
          )}
        </Select>
      </label>

      <label className={`${LABEL} min-w-0 flex-1 basis-36 sm:flex-initial sm:basis-52`}>
        Ordenar por
        <Select
          name="sort"
          value={current.sort}
          disabled={selectsDisabled}
          aria-describedby={describedBy}
          onChange={onSortChange}
        >
          {LISTING_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </Select>
      </label>

      {searchMode ? (
        <p id={hintId} className="basis-full text-[13px] font-normal text-text-muted">
          Gênero e ordenação não se aplicam à busca por título (limitação da API).
        </p>
      ) : null}
    </form>
  );
}

function Select({ children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select className={`${CONTROL} appearance-none pr-10 font-medium`} {...props}>
        {children}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute top-3.5 right-3.5 text-text-muted"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
