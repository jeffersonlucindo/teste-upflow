/** 136 → "2h 16min" · 45 → "45min" · 120 → "2h". Sem duração (0, null, inválida) devolve null. */
export function formatRuntime(minutes: number | null | undefined): string | null {
  if (minutes == null || !Number.isFinite(minutes)) return null;

  const total = Math.trunc(minutes);
  if (total <= 0) return null;

  const hours = Math.trunc(total / 60);
  const rest = total % 60;

  if (hours === 0) return `${rest}min`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}
