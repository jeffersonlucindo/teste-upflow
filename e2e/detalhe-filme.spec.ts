import { expect, test, type Page } from "@playwright/test";

import {
  captureLayout,
  expectFocusRing,
  expectFontVariable,
  expectMinHeight,
  expectNoHorizontalOverflow,
  expectTokenColors,
} from "./support/layout";
import { requiresTmdb } from "./support/tmdb";

const STORAGE_KEY = "catalogo.favorites.v1";
const SNAPSHOT_KEYS = ["id", "posterPath", "releaseDate", "savedAt", "title", "voteAverage", "voteCount"];
const SUFFIX = " · Catálogo.";
const NOT_FOUND_TITLE = "Filme não encontrado";
const NOT_FOUND_TEXT = "O endereço pode estar errado ou o filme não existe no TMDB.";
const RATING = /^(Nota \d+,\d|Sem nota)$/;
const FAVORITE_BUTTON = /aos favoritos$|dos favoritos$/;

/** Ids estáveis do TMDB (conferidos em 2026-10-07); a mensagem do expect diz o que mudou se falharem. */
const ID_FULL = 603;
const ID_ENGLISH_ONLY = 20000;
const ID_NO_OVERVIEW = 1767731;
const ID_NO_CAST = 1789955;

function nav(page: Page) {
  return page.getByRole("navigation", { name: "Principal" });
}

function badge(page: Page) {
  return nav(page).getByLabel(/^\d+ favoritos?$/);
}

function backLink(page: Page) {
  return page.getByRole("link", { name: "Voltar à listagem" });
}

function favoriteButton(page: Page) {
  return page.getByRole("button", { name: FAVORITE_BUTTON });
}

function h2(page: Page, name: string) {
  return page.getByRole("heading", { level: 2, name, exact: true });
}

function section(page: Page, heading: string) {
  return page.locator("section").filter({ has: h2(page, heading) });
}

