#!/usr/bin/env node
/**
 * tmdb-probe — confere o token e três comportamentos da API do TMDB com chamadas reais.
 *
 * 1. /movie/{id} com append_to_response=credits,videos,translations e
 *    include_video_language=pt-BR,pt,en,null: as traduções vêm na mesma resposta? Vêm vídeos em
 *    inglês junto com os pt-BR e os pt-PT?
 * 2. A mesma chamada sem include_video_language: o parâmetro muda a lista de vídeos?
 *    Cada vídeo sai com idioma e país (pt-BR, pt-PT, en-US), porque o valor `pt` sozinho só casa
 *    com pt-PT e os brasileiros exigem `pt-BR` na lista.
 * 3. /discover/movie?page=501: o que a API responde acima da página 500?
 *
 * Uso: node --env-file=.env.local scripts/tmdb-probe.mjs [id]   (id padrão: 603)
 * Sem dependências. Nunca imprime o token. Sai com código 1 se o token faltar ou for recusado.
 */
const API_BASE = "https://api.themoviedb.org/3";
const DETAIL_APPEND = "credits,videos,translations";
const VIDEO_LANGUAGES = "pt-BR,pt,en,null";
const DEFAULT_MOVIE_ID = "603";

const token = process.env.TMDB_API_READ_TOKEN?.trim();
const language = process.env.TMDB_LANGUAGE?.trim() || "pt-BR";
const movieId = process.argv[2] ?? DEFAULT_MOVIE_ID;

if (!token) {
  console.error(
    "tmdb-probe: defina TMDB_API_READ_TOKEN em .env.local e rode com\n" +
      "  node --env-file=.env.local scripts/tmdb-probe.mjs",
  );
  process.exit(1);
}

if (!/^\d+$/.test(movieId)) {
  console.error(`tmdb-probe: id inválido "${movieId}" (esperado um número, ex.: 603)`);
  process.exit(1);
}

async function call(path, params) {
  const url = new URL(API_BASE + path);
  url.search = new URLSearchParams({ language, ...params }).toString();

  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
  } catch (error) {
    console.error(`tmdb-probe: falha de rede ao chamar ${url.pathname} (${error.cause?.code ?? error.message})`);
    process.exit(1);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Corpo que não é JSON: o resumo mostra só o status.
  }

  return { url: `${url.pathname}${url.search}`, status: response.status, body };
}

function failIfUnauthorized({ status, body }) {
  if (status !== 401 && status !== 403) return;
  console.error(
    `tmdb-probe: o TMDB recusou o token (HTTP ${status}${body?.status_message ? `: ${body.status_message}` : ""}).\n` +
      "Confira se TMDB_API_READ_TOKEN é o API Read Access Token (v4), não a API Key (v3).",
  );
  process.exit(1);
}

const videoLocale = (video) => `${video.iso_639_1}-${video.iso_3166_1}`;

const describeVideo = (video) =>
  `${videoLocale(video)}/${video.type}/${video.official ? "oficial" : "não oficial"}/${video.site}`;

function countBy(items, keyOf) {
  const counts = new Map();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts].map(([key, count]) => `${key}=${count}`).join(", ") || "nenhum";
}

function printVideos(videos) {
  console.log(`  vídeos: ${videos.length} (por idioma e país: ${countBy(videos, videoLocale)})`);
  for (const video of videos) console.log(`    ${describeVideo(video)}  ${video.published_at ?? ""}`);
}

// ── 1. detalhe com append_to_response e include_video_language ───────────────
const detailParams = { append_to_response: DETAIL_APPEND };
const withParam = await call(`/movie/${movieId}`, {
  ...detailParams,
  include_video_language: VIDEO_LANGUAGES,
});
failIfUnauthorized(withParam);

console.log(`[1] GET ${withParam.url}`);
console.log(`  status: ${withParam.status}`);

const detail = withParam.status === 200 ? withParam.body : null;
const videosWithParam = detail?.videos?.results ?? [];

if (detail) {
  const translations = detail.translations?.translations;
  const withOverview = (translations ?? []).filter((item) => item.data?.overview?.trim());

  console.log(`  título: ${detail.title} · idioma original: ${detail.original_language}`);
  console.log(`  overview.length (${language}): ${(detail.overview ?? "").length}`);
  console.log(`  credits.cast: ${detail.credits?.cast?.length ?? "ausente"}`);
  console.log(
    `  translations: ${Array.isArray(translations) ? `presente, ${translations.length} idioma(s), ${withOverview.length} com overview` : "AUSENTE"}`,
  );
  if (withOverview.length > 0) {
    console.log(
      `    com overview: ${withOverview.map((item) => `${item.iso_639_1}-${item.iso_3166_1}`).join(" ")}`,
    );
  }
  printVideos(videosWithParam);
} else {
  console.log(`  status_message: ${withParam.body?.status_message ?? "(sem corpo JSON)"}`);
}

// ── 2. a mesma chamada sem include_video_language ────────────────────────────
const withoutParam = await call(`/movie/${movieId}`, detailParams);
const videosWithoutParam = withoutParam.body?.videos?.results ?? [];

console.log(`\n[2] GET ${withoutParam.url}`);
console.log(`  status: ${withoutParam.status}`);
printVideos(videosWithoutParam);

const keysWithout = new Set(videosWithoutParam.map((video) => video.key));
const onlyWithParam = videosWithParam.filter((video) => !keysWithout.has(video.key));
console.log(
  `  diferença: ${videosWithParam.length} com o parâmetro, ${videosWithoutParam.length} sem; ` +
    `${onlyWithParam.length} só com o parâmetro (por idioma e país: ${countBy(onlyWithParam, videoLocale)})`,
);

// ── 3. página acima do limite ────────────────────────────────────────────────
const overLimit = await call("/discover/movie", { page: "501" });

console.log(`\n[3] GET ${overLimit.url}`);
console.log(`  status: ${overLimit.status}`);
console.log(
  `  status_message: ${overLimit.body?.status_message ?? "(nenhum)"}` +
    (Array.isArray(overLimit.body?.errors) ? ` · errors: ${overLimit.body.errors.join(" | ")}` : ""),
);

console.log("\ntmdb-probe: token aceito; três chamadas concluídas.");
