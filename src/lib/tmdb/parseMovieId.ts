/**
 * Id de filme vindo da URL. Só inteiro positivo em forma canônica: "0603" e " 603" são
 * rejeitados em vez de normalizados, para cada filme ter um endereço só.
 */
export function parseMovieId(raw: string | undefined): number | null {
  if (raw === undefined || !/^[1-9]\d*$/.test(raw)) return null;

  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
