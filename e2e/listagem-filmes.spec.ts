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

requiresTmdb();

const META = /^(Nota \d+,\d|Sem nota)/;
const HINT = "Gênero e ordenação não se aplicam à busca por título (limitação da API).";

function controls(page: Page) {
  return {
    search: page.getByRole("searchbox", { name: "Buscar por título" }),
    genre: page.getByRole("combobox", { name: "Gênero" }),
    sort: page.getByRole("combobox", { name: "Ordenar por" }),
    pagination: page.getByRole("navigation", { name: "Paginação" }),
    grid: page.getByRole("list").filter({ has: page.getByRole("article") }),
    cards: page.getByRole("article"),
  };
}

/** Abre a URL e espera os gêneros e os cards (a barra só habilita depois de carregar). */
async function openListing(page: Page, url = "/") {
  await page.goto(url);
  const { genre, cards } = controls(page);
  await expect(genre).toBeEnabled();
  await expect(cards.first()).toBeVisible();
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

function totalPagesOf(text: string | null): number {
  const match = /de (\d+)/.exec(text ?? "");
  expect(match, `texto de paginação inesperado: ${text}`).not.toBeNull();
  return Number(match![1]);
}

test.describe("listagem de filmes", () => {
  test("primeira página: 20 cards, paginação e links de detalhe", async ({ page }, testInfo) => {
    await openListing(page);
    const { cards, grid, pagination, search, genre, sort } = controls(page);

    await expect(page.getByRole("heading", { level: 1, name: "Filmes populares" })).toBeVisible();
    await expect(cards).toHaveCount(20);
    await expect(grid).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card.getByRole("link", { name: /^Ver detalhes de .+/ })).toHaveAttribute(
        "href",
        /^\/movie\/\d+$/,
      );
      await expect(card.getByText(META)).toBeVisible();
    }

    // "Anterior" é texto desabilitado; "Próxima" é link para a página 2.
    await expect(pagination.getByRole("link", { name: "Anterior" })).toHaveCount(0);
    await expect(pagination.getByText("Anterior")).toHaveAttribute("aria-disabled", "true");
    await expect(pagination.getByRole("link", { name: "Próxima" })).toHaveAttribute("href", "/?page=2");
    const total = totalPagesOf(await pagination.getByText(/^Página 1 de \d+$/).textContent());
    expect(total).toBeGreaterThan(1);
    expect(total).toBeLessThanOrEqual(500);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectFontVariable(page.getByRole("heading", { level: 1 }), "--font-heading");
    await expectFontVariable(page.locator("body"), "--font-body");
    await expectMinHeight(search);
    await expectMinHeight(genre);
    await expectMinHeight(sort);
    await expectMinHeight(pagination.getByRole("link"));

    // Grid: 2 colunas a 390 px, 4 ou mais a 1280 px.
    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    if (testInfo.project.name === "mobile") {
      expect(columns).toBe(2);
      // Busca em linha própria; selects lado a lado.
      const [s, g, o] = await Promise.all([search, genre, sort].map((control) => control.boundingBox()));
      expect(s!.y + s!.height).toBeLessThanOrEqual(g!.y);
      expect(Math.abs(g!.y - o!.y)).toBeLessThan(2);
    } else {
      expect(columns).toBeGreaterThanOrEqual(4);
    }
    await captureLayout(page, testInfo, "listagem-carregado");
  });

  test("paginação por links e `from` no card", async ({ page }) => {
    await openListing(page);
    const { pagination, cards } = controls(page);

    // A URL só muda quando a página 2 chega do servidor, que busca no TMDB sem cache.
    await pagination.getByRole("link", { name: "Próxima" }).click();
    await expect(page).toHaveURL("/?page=2", { timeout: 15_000 });
    await expect(pagination.getByText(/^Página 2 de \d+$/)).toBeVisible();
    await expect(pagination.getByRole("link", { name: "Anterior" })).toHaveAttribute("href", "/");
    await expect(pagination.getByRole("link", { name: "Próxima" })).toHaveAttribute("href", "/?page=3");
    await expect(cards.first().getByRole("link", { name: /^Ver detalhes de/ })).toHaveAttribute(
      "href",
      /^\/movie\/\d+\?from=page%3D2$/,
    );

    await pagination.getByRole("link", { name: "Anterior" }).click();
    await expect(page).toHaveURL("/");
  });

  test("página intermediária mantém os demais parâmetros nos dois links", async ({ page }) => {
    await openListing(page, "/?genre=28&page=3");
    const { pagination, genre } = controls(page);

    await expect(genre).toHaveValue("28");
    await expect(pagination.getByText(/^Página 3 de \d+$/)).toBeVisible();
    await expect(pagination.getByRole("link", { name: "Anterior" })).toHaveAttribute(
      "href",
      "/?genre=28&page=2",
    );
    await expect(pagination.getByRole("link", { name: "Próxima" })).toHaveAttribute(
      "href",
      "/?genre=28&page=4",
    );
  });

  test("última página desabilita a \"Próxima\"", async ({ page }) => {
    // page=501 vira 500 (teto do parser): lê o total real de lá.
    await openListing(page, "/?page=500");
    const { pagination } = controls(page);
    const total = totalPagesOf(await pagination.getByText(/^Página \d+ de \d+$/).textContent());

    if (total < 500) {
      await openListing(page, `/?page=${total}`);
    }
    await expect(pagination.getByText("Próxima")).toHaveAttribute("aria-disabled", "true");
    await expect(pagination.getByRole("link", { name: "Próxima" })).toHaveCount(0);
    await expect(pagination.getByRole("link", { name: "Anterior" })).toBeVisible();
  });

  test("página acima do total mostra o estado vazio e leva à última", async ({ page }, testInfo) => {
    // A busca por "matrix" tem poucas páginas; a URL direta é o requisito do cenário.
    await page.goto("/?q=matrix&page=500");
    await expect(page.getByText("Esta página não existe")).toBeVisible();
    const description = page.getByText(/^A lista tem [\d.]+ páginas?\.$/);
    await expect(description).toBeVisible();
    const total = Number(/\d+/.exec((await description.textContent()) ?? "")![0]);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "listagem-pagina-inexistente");

    const action = page.getByRole("link", { name: "Ir para a última página" });
    await expect(action).toHaveAttribute("href", `/?q=matrix&page=${total}`);
    await action.click();
    await expect(page).toHaveURL(`/?q=matrix&page=${total}`);
    await expect(controls(page).pagination.getByText(`Página ${total} de ${total}`)).toBeVisible();
  });

  test("gênero: escolhe, zera a página, preserva a ordenação e o voltar retorna", async ({ page }) => {
    await openListing(page);
    const { genre, sort, pagination } = controls(page);

    await expect(genre.getByRole("option").first()).toHaveText("Todos");
    await expect(genre.getByRole("option", { name: "Ação", exact: true })).toHaveCount(1);

    await chooseOption(page, "sort", "Nota", "/?sort=rating");
    await pagination.getByRole("link", { name: "Próxima" }).click();
    await expect(page).toHaveURL("/?sort=rating&page=2");

    await chooseOption(page, "genre", "Ação", "/?genre=28&sort=rating");
    await expect(genre).toHaveValue("28");
    await expect(sort).toHaveValue("rating");
    await expect(pagination.getByText(/^Página 1 de \d+$/)).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL("/?sort=rating&page=2");
    await expect(genre).toHaveValue("");

    await chooseOption(page, "genre", "Ação", "/?genre=28&sort=rating");
    await chooseOption(page, "genre", "Todos", "/?sort=rating");
  });

  test("gênero sem resultado mostra \"Limpar filtros\"", async ({ page }, testInfo) => {
    await page.goto("/?genre=999999");
    await expect(page.getByText("Nenhum filme encontrado", { exact: true })).toBeVisible();
    await expect(controls(page).cards).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectMinHeight(page.getByRole("link", { name: "Limpar filtros" }));
    await captureLayout(page, testInfo, "listagem-vazio");

    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL("/");
    await expect(controls(page).cards.first()).toBeVisible();
  });

  test("ordenação: opções, nota, data de lançamento e retorno à popularidade", async ({ page }) => {
    await openListing(page);
    const { sort, cards } = controls(page);

    await expect(sort).toHaveValue("popularity");
    await expect(sort.getByRole("option")).toHaveText(["Popularidade", "Nota", "Data de lançamento"]);

    await chooseOption(page, "sort", "Nota", "/?sort=rating");
    await expect(sort).toHaveValue("rating");
    await expect(cards).toHaveCount(20);

    await chooseOption(page, "sort", "Data de lançamento", "/?sort=release");
    await expect(sort).toHaveValue("release");
    await expect(cards).toHaveCount(20);
    const firstMeta = (await cards.first().getByText(META).textContent()) ?? "";
    const year = /· (\d{4})$/.exec(firstMeta)?.[1];
    if (year) expect(Number(year)).toBeLessThanOrEqual(new Date().getFullYear());

    await chooseOption(page, "sort", "Popularidade", "/");
    await expect(sort).toHaveValue("popularity");
  });

  test("busca: aplica após o debounce, entra em modo busca e limpa", async ({ page }, testInfo) => {
    await openListing(page);
    const { search, genre, sort, cards } = controls(page);

    await typeSearch(page, "matrix", "/?q=matrix");
    await expect(cards.first()).toBeVisible();
    await expect(page.getByText(/^[\d.]+ resultados? para “matrix”$/)).toBeVisible();

    const hint = page.getByText(HINT);
    await expect(hint).toBeVisible();
    await expect(genre).toBeDisabled();
    await expect(sort).toBeDisabled();
    await expect(genre).toHaveAccessibleDescription(HINT);
    await expect(sort).toHaveAccessibleDescription(HINT);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await captureLayout(page, testInfo, "listagem-busca");

    await expect(async () => {
      await search.fill("");
      await expect(page).toHaveURL("/", { timeout: 3_000 });
    }).toPass();
    await expect(genre).toBeEnabled();
    await expect(sort).toBeEnabled();
    await expect(hint).toHaveCount(0);
  });

  test("busca: Enter aplica na hora", async ({ page }) => {
    await openListing(page);
    const { search } = controls(page);

    await expect(async () => {
      await search.fill("");
      await search.fill("alien");
      await search.press("Enter");
      await expect(page).toHaveURL("/?q=alien", { timeout: 3_000 });
    }).toPass();
    await expect(controls(page).cards.first()).toBeVisible();
  });

  test("busca sobre filtro ativo remove gênero e ordenação da URL", async ({ page }) => {
    await openListing(page);
    const { genre, sort } = controls(page);

    await chooseOption(page, "genre", "Ação", "/?genre=28");
    await chooseOption(page, "sort", "Nota", "/?genre=28&sort=rating");

    await typeSearch(page, "matrix", "/?q=matrix");
    await expect(genre).toHaveValue("");
    await expect(sort).toHaveValue("popularity");
    await expect(genre).toBeDisabled();
    await expect(sort).toBeDisabled();
  });

  test("busca sem resultado oferece \"Limpar busca\"", async ({ page }, testInfo) => {
    await openListing(page);

    await typeSearch(page, "zzzzqqqq", "/?q=zzzzqqqq");
    await expect(page.getByText("Nenhum filme encontrado para “zzzzqqqq”")).toBeVisible();
    await expect(controls(page).cards).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectMinHeight(page.getByRole("link", { name: "Limpar busca" }));
    await captureLayout(page, testInfo, "listagem-sem-resultado");

    await page.getByRole("link", { name: "Limpar busca" }).click();
    await expect(page).toHaveURL("/");
    await expect(controls(page).search).toHaveValue("");
    await expect(controls(page).cards.first()).toBeVisible();
  });

  test("voltar e avançar sincronizam o campo de busca", async ({ page }) => {
    await openListing(page);
    const { search, pagination, cards } = controls(page);

    await pagination.getByRole("link", { name: "Próxima" }).click();
    await expect(page).toHaveURL("/?page=2");
    await typeSearch(page, "matrix", "/?q=matrix");
    await expect(search).toHaveValue("matrix");

    // A busca usa replace: voltar cai na entrada anterior ("/"), não em /?page=2.
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(search).toHaveValue("");
    await expect(cards).toHaveCount(20);
    await expect(pagination.getByText(/^Página 1 de \d+$/)).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL("/?q=matrix");
    await expect(search).toHaveValue("matrix");
  });

  test("busca aberta por URL preenche o campo e leva `from` ao card", async ({ page }) => {
    await page.goto("/?q=matrix&page=2");
    const { search, cards, pagination } = controls(page);
    await expect(search).toHaveValue("matrix");
    await expect(cards.first()).toBeVisible();
    await expect(pagination.getByText(/^Página 2 de \d+$/)).toBeVisible();
    await expect(cards.first().getByRole("link", { name: /^Ver detalhes de/ })).toHaveAttribute(
      "href",
      /^\/movie\/\d+\?from=q%3Dmatrix%26page%3D2$/,
    );
  });

  test("teclado: ordem dos controles e anel de foco", async ({ page }) => {
    await openListing(page);
    const { search, genre, sort, cards, pagination } = controls(page);
    const posterLink = cards.first().getByRole("link", { name: /^Ver detalhes de/ });

    await search.focus();
    await expect(search).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(genre).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(sort).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(posterLink).toBeFocused();

    await expectFocusRing(search);
    await expectFocusRing(genre);
    await expectFocusRing(sort);
    await expectFocusRing(posterLink);
    await expectFocusRing(pagination.getByRole("link", { name: "Próxima" }));
  });
});

