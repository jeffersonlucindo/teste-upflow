import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  captureLayout,
  expectFocusRing,
  expectFontVariable,
  expectMinHeight,
  expectNoHorizontalOverflow,
  expectTokenColors,
} from "./support/layout";
import { requiresTmdb } from "./support/tmdb";
import { tokenRgb } from "./support/tokens";

const STORAGE_KEY = "catalogo.favorites.v1";
const SNAPSHOT_KEYS = ["id", "posterPath", "releaseDate", "savedAt", "title", "voteAverage", "voteCount"];
const META = /^(Nota \d+,\d|Sem nota)/;
const SUBTITLE = "Os filmes salvos ficam neste navegador.";
const EMPTY_TITLE = "Você ainda não salvou nenhum filme.";

type Stored = { id: number; title: string; savedAt: number } & Record<string, unknown>;
type Payload = { version: number; items: Stored[] };

function nav(page: Page) {
  return page.getByRole("navigation", { name: "Principal" });
}

function badge(page: Page) {
  return nav(page).getByLabel(/^\d+ favoritos?$/);
}

function cardsOf(page: Page) {
  return page.getByRole("article");
}

function heartOf(scope: Locator) {
  return scope.getByRole("button", { name: /aos favoritos$|dos favoritos$/ });
}

async function titleOf(card: Locator): Promise<string> {
  const label = await card.getByRole("link", { name: /^Ver detalhes de / }).getAttribute("aria-label");
  return label!.replace(/^Ver detalhes de /, "");
}

async function titlesOf(page: Page, count: number): Promise<string[]> {
  return Promise.all(Array.from({ length: count }, (_, index) => titleOf(cardsOf(page).nth(index))));
}

async function readPayload(page: Page): Promise<Payload> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  expect(raw, "a chave de favoritos não foi gravada").not.toBeNull();
  return JSON.parse(raw!) as Payload;
}

/** Primeira carga da listagem (a URL direta é o requisito): espera os cards. */
async function openListing(page: Page) {
  await page.goto("/");
  await expect(cardsOf(page).first()).toBeVisible();
}

/**
 * Favorita o card `index` pelo coração e devolve o título. O clique antes da hidratação não faz
 * nada: repete enquanto o coração ainda estiver desligado, sem nunca desfazer um clique válido.
 */
async function favorite(page: Page, index: number): Promise<string> {
  const card = cardsOf(page).nth(index);
  const heart = heartOf(card);
  await expect(async () => {
    if ((await heart.getAttribute("aria-pressed")) === "false") await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true", { timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await expect(heart).toHaveAccessibleName("Remover dos favoritos");
  return titleOf(card);
}

/** O `savedAt` vem de Date.now() no clique: uma pausa garante a ordem entre dois favoritos. */
async function favoriteMany(page: Page, count: number): Promise<string[]> {
  const titles: string[] = [];
  for (let index = 0; index < count; index += 1) {
    titles.push(await favorite(page, index));
    await page.waitForTimeout(15);
  }
  return titles;
}

async function openFavoritesFromHeader(page: Page) {
  await nav(page).getByRole("link", { name: /^Favoritos/ }).click();
  await expect(page).toHaveURL("/favoritos");
  await expect(page.getByRole("heading", { level: 1, name: "Meus favoritos" })).toBeVisible();
}

/** Erros de página e avisos de hidratação durante o teste. */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()) && /hydrat/i.test(message.text())) {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  return problems;
}

function snapshot(id: number, title: string, savedAt: number) {
  return { id, title, posterPath: null, voteAverage: 7.5, voteCount: 100, releaseDate: "2020-05-01", savedAt };
}

/** Semeia o armazenamento antes de qualquer script da página (cenários que SÃO sobre o storage). */
async function seedStorage(page: Page, raw: string) {
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: raw },
  );
}

async function blockLocalStorage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
}

