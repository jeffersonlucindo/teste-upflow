import { describe, expect, it } from "vitest";

import { TmdbError, errorKindFromStatus } from "./errors";

describe("errorKindFromStatus", () => {
  it.each([401, 403])("classifica %i como unauthorized", (status) => {
    expect(errorKindFromStatus(status)).toBe("unauthorized");
  });

  it("classifica 404 como not_found", () => {
    expect(errorKindFromStatus(404)).toBe("not_found");
  });

  it("classifica 429 como rate_limited", () => {
    expect(errorKindFromStatus(429)).toBe("rate_limited");
  });

  it.each([400, 422, 500, 503])("classifica %i como unavailable", (status) => {
    expect(errorKindFromStatus(status)).toBe("unavailable");
  });
});

describe("TmdbError", () => {
  it("é um Error com name TmdbError", () => {
    const error = new TmdbError("unavailable", "TMDB indisponível (HTTP 503).");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TmdbError);
    expect(error.name).toBe("TmdbError");
    expect(error.message).toBe("TMDB indisponível (HTTP 503).");
  });

  it("preserva kind e status", () => {
    const error = new TmdbError("rate_limited", "TMDB limitou as requisições (HTTP 429).", {
      status: 429,
    });

    expect(error.kind).toBe("rate_limited");
    expect(error.status).toBe(429);
  });

  it("preserva a causa original", () => {
    const cause = new TypeError("fetch failed");
    const error = new TmdbError("unavailable", "Falha de rede ao chamar o TMDB.", { cause });

    expect(error.cause).toBe(cause);
    expect(error.status).toBeUndefined();
  });

  it("fica sem status e sem causa quando nada é informado", () => {
    const error = new TmdbError("config", "Token ausente.");

    expect(error.status).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });
});
