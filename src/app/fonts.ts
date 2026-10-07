import localFont from "next/font/local";

/**
 * Fontes self-hosted (D11 em .work/design/decisoes.md).
 *
 * Os arquivos latin em ./fonts/ foram extraídos uma vez dos pacotes
 * @fontsource-variable/plus-jakarta-sans e @fontsource/ibm-plex-sans (OFL-1.1,
 * licenças ao lado dos .woff2). Os pacotes não são dependência do projeto, e nada
 * é baixado no build nem em runtime.
 */
export const heading = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-heading",
  display: "swap",
});

export const body = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