test.describe("favoritos: fluxo com dados do TMDB", () => {
  requiresTmdb();

  test("favoritar na listagem: coração, badge e payload no storage", async ({ page }, testInfo) => {
    const problems = watchConsole(page);
    await openListing(page);
    await expect(badge(page)).toHaveCount(0);

    const first = await favorite(page, 0);
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    await expect(badge(page)).toHaveText("1");
    await page.waitForTimeout(15);
    const second = await favorite(page, 1);

    await expect(badge(page)).toHaveAccessibleName("2 favoritos");
    await expect(nav(page).getByRole("link", { name: /^Favoritos/ })).toHaveAccessibleName(
      "Favoritos 2 favoritos",
    );

    const payload = await readPayload(page);
    expect(payload.version).toBe(1);
    expect(payload.items).toHaveLength(2);
    for (const item of payload.items) {
      expect(Object.keys(item).sort()).toEqual(SNAPSHOT_KEYS);
      expect(typeof item.savedAt).toBe("number");
    }
    // Ordem por savedAt decrescente: o último favoritado vem primeiro.
    expect(payload.items.map((item) => item.title)).toEqual([second, first]);
    expect(payload.items[0].savedAt).toBeGreaterThan(payload.items[1].savedAt);

    // Os cards não favoritados continuam desligados.
    const idle = heartOf(cardsOf(page).nth(2));
    await expect(idle).toHaveAttribute("aria-pressed", "false");
    await expect(idle).toHaveAccessibleName("Adicionar aos favoritos");
    expect(problems).toEqual([]);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(nav(page).getByRole("link", { name: /Explorar|Favoritos/ }));
    await captureLayout(page, testInfo, "listagem-com-favoritos");
  });

  test("alternar: clicar de novo remove e zera o badge e o storage", async ({ page }) => {
    await openListing(page);
    await favorite(page, 0);
    const heart = heartOf(cardsOf(page).first());

    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await expect(heart).toHaveAccessibleName("Adicionar aos favoritos");
    await expect(badge(page)).toHaveCount(0);
    expect((await readPayload(page)).items).toEqual([]);
  });

  test("botão icon: 40 x 40 sobre o pôster, fora do link, e coração preenchido quando ativo", async ({
    page,
  }) => {
    await openListing(page);
    await favorite(page, 0);
    const active = heartOf(cardsOf(page).nth(0));
    const idle = heartOf(cardsOf(page).nth(1));

    for (const heart of [active, idle]) {
      const box = await heart.boundingBox();
      expect(Math.round(box!.width)).toBe(40);
      expect(Math.round(box!.height)).toBe(40);
      await expect(heart).toHaveText("");
    }
    await expectMinHeight(heartOf(cardsOf(page)), 40);

    // O coração é irmão do link do pôster, nunca filho dele.
    await expect(cardsOf(page).first().getByRole("link").getByRole("button")).toHaveCount(0);

    // Sobre o pôster, no canto superior direito.
    const poster = (await cardsOf(page)
      .first()
      .getByRole("link", { name: /^Ver detalhes de / })
      .boundingBox())!;
    const heartBox = (await active.boundingBox())!;
    expect(heartBox.x + heartBox.width).toBeLessThanOrEqual(poster.x + poster.width);
    expect(heartBox.y).toBeGreaterThanOrEqual(poster.y);
    expect(heartBox.y - poster.y).toBeLessThan(20);

    // Ativo: preenchido e traçado em accent. Inativo: só o traço.
    const [red, green, blue] = tokenRgb("accent");
    await expect(active.locator("svg")).toHaveCSS("fill", `rgb(${red}, ${green}, ${blue})`);
    await expect(active.locator("svg")).toHaveCSS("color", `rgb(${red}, ${green}, ${blue})`);
    await expect(idle.locator("svg")).toHaveCSS("fill", "none");
  });

  test("HTML do servidor: corações desligados e nenhum badge, mesmo com favoritos gravados", async ({
    page,
    request,
  }) => {
    await openListing(page);
    await favorite(page, 0);
    await expect(badge(page)).toHaveCount(1);

    const html = await (await request.get("/")).text();
    expect(html.match(/aria-pressed="false"/g)?.length ?? 0).toBeGreaterThan(0);
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toMatch(/aria-label="\d+ favoritos?"/);
  });

  test("reload mantém: corações, badge e lista, sem aviso de hidratação", async ({ page }) => {
    const problems = watchConsole(page);
    await openListing(page);
    const titles = await favoriteMany(page, 2);

    await page.reload();
    await expect(cardsOf(page).first()).toBeVisible();
    // O favorito gravado só vira "Remover" depois da hidratação.
    await expect(heartOf(cardsOf(page).nth(0))).toHaveAccessibleName("Remover dos favoritos");
    await expect(heartOf(cardsOf(page).nth(1))).toHaveAccessibleName("Remover dos favoritos");
    await expect(heartOf(cardsOf(page).nth(2))).toHaveAccessibleName("Adicionar aos favoritos");
    await expect(badge(page)).toHaveAccessibleName("2 favoritos");

    // Primeira carga de /favoritos: a URL direta é o requisito.
    await page.goto("/favoritos");
    await expect(cardsOf(page)).toHaveCount(2);
    expect(await titlesOf(page, 2)).toEqual([...titles].reverse());
    await expect(badge(page)).toHaveAccessibleName("2 favoritos");

    await page.reload();
    await expect(cardsOf(page)).toHaveCount(2);
    expect(problems).toEqual([]);
  });

  test("badge: singular, plural e nome acessível da aba com 3 favoritos", async ({ page }) => {
    await openListing(page);
    await favorite(page, 0);
    await expect(nav(page).getByLabel("1 favorito", { exact: true })).toBeVisible();
    await page.waitForTimeout(15);
    await favorite(page, 1);
    await page.waitForTimeout(15);
    await favorite(page, 2);

    await expect(nav(page).getByLabel("3 favoritos", { exact: true })).toHaveText("3");
    await expect(nav(page).getByRole("link", { name: "Favoritos 3 favoritos" })).toBeVisible();
  });

  test("página de favoritos: do mais recente ao mais antigo, links sem `from`", async ({ page }, testInfo) => {
    await openListing(page);
    const titles = await favoriteMany(page, 3);

    // Navegação client-side: a lista monta já com os favoritos.
    await openFavoritesFromHeader(page);
    await expect(page.getByText(SUBTITLE)).toBeVisible();
    const cards = cardsOf(page);
    await expect(cards).toHaveCount(3);
    const grid = page.getByRole("list").filter({ has: cards.first() });
    await expect(grid).toBeVisible();
    expect(await titlesOf(page, 3)).toEqual([...titles].reverse());

    for (const card of await cards.all()) {
      await expect(card.getByRole("link", { name: /^Ver detalhes de / })).toHaveAttribute(
        "href",
        /^\/movie\/\d+$/,
      );
      await expect(card.getByText(META)).toBeVisible();
      await expect(heartOf(card)).toHaveAttribute("aria-pressed", "true");
      await expect(heartOf(card)).toHaveAccessibleName("Remover dos favoritos");
    }
    await expect(nav(page).getByRole("link", { name: /^Favoritos/ })).toHaveAttribute("aria-current", "page");
    await expect(badge(page)).toHaveAccessibleName("3 favoritos");

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(page.getByRole("heading", { level: 1 }), "--font-heading");
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(nav(page).getByRole("link", { name: /Explorar|Favoritos/ }));
    await expectMinHeight(heartOf(cards), 40);

    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    if (testInfo.project.name === "mobile") {
      expect(columns).toBe(2);
    } else {
      expect(columns).toBeGreaterThanOrEqual(4);
    }
    await captureLayout(page, testInfo, "favoritos-carregado");
  });

  test("remover na página: o card some, o badge diminui e o último leva ao vazio", async ({
    page,
  }, testInfo) => {
    await openListing(page);
    const titles = await favoriteMany(page, 2);
    await openFavoritesFromHeader(page);
    await expect(cardsOf(page)).toHaveCount(2);

    await heartOf(cardsOf(page).first()).click();
    await expect(cardsOf(page)).toHaveCount(1);
    // Sobrou o mais antigo.
    expect(await titleOf(cardsOf(page).first())).toBe(titles[0]);
    await expect(badge(page)).toHaveAccessibleName("1 favorito");

    await heartOf(cardsOf(page).first()).click();
    await expect(cardsOf(page)).toHaveCount(0);
    await expect(badge(page)).toHaveCount(0);
    await expect(page.getByText(EMPTY_TITLE)).toBeVisible();
    expect((await readPayload(page)).items).toEqual([]);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectMinHeight(page.getByRole("link", { name: "Explorar filmes" }));
    await captureLayout(page, testInfo, "favoritos-vazio");

    await page.getByRole("link", { name: "Explorar filmes" }).click();
    await expect(page).toHaveURL("/");
    await expect(cardsOf(page).first()).toBeVisible();
  });

  test("remover pela listagem reflete em /favoritos sem sobrar card", async ({ page }) => {
    await openListing(page);
    await favorite(page, 0);
    const heart = heartOf(cardsOf(page).first());
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "false");

    await openFavoritesFromHeader(page);
    await expect(page.getByText(EMPTY_TITLE)).toBeVisible();
    await expect(cardsOf(page)).toHaveCount(0);
  });

  test("duas abas: favoritar numa aba aparece na outra, e remover volta", async ({ page, context }) => {
    const other = await context.newPage();
    // Espera o vazio: prova que a aba B já hidratou e assinou o evento `storage`.
    await other.goto("/favoritos");
    await expect(other.getByText(EMPTY_TITLE)).toBeVisible();

    await openListing(page);
    const title = await favorite(page, 0);

    await expect(cardsOf(other)).toHaveCount(1);
    expect(await titleOf(cardsOf(other).first())).toBe(title);
    await expect(badge(other)).toHaveAccessibleName("1 favorito");
    await expect(badge(page)).toHaveAccessibleName("1 favorito");

    // Remover na aba B desliga o coração da aba A.
    await heartOf(cardsOf(other).first()).click();
    await expect(other.getByText(EMPTY_TITLE)).toBeVisible();
    await expect(heartOf(cardsOf(page).first())).toHaveAttribute("aria-pressed", "false");
    await expect(badge(page)).toHaveCount(0);
    await expect(badge(other)).toHaveCount(0);
  });

  test("teclado: ordem pôster, coração, título; Espaço e Enter alternam; anel de foco", async ({ page }) => {
    await openListing(page);
    const card = cardsOf(page).first();
    const poster = card.getByRole("link", { name: /^Ver detalhes de / });
    const heart = heartOf(card);
    const title = card.getByRole("link", { name: await titleOf(card), exact: true });

    // Garante a hidratação antes de usar o teclado: favorita e desfavorita pelo clique.
    await favorite(page, 0);
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "false");

    await poster.focus();
    await page.keyboard.press("Tab");
    await expect(heart).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(title).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(heart).toBeFocused();

    await expectFocusRing(heart);
    await heart.focus();
    await page.keyboard.press("Space");
    await expect(heart).toHaveAttribute("aria-pressed", "true");
    await expect(heart).toHaveAccessibleName("Remover dos favoritos");
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    await page.keyboard.press("Enter");
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await expect(heart).toHaveAccessibleName("Adicionar aos favoritos");
  });

  test("storage corrompido: a leitura não grava e favoritar sobrescreve com payload válido", async ({
    page,
  }) => {
    const problems = watchConsole(page);
    await seedStorage(page, "{oops");
    await openListing(page);
    await expect(badge(page)).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe("{oops");

    const title = await favorite(page, 0);
    const payload = await readPayload(page);
    expect(payload.version).toBe(1);
    expect(payload.items.map((item) => item.title)).toEqual([title]);
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    expect(problems).toEqual([]);
  });

  test("localStorage bloqueado: coração e badge funcionam na sessão e o reload volta ao vazio", async ({
    page,
  }) => {
    const problems = watchConsole(page);
    await blockLocalStorage(page);
    await openListing(page);

    await favorite(page, 0);
    await expect(badge(page)).toHaveAccessibleName("1 favorito");

    await page.reload();
    await expect(cardsOf(page).first()).toBeVisible();
    await expect(badge(page)).toHaveCount(0);
    // Favoritar de novo prova que a página hidratou e que a contagem recomeçou do zero.
    await favorite(page, 0);
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    expect(problems).toEqual([]);
  });
});

