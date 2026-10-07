import { EmptyState } from "@/components/ui/EmptyState";

export default function MovieNotFound() {
  return (
    <EmptyState
      icon="film"
      title="Filme não encontrado"
      description="O endereço pode estar errado ou o filme não existe no TMDB."
      action={{ label: "Voltar à listagem", href: "/" }}
    />
  );
}
