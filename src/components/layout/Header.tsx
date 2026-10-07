import Link from "next/link";

import { FavoritesBadge } from "@/components/favorites/FavoritesBadge";

import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="border-b border-border-subtle">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-10"
      >
        <Link href="/" className="font-display text-xl font-extrabold text-text-primary">
          Catálogo<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <NavLink href="/">Explorar</NavLink>
          <NavLink href="/favoritos">
            Favoritos
            <FavoritesBadge />
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
