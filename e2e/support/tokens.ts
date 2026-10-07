import designTokens from "../../.work/design/tokens/tokens.json";

export type Rgb = readonly [red: number, green: number, blue: number];

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Tokens de cor do Design System já resolvidos (alias `{nome}` → valor do token apontado). */
export const tokenPalette: ReadonlyMap<string, Rgb> = (() => {
  const raw = new Map(designTokens.color.tokens.map((token) => [token.name, token.value]));
  const resolve = (value: string): string => {
    const alias = /^\{(.+)\}$/.exec(value);
    if (!alias) return value;
    const target = raw.get(alias[1]);
    if (target === undefined) throw new Error(`tokens.json: alias {${alias[1]}} não existe`);
    return resolve(target);
  };
  return new Map([...raw].map(([name, value]) => [name, hexToRgb(resolve(value))]));
})();

export function tokenRgb(name: string): Rgb {
  const rgb = tokenPalette.get(name);
  if (!rgb) throw new Error(`tokens.json: token ${name} não existe`);
  return rgb;
}