test.describe("favoritos: resiliência do storage em /favoritos (sem TMDB)", () => {
  const INVALID_PAYLOADS: [string, string][] = [
    ["JSON inválido", "{oops"],
    ["string vazia", '""'],
    ["array solto", "[]"],
    ["versão desconhecida", JSON.stringify({ version: 2, items: [snapshot(1, "Filme A", 1)] })],
  ];

  for (const [label, raw] of INVALID_PAYLOADS) {
    test(`payload ${label}: estado vazio, sem badge, sem erro e sem escrita`, async ({ page }, testInfo) => {
      const problems = watchConsole(page);
      await seedStorage(page, raw);
      await page.goto("/favoritos");

      await expect(page.getByRole("heading", { level: 1, name: "Meus favoritos" })).toBeVisible();
      await expect(page.getByText(EMPTY_TITLE)).toBeVisible();
      await expect(page.getByText("Toque no coração de um pôster para guardá-lo aqui.")).toBeVisible();
      await expect(cardsOf(page)).toHaveCount(0);
      await expect(badge(page)).toHaveCount(0);
      expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(raw);
      expect(problems).toEqual([]);

      if (label === "JSON inválido") {
        await expect(page.getByRole("link", { name: "Explorar filmes" })).toHaveAttribute("href", "/");
        await expectNoHorizontalOverflow(page);
        await expectTokenColors(page);
        await expectMinHeight(page.getByRole("link", { name: "Explorar filmes" }));
        await captureLayout(page, testInfo, "favoritos-vazio-inicial");
      }
    });
  }

  test("item inválido no meio da lista: só ele é descartado", async ({ page }) => {
    const withoutSavedAt: Record<string, unknown> = snapshot(2, "Filme sem data", 0);
    delete withoutSavedAt.savedAt;
    await seedStorage(
      page,
      JSON.stringify({
        version: 1,
        items: [
          snapshot(1, "Filme A", 300),
          withoutSavedAt,
          { ...snapshot(3, "Filme id texto", 200), id: "abc" },
          snapshot(4, "Filme B", 100),
        ],
      }),
    );
    await page.goto("/favoritos");

    await expect(cardsOf(page)).toHaveCount(2);
    expect(await titlesOf(page, 2)).toEqual(["Filme A", "Filme B"]);
    await expect(badge(page)).toHaveAccessibleName("2 favoritos");
    await expect(cardsOf(page).first().getByText("Nota 7,5 · 2020")).toBeVisible();
    await expect(cardsOf(page).first().getByRole("link", { name: /^Ver detalhes de / })).toHaveAttribute(
      "href",
      "/movie/1",
    );
  });

  test("id repetido: fica uma entrada, a de savedAt maior; a ordem é por savedAt desc", async ({ page }) => {
    await seedStorage(
      page,
      JSON.stringify({
        version: 1,
        items: [snapshot(7, "Antigo", 100), snapshot(8, "Meio", 150), snapshot(7, "Recente", 200)],
      }),
    );
    await page.goto("/favoritos");

    await expect(cardsOf(page)).toHaveCount(2);
    expect(await titlesOf(page, 2)).toEqual(["Recente", "Meio"]);
    await expect(badge(page)).toHaveAccessibleName("2 favoritos");
  });

  test("localStorage bloqueado: /favoritos mostra o vazio sem erro", async ({ page }) => {
    const problems = watchConsole(page);
    await blockLocalStorage(page);
    await page.goto("/favoritos");

    await expect(page.getByText(EMPTY_TITLE)).toBeVisible();
    await expect(badge(page)).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test("HTML do servidor de /favoritos: só título e subtítulo, sem cards nem badge", async ({ request }) => {
    const html = await (await request.get("/favoritos")).text();
    expect(html).toContain("Meus favoritos");
    expect(html).toContain(SUBTITLE);
    expect(html).not.toContain("<article");
    expect(html).not.toMatch(/aria-label="\d+ favoritos?"/);
    expect(html).not.toContain(EMPTY_TITLE);
  });

  test("header com badge: sem overflow, alvos de toque e anel de foco na aba", async ({ page }) => {
    await seedStorage(
      page,
      JSON.stringify({ version: 1, items: [snapshot(1, "Filme A", 2), snapshot(2, "Filme B", 1)] }),
    );
    await page.goto("/favoritos");
    await expect(badge(page)).toHaveAccessibleName("2 favoritos");

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectMinHeight(nav(page).getByRole("link", { name: /Explorar|Favoritos/ }));
    await expectFocusRing(nav(page).getByRole("link", { name: /^Favoritos/ }));
  });
});
