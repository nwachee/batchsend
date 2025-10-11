import { describe, it, expect } from "vitest";
import {
  calculateTotal,
  parseAmounts,
  parseRecipients,
} from "./calculateTotal"; // adjust the import path

describe("calculateTotal", () => {
  it("should return 0 for empty string", () => {
    expect(calculateTotal("")).toBe(0);
  });

  it("should return 0 for string with only whitespace", () => {
    expect(calculateTotal("   ")).toBe(0);
    expect(calculateTotal("\n\t")).toBe(0);
  });

  it("should return 0 for null or undefined input", () => {
    // @ts-ignore - testing runtime behavior
    expect(calculateTotal(null)).toBe(0);
    // @ts-ignore - testing runtime behavior
    expect(calculateTotal(undefined)).toBe(0);
  });

  it("should handle single number string", () => {
    expect(calculateTotal("10")).toBe(10);
    expect(calculateTotal("5.5")).toBe(5.5);
    expect(calculateTotal("0")).toBe(0);
  });

  it("should handle comma-separated values", () => {
    expect(calculateTotal("1,2,3")).toBe(6);
    expect(calculateTotal("10.5,20.3,30.2")).toBe(61);
    expect(calculateTotal("0,0,0")).toBe(0);
  });

  it("should handle newline-separated values", () => {
    expect(calculateTotal("1\n2\n3")).toBe(6);
    expect(calculateTotal("10.5\n20.3\n30.2")).toBe(61);
  });

  it("should handle mixed comma and newline separators", () => {
    expect(calculateTotal("1,2\n3")).toBe(6);
    expect(calculateTotal("1\n2,3")).toBe(6);
    expect(calculateTotal("1,2\n3,4\n5")).toBe(15);
  });

  it("should ignore empty entries between separators", () => {
    expect(calculateTotal("1,,2")).toBe(3);
    expect(calculateTotal("1,\n,2")).toBe(3);
    expect(calculateTotal(",1,2,")).toBe(3);
    expect(calculateTotal("\n1\n2\n")).toBe(3);
  });

  it("should trim whitespace around values", () => {
    expect(calculateTotal(" 1 , 2 , 3 ")).toBe(6);
    expect(calculateTotal("\t10.5\n 20.3 \n30.2\t")).toBe(61);
  });

  it("should return 0 when any value is not a number", () => {
    expect(calculateTotal("1,abc,3")).toBe(0);
    expect(calculateTotal("10,20,thirty")).toBe(0);
    expect(calculateTotal("1,2,3a")).toBe(0);
    expect(calculateTotal("1.2.3,4")).toBe(0); // invalid decimal
  });

  it("should handle negative numbers", () => {
    expect(calculateTotal("-1,2,-3")).toBe(-2);
    expect(calculateTotal("-10.5,20.3")).toBe(9.8);
  });

  it("should handle large numbers", () => {
    expect(calculateTotal("1000000,2000000,3000000")).toBe(6000000);
    expect(calculateTotal("999999.99,0.01")).toBe(1000000);
  });

  it("should handle decimal precision correctly", () => {
    expect(calculateTotal("0.1,0.2")).toBeCloseTo(0.3);
    expect(calculateTotal("1.234,2.345,3.456")).toBeCloseTo(7.035);
  });
});

describe("parseRecipients", () => {
  it("should return empty array for empty input", () => {
    expect(parseRecipients("")).toEqual([]);
  });

  it("should parse comma-separated addresses", () => {
    const input = "0xabc123, 0xdef456";
    const result = parseRecipients(input);
    expect(result).toEqual(["0xabc123", "0xdef456"]);
  });

  it("should parse newline-separated addresses", () => {
    const input = "0xabc123\n0xdef456";
    const result = parseRecipients(input);
    expect(result).toEqual(["0xabc123", "0xdef456"]);
  });

  it("should filter out non-addresses", () => {
    const input = "0xabc123, invalid, 0xdef456";
    const result = parseRecipients(input);
    expect(result).toEqual(["0xabc123", "0xdef456"]);
  });

  it("should handle mixed separators", () => {
    const input = "0xabc123, 0xdef456\n0xghi789";
    const result = parseRecipients(input);
    expect(result).toEqual(["0xabc123", "0xdef456", "0xghi789"]);
  });
});

describe("parseAmounts", () => {
  it("should return empty array for empty input", () => {
    expect(parseAmounts("")).toEqual([]);
  });

  it("should parse comma-separated amounts", () => {
    const result = parseAmounts("100, 200, 300");
    expect(result).toEqual([100, 200, 300]);
  });

  it("should parse newline-separated amounts", () => {
    const result = parseAmounts("100\n200\n300");
    expect(result).toEqual([100, 200, 300]);
  });

  it("should filter out zeros", () => {
    const result = parseAmounts("100, 0, 200");
    expect(result).toEqual([100, 200]);
  });

  it("should handle large wei amounts", () => {
    const result = parseAmounts("1000000000000000000, 2000000000000000000");
    expect(result).toEqual([1000000000000000000, 2000000000000000000]);
  });
});
