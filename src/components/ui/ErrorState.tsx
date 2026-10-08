"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "./EmptyState";

export interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

/** Conteúdo dos error.tsx. Em produção o Next troca a mensagem de erros do servidor por um digest. */
export function ErrorState({
  error,
  reset,
  title = "Não foi possível carregar os filmes",
}: ErrorStateProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // O erro veio de um Server Component: só limpar a fronteira repetiria o mesmo resultado.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <EmptyState
      icon="alert"
      headingLevel={1}
      title={title}
      description={
        process.env.NODE_ENV === "development" ? error.message : "Tente novamente em instantes."
      }
      action={{ label: "Tentar novamente", onClick: retry }}
    />
  );
}
