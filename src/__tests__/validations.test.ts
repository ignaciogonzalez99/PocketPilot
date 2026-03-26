/**
 * Scenario I — Input validation
 *
 * Tests all Zod schemas directly.  No database or network calls are made.
 */

import {
  expenseSchema,
  recurringExpenseSchema,
  categorySchema,
  settingsSchema,
  monthlyIncomeSchema,
} from "@/lib/validations";

// ─── expenseSchema ──────────────────────────────────────────────────────────

describe("expenseSchema", () => {
  const valid = {
    description: "Coffee",
    amount: "4.50",
    currency: "USD",
    date: "2026-03-01",
    categoryId: "cat-1",
  };

  it("accepts a minimal valid expense", () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts notes up to 500 characters", () => {
    const result = expenseSchema.safeParse({ ...valid, notes: "a".repeat(500) });
    expect(result.success).toBe(true);
  });

  it("rejects missing description", () => {
    const result = expenseSchema.safeParse({ ...valid, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 200 characters", () => {
    const result = expenseSchema.safeParse({ ...valid, description: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects amount of zero", () => {
    const result = expenseSchema.safeParse({ ...valid, amount: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = expenseSchema.safeParse({ ...valid, amount: "-1.00" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    const result = expenseSchema.safeParse({ ...valid, amount: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing currency", () => {
    const result = expenseSchema.safeParse({ ...valid, currency: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = expenseSchema.safeParse({ ...valid, date: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const result = expenseSchema.safeParse({ ...valid, categoryId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects notes longer than 500 characters", () => {
    const result = expenseSchema.safeParse({ ...valid, notes: "n".repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ─── recurringExpenseSchema ─────────────────────────────────────────────────

describe("recurringExpenseSchema", () => {
  const valid = {
    description: "Rent",
    amount: "1200",
    currency: "USD",
    categoryId: "cat-1",
    dayOfMonth: 1,
  };

  it("accepts a valid recurring expense on day 1", () => {
    expect(recurringExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts dayOfMonth = 28", () => {
    expect(recurringExpenseSchema.safeParse({ ...valid, dayOfMonth: 28 }).success).toBe(true);
  });

  it("rejects dayOfMonth = 0", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, dayOfMonth: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects dayOfMonth = 29", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, dayOfMonth: 29 });
    expect(result.success).toBe(false);
  });

  it("rejects negative dayOfMonth", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, dayOfMonth: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects amount of zero", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, amount: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 200 characters", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, description: "d".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects notes longer than 500 characters", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, notes: "n".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("coerces string dayOfMonth to number", () => {
    const result = recurringExpenseSchema.safeParse({ ...valid, dayOfMonth: "15" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dayOfMonth).toBe(15);
  });
});

// ─── categorySchema ─────────────────────────────────────────────────────────

describe("categorySchema", () => {
  it("accepts valid name and color", () => {
    expect(categorySchema.safeParse({ name: "Food", color: "#f59e0b" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(categorySchema.safeParse({ name: "", color: "#f59e0b" }).success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = categorySchema.safeParse({ name: "c".repeat(51), color: "#000000" });
    expect(result.success).toBe(false);
  });

  it("accepts name exactly 50 characters", () => {
    expect(categorySchema.safeParse({ name: "c".repeat(50), color: "#000000" }).success).toBe(true);
  });

  it("rejects empty color", () => {
    expect(categorySchema.safeParse({ name: "Food", color: "" }).success).toBe(false);
  });
});

// ─── settingsSchema ──────────────────────────────────────────────────────────

describe("settingsSchema", () => {
  it("accepts currency with optional name", () => {
    expect(settingsSchema.safeParse({ defaultCurrency: "EUR" }).success).toBe(true);
  });

  it("accepts currency and name together", () => {
    expect(settingsSchema.safeParse({ defaultCurrency: "USD", name: "Demo User" }).success).toBe(true);
  });

  it("rejects empty currency", () => {
    expect(settingsSchema.safeParse({ defaultCurrency: "" }).success).toBe(false);
  });
});

// ─── monthlyIncomeSchema ─────────────────────────────────────────────────────

describe("monthlyIncomeSchema", () => {
  const valid = {
    amount: "5000",
    currency: "USD",
    month: "2026-03-01",
  };

  it("accepts a valid income entry", () => {
    expect(monthlyIncomeSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts amount = 0 (income may legitimately be zero)", () => {
    expect(monthlyIncomeSchema.safeParse({ ...valid, amount: "0" }).success).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(monthlyIncomeSchema.safeParse({ ...valid, amount: "-100" }).success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    expect(monthlyIncomeSchema.safeParse({ ...valid, amount: "abc" }).success).toBe(false);
  });

  it("rejects missing month", () => {
    expect(monthlyIncomeSchema.safeParse({ ...valid, month: "" }).success).toBe(false);
  });

  it("rejects notes longer than 500 characters", () => {
    const result = monthlyIncomeSchema.safeParse({ ...valid, notes: "n".repeat(501) });
    expect(result.success).toBe(false);
  });
});
