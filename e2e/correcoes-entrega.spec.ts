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

const STORAGE_KEY = "catalogo.favorites.v1";

function controls(page: Page) {
  return {
    search: page.getByRole("searchbox", { name: "Buscar por título" }),
    genre: page.getByRole("combobox", { name: "Gênero" }),
    sort: page.getByRole("combobox", { name: "Ordenar por" }),
    pagination: page.getByRole("navigation", { name: "Paginação" }),
    cards: page.getByRole("article"),
  };
}

async function openListing(page: Page, url = "/") {
  await page.goto(url);
  await expect(controls(page).genre).toBeEnabled();
  await expect(controls(page).cards.first()).toBeVisible();
}

// Os handlers só existem depois da hidratação: repete a ação até a URL reagir.
async function chooseOption(page: Page, name: "genre" | "sort", label: string, url: string | RegExp) {
  const select = controls(page)[name];
  await expect(async () => {
    await select.selectOption({ label });
    await expect(page).toHaveURL(url, { timeout: 6_000 });
  }).toPass({ timeout: 40_000 });
}

async function typeSearch(page: Page, text: string, url: string | RegExp) {
  const { search } = controls(page);
  await expect(async () => {
    await search.fill("");
    await search.fill(text);
    await expect(page).toHaveURL(url, { timeout: 6_000 });
  }).toPass({ timeout: 40_000 });
}

/** Rótulo centrado no link: as folgas à esquerda e à direita do texto são iguais (px-5 simétrico). */
async function expectLabelCentered(link: Locator) {
  const gaps = await link.evaluate((element) => {
    const text = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const label = range.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    return { left: label.left - box.left, right: box.right - label.right };
  });
  expect(gaps.left).toBeGreaterThanOrEqual(19);
  expect(Math.abs(gaps.left - gaps.right)).toBeLessThanOrEqual(1);
}

