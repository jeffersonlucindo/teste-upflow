#!/usr/bin/env node
/**
 * check-tokens — guardrail do Design System "Catálogo." (D9 em .work/design/decisoes.md).
 *
 * 1. Confere que o @theme de src/app/globals.css declara exatamente os tokens de
 *    .work/design/tokens/tokens.json, com os mesmos valores (alias {x} vira var(--color-x)).
 * 2. Proíbe cor literal em src/ (#hex, rgb(), hsl() e afins, inclusive em classes
 *    arbitrárias como bg-[#fff]). Só globals.css pode ter valores de cor, e só nos tokens.
 *
 * Sem dependências. Sai com código 1 em qualquer problema.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tokensPath = join(root, ".work", "design", "tokens", "tokens.json");
const srcDir = join(root, "src");
const cssPath = join(srcDir, "app", "globals.css");

const SCANNED_EXTENSIONS = [".ts", ".tsx", ".css"];
/** Palavras-chave re-declaradas porque `--color-*: initial` também as apaga. */
const KEYWORD_COLORS = { transparent: "transparent", current: "currentcolor" };

const HEX_COLOR = /(?<![&\w])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;

const problems = [];
const toPosix = (file) => relative(root, file).split(sep).join("/");
const hasLiteralColor = (text) => HEX_COLOR.test(text) || COLOR_FUNCTION.test(text);
const normalize = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

function readOrFail(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    console.error(`check-tokens: não foi possível ler ${toPosix(file)}`);
    process.exit(1);
  }
}

// ── 1. tokens.json × @theme ──────────────────────────────────────────────────
const tokens = JSON.parse(readOrFail(tokensPath)).color.tokens;
const tokenNames = new Set(tokens.map((token) => token.name));
const css = readOrFail(cssPath);
const cssName = toPosix(cssPath);

/** Declarações `--color-<nome>: <valor>;` dos blocos `@theme { … }` (não os `inline`). */
const declared = new Map();
let hasReset = false;
for (const block of css.matchAll(/@theme\s*\{([^}]*)\}/g)) {
  for (const [, name, value] of block[1].matchAll(/--color-([\w*-]+)\s*:\s*([^;]+);/g)) {
    if (name === "*") hasReset = normalize(value) === "initial";
    else declared.set(name, normalize(value));
  }
}

if (!hasReset) {
  problems.push(`${cssName}: falta \`--color-*: initial;\` no @theme (a paleta padrão do Tailwind ficaria disponível)`);
}

for (const { name, value } of tokens) {
  const alias = /^\{(.+)\}$/.exec(value);
  if (alias && !tokenNames.has(alias[1])) {
    problems.push(`${toPosix(tokensPath)}: ${name} aponta para {${alias[1]}}, que não existe`);
    continue;
  }
  const expected = alias ? `var(--color-${alias[1]})` : normalize(value);
  const actual = declared.get(name);
  if (actual === undefined) {
    problems.push(`${cssName}: --color-${name} ausente no @theme (esperado ${expected})`);
  } else if (actual !== expected) {
    problems.push(`${cssName}: --color-${name} é ${actual}, esperado ${expected}`);
  }
}

for (const [name, value] of declared) {
  if (tokenNames.has(name) || KEYWORD_COLORS[name] === value) continue;
  problems.push(`${cssName}: --color-${name} não existe em tokens.json`);
}

// ── 2. cor literal em src/ ───────────────────────────────────────────────────
function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return SCANNED_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
  });
}

const files = listFiles(srcDir);
for (const file of files) {
  const isTheme = file === cssPath;
  readOrFail(file)
    .split(/\r?\n/)
    .forEach((line, index) => {
      // Em globals.css, os valores de cor só podem estar nas declarações de token.
      const text = isTheme ? line.replace(/--color-[\w-]+\s*:\s*[^;]+;/g, "") : line;
      if (hasLiteralColor(text)) {
        problems.push(`${toPosix(file)}:${index + 1}: cor literal — use um token`);
      }
    });
}

// ── Resultado ────────────────────────────────────────────────────────────────
if (problems.length > 0) {
  console.error(`check-tokens: ${problems.length} problema(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error("\nTokens: .work/design/tokens/tokens.json · @theme: src/app/globals.css");
  process.exit(1);
}

console.log(
  `check-tokens: ${tokens.length} tokens em sincronia com tokens.json; nenhuma cor literal em src/ (${files.length} arquivos verificados).`,
);
