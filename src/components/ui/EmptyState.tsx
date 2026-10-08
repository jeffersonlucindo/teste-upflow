import type { ReactNode } from "react";

import { Button, ButtonLink } from "./Button";

export type EmptyStateIcon = "search" | "heart" | "alert" | "film";

export type EmptyStateAction =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

export interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** Nível do título. 1 só nas telas que substituem a página inteira (erro, não encontrado). */
  headingLevel?: 1 | 2;
}

// Um desenho por nome, para os estados excepcionais terem o mesmo tamanho e o mesmo traço.
const ICONS: Record<EmptyStateIcon, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  heart: (
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.8 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21" />
    </>
  ),
};

/** Padrão único dos estados excepcionais: busca vazia, favoritos vazio, erro e não encontrado. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface-100 px-6 py-16 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-text-muted"
      >
        {ICONS[icon]}
      </svg>
      <Heading className="text-base font-semibold text-text-primary">{title}</Heading>
      {description ? <p className="text-text-muted">{description}</p> : null}
      {action ? (
        "href" in action ? (
          <ButtonLink variant="primary" href={action.href}>
            {action.label}
          </ButtonLink>
        ) : (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