test.describe("correções: listagem", () => {
  requiresTmdb();

  test("a última ação vence: gênero escolhido logo após digitar descarta a busca pendente", async ({ page }) => {
    await openListing(page);
    // A URL reagir prova que a barra já está hidratada.
    await chooseOption(page, "sort", "Nota", "/?sort=rating");
    await expect(controls(page).cards.first()).toBeVisible();
    const { search, genre } = controls(page);

    // Os dois comandos saem em menos de 350 ms um do outro.
    await search.fill("mat");
    await genre.selectOption({ label: "Ação" });

    await expect(page).toHaveURL("/?genre=28&sort=rating");
    await expect(search).toHaveValue("");
    // Passado o debounce, nenhuma busca atropela a escolha.
    await page.waitForTimeout(1_000);
    await expect(page).toHaveURL("/?genre=28&sort=rating");
    await expect(search).toHaveValue("");
    await expect(genre).toHaveValue("28");
    await expect(controls(page).cards.first()).toBeVisible();
  });

  test("gênero desconhecido na URL vira Todos e os populares aparecem", async ({ page }, testInfo) => {
    await openListing(page, "/?genre=999999");
    const { genre, pagination, cards } = controls(page);

    await expect(page.getByRole("heading", { level: 1, name: "Filmes populares" })).toBeVisible();
    await expect(genre).toHaveValue("");
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(pagination.getByRole("link", { name: "Próxima" })).toHaveAttribute("href", "/?page=2");

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "correcoes-genero-desconhecido");
  });

  test("o título acompanha a busca: Resultados da busca com q, Filmes populares sem", async ({ page }) => {
    await openListing(page);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Filmes populares");

    await typeSearch(page, "matrix", "/?q=matrix");
    await expect(h1).toHaveText("Resultados da busca");
    await expect(h1).toHaveCount(1);

    await controls(page).search.fill("");
    await expect(page).toHaveURL("/");
    await expect(h1).toHaveText("Filmes populares");
  });

  test("a URL direta de uma busca abre com o título da busca", async ({ page }) => {
    await page.goto("/?q=matrix");
    await expect(page.getByRole("heading", { level: 1, name: "Resultados da busca" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("paginação mostra o carregamento no link clicado até a página chegar", async ({ page }) => {
    await openListing(page);
    // A URL reagir à ordenação prova que a página já está hidratada: o clique abaixo é client.
    await chooseOption(page, "sort", "Nota", "/?sort=rating");
    await expect(controls(page).cards.first()).toBeVisible();
    const next = controls(page).pagination.getByRole("link", { name: "Próxima" });
    await expect(next).toHaveAttribute("href", "/?sort=rating&page=2");
    await expectLabelCentered(next);

    // Segura as respostas de navegação client para o estado pendente durar o bastante.
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.searchParams.has("_rsc"),
      async (route) => {
        await gate;
        await route.continue();
      },
    );

    await next.click();
    await expect(next.getByText("Carregando…")).toBeAttached();
    // O indicador não ocupa espaço: o rótulo continua centrado enquanto carrega.
    await expectLabelCentered(next);

    release();
    await expect(page).toHaveURL("/?sort=rating&page=2");
    await expect(controls(page).pagination.getByText(/^Página 2 de \d+$/)).toBeVisible();
    await expect(controls(page).pagination.getByText("Carregando…")).toHaveCount(0);
    // Na página 2 "Anterior" é o link com indicador, não o DisabledLink da página 1.
    await expectLabelCentered(controls(page).pagination.getByRole("link", { name: "Anterior" }));
  });
});

test.describe("correções: favoritos com pôster adulterado (sem TMDB)", () => {
  test("o item é mantido com o placeholder e a tela de erro não aparece", async ({ page }, testInfo) => {
    const raw = JSON.stringify({
      version: 1,
      items: [
        {
          id: 603,
          title: "Matrix",
          posterPath: "/../../etc.jpg",
          voteAverage: 8.2,
          voteCount: 25000,
          releaseDate: "1999-03-30",
          savedAt: 100,
        },
      ],
    });
    // O cenário é sobre o conteúdo do storage: ele só pode ser semeado antes da página.
    await page.addInitScript(
      ({ key, value }) => {
        localStorage.setItem(key, value);
      },
      { key: STORAGE_KEY, value: raw },
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/favoritos");

    await expect(page.getByRole("heading", { level: 1, name: "Meus favoritos" })).toBeVisible();
    const card = page.getByRole("article");
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("link", { name: "Ver detalhes de Matrix" })).toBeVisible();
    await expect(card.getByText("Pôster")).toBeVisible();
    await expect(card.locator("img")).toHaveCount(0);
    await expect(page.getByText("Não foi possível")).toHaveCount(0);
    expect(errors).toEqual([]);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "correcoes-favorito-poster-adulterado");
  });
});

test.describe("correções: página não encontrada (sem TMDB)", () => {
  test("/naoexiste: 404 em português, um h1 e link para a listagem", async ({ page }, testInfo) => {
    const response = await page.goto("/naoexiste");
    expect(response!.status()).toBe(404);

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Página não encontrada");
    await expect(page).toHaveTitle(/^Página não encontrada/);
    const back = page.getByRole("link", { name: "Voltar à listagem" });
    await expect(back).toHaveAttribute("href", "/");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
    await expect(page.getByText("could not be found")).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(back);
    await expectFocusRing(back);
    await captureLayout(page, testInfo, "correcoes-pagina-nao-encontrada");

    await back.click();
    await expect(page).toHaveURL("/");
  });

  test("/movie sem id também cai na página não encontrada", async ({ page }) => {
    const response = await page.goto("/movie");
    expect(response!.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
  });
});

test.describe("correções: skip-link (sem TMDB)", () => {
  test("o primeiro Tab foca o link visível e Enter leva o foco ao conteúdo", async ({ page }, testInfo) => {
    await page.goto("/favoritos");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });

    // Invisível sem foco: sem área.
    const idle = await skip.boundingBox();
    expect(idle === null || idle.width <= 1 || idle.height <= 1).toBe(true);

    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    const box = (await skip.boundingBox())!;
    expect(box.width).toBeGreaterThan(40);
    expect(box.height).toBeGreaterThanOrEqual(20);
    await expectMinHeight(skip);
    await expectFontVariable(skip, "--font-body");
    await expectFocusRing(skip);
    // expectFocusRing avança o Tab e foca o link de novo: o skip-link segue em foco.
    await expect(skip).toBeFocused();
    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "correcoes-skip-link-foco");

    await page.keyboard.press("Enter");
    await expect(page.locator("main#conteudo")).toBeFocused();
    await expect(page).toHaveURL(/#conteudo$/);
  });

  test("o skip-link é o primeiro foco também na página não encontrada", async ({ page }) => {
    await page.goto("/naoexiste");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  });
});
