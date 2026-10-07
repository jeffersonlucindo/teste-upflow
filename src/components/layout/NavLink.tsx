"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};

const BASE = "inline-flex min-h-11 items-center gap-2 rounded-lg px-4";
const ACTIVE = "bg-surface-100 font-semibold text-text-primary";
const INACTIVE = "font-medium text-text-muted hover:text-text-primary";

/** "/" só é ativo por igualdade exata; os demais também valem para as rotas filhas. */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinkAnchor({ href, children, isActive }: NavLinkProps & { isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
    >
      {children}
    </Link>
  );
}

function CurrentNavLink({ href, children }: NavLinkProps) {
  return (
    <NavLinkAnchor href={href} isActive={isActivePath(usePathname(), href)}>
      {children}
    </NavLinkAnchor>
  );
}

/**
 * Ilha client do header: precisa do pathname para marcar a rota atual. Numa rota com parâmetro
 * dinâmico o pathname só existe na requisição, então o shell leva o link sem marca (o fallback).
 */
export function NavLink({ href, children }: NavLinkProps) {
  return (
    <Suspense
      fallback={
        <NavLinkAnchor href={href} isActive={false}>
          {children}
        </NavLinkAnchor>
      }
    >
      <CurrentNavLink href={href}>{children}</CurrentNavLink>
    </Suspense>
  );
}
