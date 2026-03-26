/**
 * Tests for constants.ts — currency helpers and the DEMO_USER_ID sentinel.
 */

import { CURRENCIES, DEMO_USER_ID, getCurrencySymbol, formatMoney } from "@/lib/constants";

describe("DEMO_USER_ID", () => {
  it("equals the expected seed value", () => {
    expect(DEMO_USER_ID).toBe("demo-user");
  });
});

describe("CURRENCIES", () => {
  it("contains exactly 10 currencies", () => {
    expect(CURRENCIES).toHaveLength(10);
  });

  it("includes USD", () => {
    expect(CURRENCIES.some((c) => c.code === "USD")).toBe(true);
  });

  it("every entry has code, name and symbol", () => {
    for (const c of CURRENCIES) {
      expect(typeof c.code).toBe("string");
      expect(c.code.length).toBeGreaterThan(0);
      expect(typeof c.name).toBe("string");
      expect(typeof c.symbol).toBe("string");
    }
  });

  it("has no duplicate codes", () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("getCurrencySymbol", () => {
  it("returns $ for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  it("returns € for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  it("returns the code itself for an unknown currency", () => {
    expect(getCurrencySymbol("ZZZ")).toBe("ZZZ");
  });
});

describe("formatMoney", () => {
  it("formats a number with two decimal places", () => {
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
  });

  it("formats a string amount", () => {
    expect(formatMoney("99.9", "EUR")).toBe("€99.90");
  });

  it("formats zero correctly", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
  });

  it("formats negative amounts (expenses that exceed income)", () => {
    // formatMoney does not gate on sign; it should render faithfully
    expect(formatMoney(-50, "USD")).toBe("$-50.00");
  });

  it("uses the currency code as symbol when currency is unknown", () => {
    const result = formatMoney(100, "ZZZ");
    expect(result.startsWith("ZZZ")).toBe(true);
  });
});