/** Abre o detalhe por URL (a URL direta é o requisito) e espera o título. */
async function openDetail(page: Page, id: number | string, query = "") {
  await page.goto(`/movie/${id}${query}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** Liga ou desliga o favorito do detalhe; o clique antes da hidratação não faz nada, então repete. */
async function setFavorite(page: Page, on: boolean) {
  const button = favoriteButton(page);
  const want = on ? "true" : "false";
  await expect(async () => {
    if ((await button.getAttribute("aria-pressed")) !== want) await button.click();
    await expect(button).toHaveAttribute("aria-pressed", want, { timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
}

async function typeSearch(page: Page, text: string, url: RegExp) {
  const search = page.getByRole("searchbox", { name: "Buscar por título" });
  await expect(async () => {
    await search.fill("");
    await search.fill(text);
    await expect(page).toHaveURL(url, { timeout: 6_000 });
  }).toPass({ timeout: 40_000 });
}

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

async function expectNotFoundUi(page: Page) {
  await expect(page.getByText(NOT_FOUND_TITLE, { exact: true })).toBeVisible();
  await expect(page.getByText(NOT_FOUND_TEXT)).toBeVisible();
  await expect(backLink(page)).toHaveAttribute("href", "/");
  await expect(nav(page)).toBeVisible();
  await expect(page).toHaveTitle(`${NOT_FOUND_TITLE}${SUFFIX}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expect(page.getByText("Não foi possível carregar o filme")).toHaveCount(0);
}

test.describe("detalhe do filme: sem TMDB (id inválido não chega à API)", () => {
  for (const id of ["abc", "0603", "0", "603abc"]) {
    test(`/movie/${id}: not-found com UI completa e noindex`, async ({ page }, testInfo) => {
      const response = await page.goto(`/movie/${id}`);
      await expectNotFoundUi(page);

      // O notFound() roda depois de o streaming começar: 200 + noindex, ou 404 se o Next ainda puder.
      const status = response!.status();
      expect([200, 404], `status HTTP inesperado: ${status}`).toContain(status);
      if (status === 200) {
        await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
      }

      await expectNoHorizontalOverflow(page);
      await expectTokenColors(page);
      await expectFontVariable(page.locator("body"), "--font-body");
      await expectMinHeight(backLink(page));
      if (id === "abc") {
        await expectFocusRing(backLink(page));
        await captureLayout(page, testInfo, "detalhe-not-found");
      }
    });
  }

  test("HTML do servidor traz o shell: link de volta e o skeleton acessível", async ({ request }) => {
    const html = await (await request.get(`/movie/${ID_FULL}?from=q%3Dmatrix`)).text();
    expect(html).toContain("Voltar à listagem");
    expect(html).toContain("Carregando filme");
    expect(html).toContain('role="status"');
  });

  // O fetch do TMDB é do servidor e não dá para atrasá-lo daqui. Sem JavaScript o navegador não
  // troca os fallbacks pelo conteúdo transmitido depois, então o shell fica na tela para ser medido.
  test("shell antes dos dados: link de volta para a raiz e skeleton nas caixas do detalhe", async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({
      baseURL,
      viewport: testInfo.project.use.viewport,
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    try {
      await page.goto(`/movie/${ID_FULL}?from=q%3Dmatrix`);

      const skeleton = page.getByRole("status");
      await expect(skeleton).toBeVisible();
      await expect(skeleton).toHaveText("Carregando filme");
      // O link já é válido no shell: "/" (fallback) ou o destino final, se o ?from= resolveu antes do envio.
      await expect(backLink(page)).toHaveAttribute("href", /^\/(\?q=matrix)?$/);
      await expect(page.getByRole("heading", { level: 1 })).toBeHidden();

      const boxes = await skeleton.evaluate((root) => {
        const [poster, column] = Array.from(root.children)
          .filter((child) => child.getAttribute("aria-hidden") === "true")
          .map((child) => child.getBoundingClientRect());
        return { posterWidth: poster.width, posterRatio: poster.width / poster.height, stacked: column.top >= poster.bottom };
      });
      expect(boxes.posterWidth).toBeLessThanOrEqual(300);
      expect(boxes.posterRatio).toBeCloseTo(2 / 3, 1);
      expect(boxes.stacked).toBe(testInfo.project.name === "mobile");

      await expectNoHorizontalOverflow(page);
      await expectTokenColors(page);
      await expectMinHeight(backLink(page));
      await captureLayout(page, testInfo, "detalhe-skeleton");
    } finally {
      await context.close();
    }
  });
});

test.describe("detalhe do filme: com dados do TMDB", () => {
  requiresTmdb();

  test("a partir de um card: estrutura, título da aba e gates de layout", async ({ page }, testInfo) => {
    const problems = watchConsole(page);
    await page.goto("/");
    const card = page.getByRole("article").first();
    await expect(card).toBeVisible();
    const link = card.getByRole("link", { name: /^Ver detalhes de / });
    const cardTitle = (await link.getAttribute("aria-label"))!.replace(/^Ver detalhes de /, "");
    const href = (await link.getAttribute("href"))!;

    await link.click();
    await expect(page).toHaveURL(href);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(cardTitle);
    await expect(page).toHaveTitle(`${cardTitle}${SUFFIX}`);

    // Pôster w500 via next/image, decorativo.
    const poster = page.locator("article img").first();
    await expect(poster).toHaveAttribute("alt", "");
    expect(decodeURIComponent((await poster.getAttribute("src"))!)).toContain("image.tmdb.org/t/p/w500/");

    await expect(page.getByText(RATING)).toBeVisible();
    await expect(favoriteButton(page)).toHaveAccessibleName("Adicionar aos favoritos");
    await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect(h2(page, "Sinopse")).toBeVisible();

    // Elenco e trailer aparecem com a seção inteira ou não aparecem: nunca um h2 solto.
    for (const name of ["Elenco principal", "Trailer"]) {
      expect(await h2(page, name).count(), `h2 "${name}" duplicado`).toBeLessThanOrEqual(1);
    }
    if ((await h2(page, "Elenco principal").count()) === 1) {
      const figures = await section(page, "Elenco principal").getByRole("figure").count();
      expect(figures).toBeGreaterThanOrEqual(1);
      expect(figures).toBeLessThanOrEqual(8);
    } else {
      await expect(page.getByRole("figure")).toHaveCount(0);
    }
    if ((await h2(page, "Trailer").count()) === 1) {
      await expect(section(page, "Trailer").locator("iframe")).toHaveCount(1);
    } else {
      await expect(page.locator("iframe")).toHaveCount(0);
    }

    expect(problems).toEqual([]);
    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(h1, "--font-heading");
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(backLink(page));
    await expectMinHeight(favoriteButton(page));
    await captureLayout(page, testInfo, "detalhe-de-card");
  });

  test(`/movie/${ID_FULL}: meta, chip, seções, elenco, trailer e árvore de acessibilidade`, async ({
    page,
  }, testInfo) => {
    const problems = watchConsole(page);
    await openDetail(page, ID_FULL);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    const title = (await h1.textContent())!.trim();
    await expect(page).toHaveTitle(`${title}${SUFFIX}`);

    // Meta logo abaixo do h1: "Ano · Duração · Gêneros".
    await expect(page.locator("article p").filter({ hasText: /^\d{4} · / }).first()).toHaveText(
      /^\d{4} · (\d+h( \d+min)?|\d+min) · .+/,
    );
    await expect(page.getByText(RATING)).toBeVisible();

    // Um h2 por seção, nessa ordem.
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Sinopse", "Elenco principal", "Trailer"]);

    // Sinopse em português: sem aviso e sem lang.
    const overview = section(page, "Sinopse");
    await expect(overview.locator("p")).toHaveCount(1);
    await expect(overview.locator("p[lang]")).toHaveCount(0);
    await expect(overview.getByText(/Sinopse disponível apenas/)).toHaveCount(0);

    // Elenco: lista com até 8 figure/figcaption.
    const cast = section(page, "Elenco principal");
    const count = await cast.getByRole("listitem").count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(8);
    await expect(cast.getByRole("figure")).toHaveCount(count);
    for (const figure of await cast.getByRole("figure").all()) {
      await expect(figure.locator("figcaption")).not.toHaveText("");
      await expect(figure).toHaveAccessibleName(/.+/);
      for (const image of await figure.locator("img").all()) {
        await expect(image).toHaveAttribute("alt", "");
        expect(decodeURIComponent((await image.getAttribute("src"))!)).toContain("image.tmdb.org/t/p/w185/");
      }
    }

    // Trailer: iframe do youtube-nocookie, nomeado, lazy, 16:9 e com no máximo 800 px.
    const iframe = section(page, "Trailer").locator("iframe");
    await expect(iframe).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\/[^/]+$/);
    await expect(iframe).toHaveAttribute("title", /^Trailer: .+/);
    await expect(iframe).toHaveAttribute("loading", "lazy");
    await expect(iframe).toHaveAttribute("allowfullscreen", /.*/);
    const box = (await iframe.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(800 + 1);
    expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.05);

    // Nenhum aria-label no detalhe: o botão de favorito usa o texto visível.
    await expect(page.locator("article [aria-label]")).toHaveCount(0);
    expect(problems).toEqual([]);

    // Layout por projeto.
    const columns = await cast
      .getByRole("list")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    const posterBox = (await page.locator("article img").first().boundingBox())!;
    const h1Box = (await h1.boundingBox())!;
    const h1Size = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    expect(posterBox.width).toBeLessThanOrEqual(300 + 1);
    if (testInfo.project.name === "mobile") {
      expect(columns).toBe(2);
      expect(h1Size).toBe("36px");
      // Empilhado: pôster acima do título; gutter de 16 px.
      expect(posterBox.y + posterBox.height).toBeLessThanOrEqual(h1Box.y);
      expect((await backLink(page).boundingBox())!.x).toBe(16);
      expect(box.width).toBeLessThanOrEqual(390 - 32 + 1);
    } else {
      expect(columns).toBeGreaterThanOrEqual(3);
      expect(h1Size).toBe("44px");
      // Duas colunas: pôster à esquerda do título, na mesma faixa vertical.
      expect(posterBox.x + posterBox.width).toBeLessThanOrEqual(h1Box.x);
      expect(h1Box.y).toBeLessThan(posterBox.y + posterBox.height);
    }

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(h1, "--font-heading");
    await expectFontVariable(h2(page, "Sinopse"), "--font-heading");
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(backLink(page));
    await expectMinHeight(favoriteButton(page));
    await captureLayout(page, testInfo, "detalhe-603-completo");
  });

  test("favoritar no detalhe: botão, badge, storage, reload e reflexo em /favoritos", async ({ page }) => {
    const problems = watchConsole(page);
    await openDetail(page, ID_FULL);
    const title = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
    const button = favoriteButton(page);
    await expect(badge(page)).toHaveCount(0);

    await setFavorite(page, true);
    await expect(button).toHaveText("Remover dos favoritos");
    await expect(button).toHaveAccessibleName("Remover dos favoritos");
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    const payload = JSON.parse(raw!) as { version: number; items: Record<string, unknown>[] };
    expect(payload.version).toBe(1);
    expect(payload.items).toHaveLength(1);
    expect(Object.keys(payload.items[0]).sort()).toEqual(SNAPSHOT_KEYS);
    expect(payload.items[0].id).toBe(ID_FULL);
    expect(payload.items[0].title).toBe(title);

    // Reload: o servidor renderiza desligado e a ilha liga depois de hidratar, sem aviso.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveText("Remover dos favoritos");
    await expect(badge(page)).toHaveAccessibleName("1 favorito");

    // Reflete em /favoritos pela navegação do header.
    await nav(page).getByRole("link", { name: /^Favoritos/ }).click();
    await expect(page).toHaveURL("/favoritos");
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(1);
    await expect(cards.first().getByRole("link", { name: `Ver detalhes de ${title}` })).toBeVisible();

    // De /favoritos para o detalhe: sem `from`, "Voltar à listagem" vai para "/".
    await cards.first().getByRole("link", { name: /^Ver detalhes de / }).click();
    await expect(page).toHaveURL(`/movie/${ID_FULL}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(backLink(page)).toHaveAttribute("href", "/");
    await expect(button).toHaveAttribute("aria-pressed", "true");

    // Desfavoritar zera o badge e o storage.
    await setFavorite(page, false);
    await expect(button).toHaveText("Adicionar aos favoritos");
    await expect(badge(page)).toHaveCount(0);
    const after = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect((JSON.parse(after!) as { items: unknown[] }).items).toEqual([]);

    await backLink(page).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("article").first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("Voltar à listagem preserva a busca e a página vindas da listagem", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("article").first()).toBeVisible();
    await typeSearch(page, "love", /\/\?q=love$/);
    const pagination = page.getByRole("navigation", { name: "Paginação" });
    await pagination.getByRole("link", { name: "Próxima" }).click();
    await expect(page).toHaveURL("/?q=love&page=2", { timeout: 15_000 });
    await expect(pagination.getByText(/^Página 2 de \d+$/)).toBeVisible();

    await page.getByRole("article").first().getByRole("link", { name: /^Ver detalhes de / }).click();
    await expect(page).toHaveURL(/\/movie\/\d+\?from=q%3Dlove%26page%3D2$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(backLink(page)).toHaveAttribute("href", "/?q=love&page=2");

    await backLink(page).click();
    await expect(page).toHaveURL("/?q=love&page=2");
    await expect(page.getByRole("searchbox", { name: "Buscar por título" })).toHaveValue("love");
    await expect(pagination.getByText(/^Página 2 de \d+$/)).toBeVisible();
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("`from` mal formado é normalizado ou ignorado", async ({ page }) => {
    // O `?from=` montado à mão é o requisito: URL direta.
    const cases: [string, string][] = [
      ["from=page%3D999", "/?page=500"],
      ["from=sort%3Dfoo%26genre%3Dabc", "/"],
      ["from=http%3A%2F%2Fevil.example%2Fx", "/"],
      ["from=", "/"],
      ["from=q%3Dm%26genre%3D28%26sort%3Drating", "/?q=m"],
      ["from=genre%3D28%26sort%3Drating%26page%3D2", "/?genre=28&sort=rating&page=2"],
      ["from=page%3D2&from=page%3D3", "/?page=2"],
    ];
    for (const [query, expected] of cases) {
      await openDetail(page, ID_FULL, `?${query}`);
      await expect(backLink(page), `?${query}`).toHaveAttribute("href", expected);
    }
  });

  test("id inexistente (404 do TMDB): not-found sem error.tsx, e o botão volta à listagem", async ({ page }) => {
    await page.goto("/movie/999999999");
    await expectNotFoundUi(page);
    await expectMinHeight(backLink(page));

    await backLink(page).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test(`sinopse só em outro idioma (${ID_ENGLISH_ONLY}): aviso antes do texto e lang`, async ({
    page,
  }, testInfo) => {
    await openDetail(page, ID_ENGLISH_ONLY);
    const overview = section(page, "Sinopse");
    const notice = overview.getByText("Sinopse disponível apenas em inglês.");
    await expect(notice, `id ${ID_ENGLISH_ONLY} ganhou sinopse em português? troque o id do cenário`).toBeVisible();
    const text = overview.locator("p[lang]");
    await expect(text).toHaveCount(1);
    await expect(text).toHaveAttribute("lang", "en");
    await expect(text).not.toHaveText("");
    await expect(notice).not.toHaveAttribute("lang", /.+/);

    // O aviso vem antes do texto, na ordem do DOM e na da tela.
    await expect(overview.locator("p").first()).toHaveText("Sinopse disponível apenas em inglês.");
    const [noticeBox, textBox] = [(await notice.boundingBox())!, (await text.boundingBox())!];
    expect(noticeBox.y).toBeLessThan(textBox.y);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "detalhe-sinopse-ingles");
  });

  test(`sem sinopse (${ID_NO_OVERVIEW}): mensagem, h2 mantido e sem trailer`, async ({ page }, testInfo) => {
    await openDetail(page, ID_NO_OVERVIEW);
    await expect(h2(page, "Sinopse")).toBeVisible();
    await expect(
      page.getByText("Sinopse não disponível.", { exact: true }),
      `id ${ID_NO_OVERVIEW} ganhou sinopse? troque o id do cenário`,
    ).toBeVisible();
    await expect(section(page, "Sinopse").locator("p[lang]")).toHaveCount(0);
    await expect(section(page, "Sinopse").getByText(/Sinopse disponível apenas/)).toHaveCount(0);

    // Sem vídeos: a seção inteira some, com o h2 e sem iframe.
    await expect(h2(page, "Trailer"), `id ${ID_NO_OVERVIEW} ganhou trailer? troque o id`).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "detalhe-sem-sinopse");
  });

  test(`sem elenco (${ID_NO_CAST}): a seção some inteira, inclusive o h2`, async ({ page }, testInfo) => {
    await openDetail(page, ID_NO_CAST);
    await expect(h2(page, "Sinopse")).toBeVisible();
    await expect(h2(page, "Elenco principal"), `id ${ID_NO_CAST} ganhou elenco? troque o id`).toHaveCount(0);
    await expect(page.getByRole("figure")).toHaveCount(0);
    await expect(page.getByRole("listitem")).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "detalhe-sem-elenco");
  });

  test("teclado: Voltar, favorito, trailer; Espaço e Enter alternam; anel de foco", async ({ page }) => {
    await openDetail(page, ID_FULL);
    const button = favoriteButton(page);
    const iframe = page.locator("iframe");

    // Garante a hidratação antes de usar o teclado.
    await setFavorite(page, true);
    await setFavorite(page, false);

    await expectFocusRing(backLink(page));
    await backLink(page).focus();
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(iframe).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(button).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(backLink(page)).toBeFocused();

    await expectFocusRing(button);
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveText("Remover dos favoritos");
    await expect(badge(page)).toHaveAccessibleName("1 favorito");
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveText("Adicionar aos favoritos");
  });
});
