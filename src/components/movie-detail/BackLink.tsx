import Link from "next/link";

export interface BackLinkProps {
  /** "/" ou a URL da listagem de onde o usuário veio, já validada por backHref. */
  href: string;
}

export function BackLink({ href }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 self-start font-medium text-text-muted hover:text-accent"
    >
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
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Voltar à listagem
    </Link>
  );
}
