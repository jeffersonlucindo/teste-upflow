const languageNames = new Intl.DisplayNames(["pt-BR"], { type: "language", fallback: "none" });

/** "en" → "inglês" · "ja" → "japonês". Código vazio, inválido ou desconhecido devolve null. */
export function languageName(code: string): string | null {
  try {
    return languageNames.of(code) ?? null;
  } catch {
    // Código fora do formato BCP 47 (inclusive "") lança RangeError.
    return null;
  }
}
