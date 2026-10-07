import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

import { tokenPalette, tokenRgb, type Rgb } from "./tokens";

/** Altura mínima de controle (alvo de toque) do Design System. */
export const MIN_CONTROL_HEIGHT = 44;

type Rgba = readonly [red: number, green: number, blue: number, alpha: number];

type RenderedColor = {
  element: string;
  property: string;
  value: string;
  rgba: Rgba;
};

function matches(rgba: Rgba, token: Rgb): boolean {
  // Cor translúcida volta do canvas com erro de arredondamento do alfa.
  const tolerance = rgba[3] === 255 ? 1 : 8;
  return token.every((channel, index) => Math.abs(channel - rgba[index]) <= tolerance);
}

/** O documento não passa da largura do viewport (sem rolagem horizontal). */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "rolagem horizontal: o conteúdo passa da largura do viewport").toBeLessThanOrEqual(
    clientWidth,
  );
}

/**
 * Toda cor renderizada (texto, fundo, borda e contorno dos elementos visíveis) é um token de
 * tokens.json. É a versão em runtime do `npm run tokens:check`: pega o que a análise estática
 * não vê (cascata, herança, estilo padrão do browser que escapou do reset).
 */
export async function expectTokenColors(page: Page) {
  const rendered: RenderedColor[] = await page.evaluate(() => {
    const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "OPTION", "OPTGROUP"]);
    const SIDES = ["top", "right", "bottom", "left"];
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const cache = new Map<string, [number, number, number, number]>();

    const toRgba = (value: string) => {
      const cached = cache.get(value);
      if (cached) return cached;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
      const rgba: [number, number, number, number] = [red, green, blue, alpha];
      cache.set(value, rgba);
      return rgba;
    };

    const describe = (element: Element) => {
      const classes = typeof element.className === "string" ? element.className.trim() : "";
      const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
      return `<${element.tagName.toLowerCase()}${classes ? ` class="${classes.slice(0, 60)}"` : ""}>${text}`;
    };

    const colors = new Map<string, RenderedColor>();
    for (const element of [document.body, ...document.body.querySelectorAll("*")]) {
      if (SKIPPED_TAGS.has(element.tagName) || element.getClientRects().length === 0) continue;
      const style = getComputedStyle(element);
      const used: [property: string, value: string][] = [
        ["color", style.color],
        ["background-color", style.backgroundColor],
      ];
      for (const side of SIDES) {
        if (Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0) {
          used.push([`border-${side}-color`, style.getPropertyValue(`border-${side}-color`)]);
        }
      }
      if (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0) {
        used.push(["outline-color", style.outlineColor]);
      }
      for (const [property, value] of used) {
        const rgba = toRgba(value);
        if (rgba[3] === 0) continue;
        const key = `${property}|${value}`;
        if (!colors.has(key)) colors.set(key, { element: describe(element), property, value, rgba });
      }
    }
    return [...colors.values()];
  });

  const palette = [...tokenPalette.values()];
  const offenders = rendered
    .filter(({ rgba }) => !palette.some((token) => matches(rgba, token)))
    .map(({ element, property, value }) => `${property}: ${value} em ${element}`);
  expect(offenders, "cor renderizada fora de tokens.json").toEqual([]);
}

/** Cada controle tem pelo menos `min` px de altura. */
export async function expectMinHeight(controls: Locator, min = MIN_CONTROL_HEIGHT) {
  const all = await controls.all();
  expect(all.length, "nenhum controle encontrado para medir").toBeGreaterThan(0);
  for (const control of all) {
    const box = await control.boundingBox();
    const label = (await control.textContent())?.trim() || (await control.getAttribute("aria-label")) || "controle";
    expect(box?.height ?? 0, `altura de "${label}"`).toBeGreaterThanOrEqual(min);
  }
}

/** O elemento usa a fonte declarada em `--font-heading` ou `--font-body` (next/font/local). */
export async function expectFontVariable(target: Locator, variable: "--font-heading" | "--font-body") {
  const { used, declared } = await target.first().evaluate((element, name) => {
    const firstFamily = (list: string) => list.split(",")[0].trim().replace(/^["']|["']$/g, "");
    return {
      used: firstFamily(getComputedStyle(element).fontFamily),
      declared: firstFamily(getComputedStyle(document.documentElement).getPropertyValue(name)),
    };
  }, variable);
  expect(declared, `${variable} não está definida no <html>`).not.toBe("");
  expect(used, `fonte do elemento não é ${variable}`).toBe(declared);
}

/** Com foco por teclado, o controle mostra o anel de 2 px na cor do token focus-ring. */
export async function expectFocusRing(control: Locator) {
  // O Tab põe o browser em modalidade de teclado; sem isso o focus() não ativa :focus-visible.
  await control.page().keyboard.press("Tab");
  await control.focus();
  const [red, green, blue] = tokenRgb("focus-ring");
  await expect(control).toHaveCSS("outline-style", "solid");
  await expect(control).toHaveCSS("outline-width", "2px");
  await expect(control).toHaveCSS("outline-color", `rgb(${red}, ${green}, ${blue})`);
}

/**
 * Screenshot de página inteira em e2e/.output/layout/<projeto>/<nome>.png, com as fontes já
 * carregadas. É o que a revisão visual compara com as telas de .work/design/screens/.
 */
export async function captureLayout(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const path = `e2e/.output/layout/${testInfo.project.name}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}
