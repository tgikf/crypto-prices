import { describe, expect, test } from "@jest/globals";
import evaluatePrice from "./utils";

describe("Utils", () => {
  test("evaluates the price correctly if it has trialing zeros", () => {
    expect(evaluatePrice("18101.370000", "18115.500000")).toEqual([3, 5, 8]);
  });
  test("evaluates the price correctly if it has no trailing zeros", () => {
    expect(evaluatePrice("22101.121212", "28115.333333")).toEqual([
      1,
      3,
      undefined,
    ]);
  });
  test("evaluates the price correctly if it has only zero decimals", () => {
    expect(evaluatePrice("223.000000", "145.000000")).toEqual([0, 2, 3]);
  });

  test("evaluates the price correctly if it the differences are the digits around the decimal point", () => {
    expect(evaluatePrice("5813.300002", "5814.400000")).toEqual([
      3,
      6,
      undefined,
    ]);
  });
});
