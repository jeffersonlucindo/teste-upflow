import { ButtonLink, buttonClassName, type ButtonVariant } from "@/components/ui/Button";

import { PaginationPending } from "./PaginationPending";

export interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

/** Links para a página anterior e a próxima: funciona sem JavaScript e não é ilha client. */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-4">
      {page > 1 ? (
        <ButtonLink variant="outline" href={hrefFor(page - 1)} rel="prev" className="relative">
          Anterior
          <PaginationPending />
        </ButtonLink>
      ) : (
        <DisabledLink variant="outline">Anterior</DisabledLink>
      )}
      <span className="text-text-muted">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <ButtonLink variant="primary" href={hrefFor(page + 1)} rel="next" className="relative">
          Próxima
          <PaginationPending />
        </ButtonLink>
      ) : (
        <DisabledLink variant="primary">Próxima</DisabledLink>
      )}
    </nav>
  );
}

/** No limite não há destino: um texto com cara de botão, e não um controle que nunca faz nada. */
function DisabledLink({ variant, children }: { variant: ButtonVariant; children: string }) {
  return (
    <span
      aria-disabled="true"
      className={`${buttonClassName(variant)} cursor-not-allowed opacity-50`}
    >
      {children}
    </span>
  );
}
