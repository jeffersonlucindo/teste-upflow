import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus favoritos",
};

export default function FavoritosPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Meus favoritos</h1>
        <p className="text-text-muted">Os filmes salvos ficam neste navegador.</p>
      </div>
    </section>
  );
}
