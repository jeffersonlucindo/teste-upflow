import { defineConfig, devices } from "@playwright/test";

/**
 * E2E contra o build de produção (recomendação do guia de Playwright do Next).
 * Sem E2E_BASE_URL, o Playwright faz o build e sobe o servidor numa porta própria, sempre do
 * zero: reaproveitar um servidor já de pé validaria um build antigo.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL ?? `http://localhost:${PORT}`;

// O servidor do Next lê o .env.local sozinho; aqui é só para os specs saberem se há token do TMDB.
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local: os specs que dependem do TMDB são pulados com motivo (e2e/support/tmdb.ts)
}

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.output/results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { outputFolder: "e2e/.output/report", open: "never" }]],
  use: {
    baseURL,
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // As duas larguras verificadas em toda tela (D35 em .work/design/decisoes.md).
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180_000,
      },
});
