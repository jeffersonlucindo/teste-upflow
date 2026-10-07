import { languageName } from "@/lib/format/languageName";
import type { MovieOverview } from "@/lib/tmdb/types";

export interface OverviewProps {
  /** Já escolhida por pickOverview; null quando o filme não tem sinopse em nenhum idioma. */
  overview: MovieOverview | null;
}

/** Aviso para a sinopse que não está em português; null quando está. */
export function overviewNotice(language: string): string | null {
  if (language === "pt") return null;

  return `Sinopse disponível apenas em ${languageName(language) ?? "outro idioma"}.`;
}

/** A seção existe sempre: sem sinopse, ela informa a ausência em vez de sumir. */
export function Overview({ overview }: OverviewProps) {
  const notice = overview ? overviewNotice(overview.language) : null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xl font-bold">Sinopse</h2>
      {overview === null ? (
        <p className="text-text-muted">Sinopse não disponível.</p>
      ) : (
        <>
          {/* Antes do texto: quem usa leitor de tela sabe o idioma antes de ouvir o parágrafo. */}
          {notice ? <p className="text-[13px] text-text-muted">{notice}</p> : null}
          <p
            lang={notice ? overview.language : undefined}
            className="max-w-[720px] leading-relaxed text-text-secondary"
          >
            {overview.text}
          </p>
        </>
      )}
    </section>
  );
}
