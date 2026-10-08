import { languageName } from "@/lib/format/languageName";
import type { MovieOverview } from "@/lib/tmdb/types";

export interface OverviewProps {
  /** Já escolhida por pickOverview; null quando o filme não tem sinopse em nenhum idioma. */
  overview: MovieOverview | null;
}

/** Idioma do documento (`<html lang="pt-BR">`): só o texto em outro idioma precisa de `lang`. */
const DOCUMENT_LANGUAGE = "pt";

/** Aviso para a sinopse que não veio no idioma pedido (TMDB_LANGUAGE); null quando veio. */
export function overviewNotice({ language, fallback }: MovieOverview): string | null {
  if (!fallback) return null;

  return `Sinopse disponível apenas em ${languageName(language) ?? "outro idioma"}.`;
}

/** A seção existe sempre: sem sinopse, ela informa a ausência em vez de sumir. */
export function Overview({ overview }: OverviewProps) {
  const notice = overview ? overviewNotice(overview) : null;

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
            lang={overview.language === DOCUMENT_LANGUAGE ? undefined : overview.language}
            className="max-w-[720px] leading-relaxed text-text-secondary"
          >
            {overview.text}
          </p>
        </>
      )}
    </section>
  );
}
