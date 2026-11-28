import { describe, expect, test } from "vitest";
import {
  DEFAULT_GAME,
  parseGameParam,
  withDefaultGameParam,
} from "../src/lib/game-param";

describe("parseGameParam", () => {
  test("should accept known games", () => {
    expect(parseGameParam("hollowknight")).toBe("hollowknight");
    expect(parseGameParam("silksong")).toBe("silksong");
  });

  test("should reject a missing game", () => {
    expect(parseGameParam(null)).toBeNull();
    expect(parseGameParam("")).toBeNull();
  });

  test("should reject an unknown game", () => {
    expect(parseGameParam("hollowknight2")).toBeNull();
    expect(parseGameParam("Silksong")).toBeNull();
  });
});

describe("withDefaultGameParam", () => {
  test("should add the default game", () => {
    const params = withDefaultGameParam(new URLSearchParams());
    expect(params.toString()).toBe(`game=${DEFAULT_GAME}`);
  });

  test("should replace an unknown game and keep other params", () => {
    const original = new URLSearchParams("builtin=any&game=nope");
    const params = withDefaultGameParam(original);
    expect(params.get("builtin")).toBe("any");
    expect(params.get("game")).toBe(DEFAULT_GAME);
    expect(original.get("game")).toBe("nope");
  });
});
