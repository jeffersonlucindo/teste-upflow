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
        <Header />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-8 pb-14 sm:px-10">{children}</main>
      </body>
    </html>
  );
}
