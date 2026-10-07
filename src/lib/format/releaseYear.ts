/** Ano de uma data "YYYY-MM-DD". Lê os dígitos direto do texto: sem fuso e sem relógio. */
export function releaseYear(releaseDate: string | null | undefined): number | null {
  const match = /^\d{4}/.exec(releaseDate ?? "");
  return match ? Number(match[0]) : null;
}
