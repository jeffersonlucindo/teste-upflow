"use client";

import { ErrorState, type ErrorStateProps } from "@/components/ui/ErrorState";

export default function ErrorPage({ error, reset }: Pick<ErrorStateProps, "error" | "reset">) {
  return <ErrorState error={error} reset={reset} />;
}