test.describe("listagem: navegação pendente", () => {
  /**
   * Segura as respostas de navegação client (payload RSC) até `release()`, para o estado pendente
   * durar o bastante para ser observado. O fetch do TMDB roda no servidor e não é interceptável.
   */
  async function holdNavigations(page: Page) {
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

    return release;
  }

  /** Abre a listagem e ordena por nota: a URL reagir prova que a barra já está hidratada. */
  async function openHydrated(page: Page) {
    await openListing(page);
    await chooseOption(page, "sort", "Nota", "/?sort=rating");
    await expect(controls(page).cards.first()).toBeVisible();
  }

  test("escolha do gênero fica no select e os resultados antigos ficam ocupados", async ({ page }) => {
    await openHydrated(page);
    const { genre, cards } = controls(page);
    const region = page.locator("div[aria-busy]");
    const status = page.getByRole("status").filter({ hasText: "Atualizando resultados…" });
    const release = await holdNavigations(page);

    await genre.selectOption({ label: "Ação" });

    // A URL ainda é a antiga, mas a escolha do usuário não some do select.
    await expect(region).toHaveAttribute("aria-busy", "true");
    await expect(page).toHaveURL("/?sort=rating");
    await expect(genre).toHaveValue("28");
    await expect(status).toHaveCount(1);
    await expect(region).toHaveClass(/opacity-60/);
    await expect(cards).toHaveCount(20);
    await expect(page.getByText("Carregando filmes")).toHaveCount(0);

    release();
    await expect(page).toHaveURL("/?genre=28&sort=rating");
    await expect(region).toHaveAttribute("aria-busy", "false");
    await expect(genre).toHaveValue("28");
    await expect(status).toHaveCount(0);
  });

  test("busca superada por outro filtro não deixa texto órfão no campo", async ({ page }) => {
    await openHydrated(page);
    const { search, genre } = controls(page);
    const region = page.locator("div[aria-busy]");
    const release = await holdNavigations(page);

    // A busca sai depois do debounce e fica pendente; o gênero ainda está habilitado.
    await search.fill("mat");
    await expect(region).toHaveAttribute("aria-busy", "true");
    await expect(genre).toBeEnabled();
    await genre.selectOption({ label: "Ação" });

    release();
    await expect(page).toHaveURL("/?genre=28&sort=rating");
    await expect(region).toHaveAttribute("aria-busy", "false");
    // O campo acompanha a URL, que não tem busca.
    await expect(search).toHaveValue("");

    // E continua funcionando: a mesma busca pode ser feita de novo.
    await typeSearch(page, "mat", "/?q=mat");
  });
});
