import type { Metadata } from "next";

// O title.template do layout raiz só vale para segmentos filhos; a home está no mesmo
// segmento do layout, então declara o título completo.
export const metadata: Metadata = {
  title: { absolute: "Filmes populares · Catálogo." },
};

export default function HomePage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Filmes populares</h1>
      <p className="text-text-muted">A listagem de filmes chega no change listagem-filmes.</p>
    </section>
  );
}
