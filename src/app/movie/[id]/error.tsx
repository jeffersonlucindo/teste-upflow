"use client";

import { ErrorState, type ErrorStateProps } from "@/components/ui/ErrorState";

export default function MovieError({ error, reset }: Pick<ErrorStateProps, "error" | "reset">) {
  return <ErrorState error={error} reset={reset} title="Não foi possível carregar o filme" />;
}
