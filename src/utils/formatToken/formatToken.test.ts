import { describe, it, expect } from "vitest";
import { formatTokens, formatWei, toWei } from "./formatToken";

describe("formatTokens", () => {
  it("should return 0.00 for empty input", () => {
    expect(formatTokens("")).toBe("0.00");
    expect(formatTokens("0")).toBe("0.00");
  });

  it("should format 1 ether (1e18 wei)", () => {
    expect(formatTokens("1000000000000000000")).toBe("1.00");
  });

  it("should format 0.5 ether", () => {
    expect(formatTokens("500000000000000000")).toBe("0.5");
  });

  it("should format with decimals", () => {
    expect(formatTokens("1234567890123456789")).toBe("1.234567890123456789");
  });

  it("should add thousand separators", () => {
    expect(formatTokens("1000000000000000000000")).toBe("1,000.00");
  });

  it("should handle very large amounts", () => {
    const result = formatTokens("999999999999999999999999");
    expect(result).toContain("999,999");
  });

  it("should handle custom decimals", () => {
    expect(formatTokens("1000000", 6)).toBe("1.00");
  });

  it("should remove trailing zeros", () => {
    expect(formatTokens("1500000000000000000")).toBe("1.5");
  });

  it("should handle amounts less than 1", () => {
    expect(formatTokens("100000000000000000")).toBe("0.1");
  });
});

describe("formatWei", () => {
  it("should return 0 for empty input", () => {
    expect(formatWei("")).toBe("0");
    expect(formatWei("0")).toBe("0");
  });

  it("should add commas to large numbers", () => {
    expect(formatWei("1000000000000000000")).toBe("1,000,000,000,000,000,000");
  });

  it("should handle numbers without commas needed", () => {
    expect(formatWei("100")).toBe("100");
  });
});

describe("toWei", () => {
  it("should return 0 for empty input", () => {
    expect(toWei("")).toBe("0");
    expect(toWei("0")).toBe("0");
  });

  it("should convert 1 token to wei", () => {
    expect(toWei("1")).toBe("1000000000000000000");
  });

  it("should convert 0.5 token to wei", () => {
    expect(toWei("0.5")).toBe("500000000000000000");
  });

  it("should convert with custom decimals", () => {
    expect(toWei("1", 6)).toBe("1000000");
  });

  it("should handle very small amounts", () => {
    expect(toWei("0.000000000000000001")).toBe("1");
  });

  it("should handle amounts with many decimals", () => {
    expect(toWei("1.123456789123456789")).toBe("1123456789123456789");
  });

  it("should pad decimals correctly", () => {
    expect(toWei("1.5")).toBe("1500000000000000000");
  });
});
