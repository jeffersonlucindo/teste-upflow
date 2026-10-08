import type { MovieTrailer } from "@/lib/tmdb/types";

export interface TrailerEmbedProps {
  /** Já escolhido por pickTrailer (sempre YouTube); null quando o filme não tem trailer. */
  trailer: MovieTrailer | null;
}

/** youtube-nocookie.com: o player não grava cookie antes do play. */
export function trailerEmbedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}`;
}

/** Sem trailer a seção inteira some, inclusive o título. */
export function TrailerEmbed({ trailer }: TrailerEmbedProps) {
  if (trailer === null) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-bold">Trailer</h2>
      <div className="aspect-video max-w-[800px] overflow-hidden rounded-xl border border-border-subtle bg-surface-100">
        <iframe
          src={trailerEmbedUrl(trailer.key)}
          title={`Trailer: ${trailer.name}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
