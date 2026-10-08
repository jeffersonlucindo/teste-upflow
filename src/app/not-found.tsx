import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

/** Rota sem correspondência e ids de filme inválidos (src/proxy.ts), dentro do layout raiz. */
export default function NotFound() {
  return (
    <EmptyState
      icon="search"
      headingLevel={1}
      title="Página não encontrada"
      description="O endereço pode estar errado."
      action={{ label: "Voltar à listagem", href: "/" }}
    />
  );
}
