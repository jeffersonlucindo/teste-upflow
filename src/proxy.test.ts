import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

function run(path: string) {
  return proxy(new NextRequest(`http://localhost:3000${path}`));
}

describe("proxy: /movie/:id", () => {
  it.each(["/movie/603", "/movie/1", "/movie/999999999"])("deixa passar %s", (path) => {
    const response = run(path);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each(["/movie/abc", "/movie/0603", "/movie/0", "/movie/603abc", "/movie/-1", "/movie/6.3"])(
    "reescreve %s para um caminho sem rota",
    (path) => {
      const response = run(path);
      const target = response.headers.get("x-middleware-rewrite");

      expect(response.headers.get("x-middleware-next")).toBeNull();
      expect(target).not.toBeNull();
      expect(new URL(target as string).pathname).not.toMatch(/^\/movie\//);
    },
  );

  it("restringe o matcher a /movie/:id", () => {
    expect(config.matcher).toBe("/movie/:id");
  });
});
