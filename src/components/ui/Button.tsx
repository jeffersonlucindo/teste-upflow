import type { ComponentProps } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "outline";

const BASE = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent",
  outline: "border border-border-strong bg-bg-base text-text-primary",
};

/** Classes de botão do Design System (D40). Um lugar só, para botão e link não divergirem. */
export function buttonClassName(variant: ButtonVariant = "primary"): string {
  return `${BASE} ${VARIANTS[variant]}`;
}

function withClassName(variant: ButtonVariant, className?: string): string {
  return className ? `${buttonClassName(variant)} ${className}` : buttonClassName(variant);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={withClassName(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={withClassName(variant, className)} {...props} />;
}
