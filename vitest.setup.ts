import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Com globals: false a Testing Library não registra o cleanup automático.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
