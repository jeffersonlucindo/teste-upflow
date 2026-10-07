import { expect, test } from "@playwright/test";

import {
  captureLayout,
  expectFocusRing,
  expectFontVariable,
  expectMinHeight,
  expectNoHorizontalOverflow,
  expectTokenColors,
} from "./support/layout";

test.describe("shell", () => {
  test("navega entre Explorar e Favoritos pelo header", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: /Favoritos/ }).click();
    await expect(page).toHaveURL("/favoritos");
    await expect(page.getByRole("heading", { level: 1, name: "Meus favoritos" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Favoritos/ })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Explorar" })).not.toHaveAttribute("aria-current");

    await nav.getByRole("link", { name: "Catálogo." }).click();
    await expect(page).toHaveURL("/");
    await expect(nav.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
  });

  test("layout do shell usa tokens, fontes e alvos de toque do Design System", async ({ page }, testInfo) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await nav.getByRole("link", { name: /Favoritos/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectTokenColors(page);
    await expectMinHeight(nav.getByRole("link", { name: /Explorar|Favoritos/ }));
    await expectFontVariable(page.getByRole("heading", { level: 1 }), "--font-heading");
    await expectFontVariable(page.locator("body"), "--font-body");
    await captureLayout(page, testInfo, "favoritos");
    await expectFocusRing(nav.getByRole("link", { name: "Explorar" }));
  });
});
