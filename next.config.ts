import type { NextConfig } from "next";

/**
 * CATALOGO_CACHE_COMPONENTS=1 (ou true) liga cacheComponents e partialPrefetching juntos:
 * o segundo sem o primeiro falha a validação do config, e o primeiro sem o segundo gera
 * warning. Desligado é o padrão; o código vale nos dois modos (D2 em .work/design/decisoes.md).
 */
const cacheComponents = /^(1|true)$/i.test(process.env.CATALOGO_CACHE_COMPONENTS ?? "");

const nextConfig: NextConfig = {
  ...(cacheComponents ? { cacheComponents: true, partialPrefetching: true } : {}),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
  },
};

export default nextConfig;
