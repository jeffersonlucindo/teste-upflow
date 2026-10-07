import { test } from "@playwright/test";

/**
 * Chame no topo do spec (ou do describe) cujas telas buscam dados no TMDB. Sem o token, os
 * testes aparecem como "skipped" com o motivo, em vez de vermelhos por falta de ambiente.
 * Skipped não é aprovado: quem lê o resultado trata como "não verificado".
 */
export function requiresTmdb() {
  test.skip(
    !process.env.TMDB_API_READ_TOKEN,
    "TMDB_API_READ_TOKEN ausente: crie o .env.local a partir do .env.example",
  );
}
