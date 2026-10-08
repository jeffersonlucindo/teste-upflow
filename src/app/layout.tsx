import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";

import { body, heading } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Catálogo.",
    template: "%s · Catálogo.",
  },
  description: "Catálogo de filmes com dados do TMDB: explore, busque e salve seus favoritos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${heading.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only rounded-lg bg-surface-100 font-semibold text-text-primary focus:not-sr-only focus:px-4 focus:py-3 focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-8 pb-14 focus:outline-none sm:px-10"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
