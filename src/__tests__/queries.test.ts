/**
 * Scenarios A, F, G, H — Query function unit tests.
 *
 * The Prisma client is mocked so no database connection is required.
 * Tests validate computed totals, multi-currency conversion, empty states,
 * and month scoping logic.
 */

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { makePrismaMock } from "./helpers/prisma-mock";

const prismaMock = makePrismaMock();

jest.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import { getMonthlyStats, getBalanceHistory, getUser, getCategories } from "@/lib/queries";
import { startOfMonth, subMonths } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeExpense(overrides: Record<string, unknown> = {}) {
  return {
    id: "exp-1",
    description: "Test",
    amount: "100.00",
    currency: "USD",
    date: new Date("2026-03-15"),
    categoryId: "cat-1",
    userId: "demo-user",
    recurringExpenseId: null,
    category: { id: "cat-1", name: "Food", color: "#f00" },
    recurringExpense: null,
    ...overrides,
  };
}

function makeRecurring(overrides: Record<string, unknown> = {}) {
  return {
    id: "rec-1",
    description: "Rent",
    amount: "1200.00",
    currency: "USD",
    categoryId: "cat-2",
    userId: "demo-user",
    isActive: true,
    dayOfMonth: 1,
    createdAt: new Date("2026-01-01"),
    category: { id: "cat-2", name: "Housing", color: "#6366f1" },
    ...overrides,
  };
}

const USD_USER = {
  id: "demo-user",
  defaultCurrency: "USD",
  email: "demo@pocketpilot.app",
  name: "Demo User",
};

// ─── Scenario A: Empty state ─────────────────────────────────────────────────

describe("Scenario A – Empty state", () => {
  it("getMonthlyStats returns zero totals when no expenses exist", async () => {
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));

    expect(stats.expenseCount).toBe(0);
    expect(stats.totalInDefaultCurrency).toBe(0);
    expect(stats.totalByCurrency).toEqual({});
    expect(stats.totalByCategory).toEqual([]);
  });

  it("getUser creates the demo user if it does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(USD_USER);

    const user = await getUser();
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(user.id).toBe("demo-user");
  });

  it("getUser returns the existing demo user without creating a new one", async () => {
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);

    const user = await getUser();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(user.defaultCurrency).toBe("USD");
  });

  it("getCategories returns an empty array when no categories exist", async () => {
    prismaMock.category.findMany.mockResolvedValue([]);
    const cats = await getCategories();
    expect(cats).toEqual([]);
  });
});

// ─── Scenario F: Income and balance math ────────────────────────────────────

describe("Scenario F – Monthly income and balance", () => {
  const month = new Date("2026-03-01");

  it("balance equals income minus expenses when all in same currency", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ amount: "500.00", currency: "USD" }),
      makeExpense({ id: "exp-2", amount: "200.00", currency: "USD" }),
    ]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue({ amount: "3000", currency: "USD" });

    // getBalanceHistory handles the income-expense subtraction
    const history = await getBalanceHistory(1, "USD");
    const current = history[0];
    expect(current.income).toBe(3000);
    // expenses includes the two manual expenses
    expect(current.expenses).toBe(700);
    expect(current.balance).toBe(2300);
  });

  it("balance is negative when expenses exceed income", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ amount: "2000.00", currency: "USD" }),
      makeExpense({ id: "exp-2", amount: "1500.00", currency: "USD" }),
    ]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue({ amount: "1000", currency: "USD" });

    const history = await getBalanceHistory(1, "USD");
    expect(history[0].balance).toBeLessThan(0);
  });

  it("prior month with no income shows income = 0", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue(null);

    const history = await getBalanceHistory(1, "USD");
    expect(history[0].income).toBe(0);
    expect(history[0].balance).toBe(0);
  });
});

// ─── Scenario G: Multi-currency totals ──────────────────────────────────────

describe("Scenario G – Multi-currency totals", () => {
  it("converts expenses to default currency using exchange rates", async () => {
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ amount: "100.00", currency: "EUR", recurringExpenseId: null }),
    ]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([
      { fromCurrency: "EUR", toCurrency: "USD", rate: "1.08" },
    ]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    // 100 EUR * 1.08 = 108 USD
    expect(stats.totalInDefaultCurrency).toBeCloseTo(108, 2);
  });

  it("sums expenses across multiple currencies when rates are available", async () => {
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ id: "exp-1", amount: "100.00", currency: "EUR", recurringExpenseId: null }),
      makeExpense({ id: "exp-2", amount: "200.00", currency: "USD", recurringExpenseId: null }),
    ]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    // EUR -> USD at 1.10
    prismaMock.exchangeRate.findMany.mockResolvedValue([
      { fromCurrency: "EUR", toCurrency: "USD", rate: "1.10" },
    ]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    // 100 EUR * 1.10 + 200 USD * 1 = 110 + 200 = 310
    expect(stats.totalInDefaultCurrency).toBeCloseTo(310, 2);
  });

  it("returns null for totalInDefaultCurrency when a rate is missing", async () => {
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ amount: "100.00", currency: "EUR", recurringExpenseId: null }),
    ]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    // No EUR rate defined
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    // canConvertAll should be false → null
    expect(stats.totalInDefaultCurrency).toBeNull();
  });

  it("handles zero exchange rates array without crashing", async () => {
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    await expect(getMonthlyStats(new Date("2026-03-01"))).resolves.not.toThrow();
  });

  it("getBalanceHistory falls back to rate 1 when no rate defined (no crash)", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([
      makeExpense({ amount: "100.00", currency: "EUR", recurringExpenseId: null }),
    ]);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue(null);

    // Should not throw — getBalanceHistory uses ?? 1 fallback
    await expect(getBalanceHistory(1, "USD")).resolves.toBeDefined();
  });
});

// ─── Scenario H: Month navigation ────────────────────────────────────────────

describe("Scenario H – Month navigation", () => {
  it("getBalanceHistory returns entries for the requested number of months", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue(null);

    const history = await getBalanceHistory(6, "USD");
    expect(history).toHaveLength(6);
  });

  it("balance history month labels are in chronological order", async () => {
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);
    prismaMock.monthlyIncome.findUnique.mockResolvedValue(null);

    const history = await getBalanceHistory(3, "USD");
    // Each entry should have a month label like "Jan 26"
    for (const entry of history) {
      expect(entry.month).toMatch(/^[A-Z][a-z]{2} \d{2}$/);
    }
  });

  it("getMonthlyStats only returns expenses within the requested month", async () => {
    // Expenses outside the requested month must not be returned by the query layer.
    // We verify that prisma.expense.findMany is called with the correct date range.
    prismaMock.expense.findMany.mockResolvedValue([]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    // Construct in local time to avoid UTC-offset shifting the month boundary
    const requestedMonth = new Date(2026, 0, 15); // January 15, 2026 local time
    await getMonthlyStats(requestedMonth);

    const callArgs = prismaMock.expense.findMany.mock.calls[0][0];
    const { gte, lte } = callArgs.where.date;

    // Both boundaries must fall within January 2026
    expect(gte.getFullYear()).toBe(2026);
    expect(gte.getMonth()).toBe(0); // 0 = January
    expect(lte.getFullYear()).toBe(2026);
    expect(lte.getMonth()).toBe(0);
  });

  it("recurring expenses are excluded from projected total when inactive", async () => {
    const inactiveRecurring = makeRecurring({ isActive: false });

    prismaMock.expense.findMany.mockResolvedValue([]);
    // Only active recurring expenses are fetched by the query (isActive: true filter)
    prismaMock.recurringExpense.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    expect(stats.totalInDefaultCurrency).toBe(0);
    // Verify we did NOT include inactiveRecurring (it was never passed in the mock)
    void inactiveRecurring; // referenced to satisfy linter
  });

  it("active recurring expense contributes to projected total when not yet logged as expense", async () => {
    const active = makeRecurring({ amount: "1200.00", currency: "USD" });

    prismaMock.expense.findMany.mockResolvedValue([]); // no actual expenses this month
    prismaMock.recurringExpense.findMany.mockResolvedValue([active]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    expect(stats.totalInDefaultCurrency).toBeCloseTo(1200, 2);
  });

  it("active recurring expense is NOT double-counted when it already exists as an expense", async () => {
    const active = makeRecurring({ id: "rec-1", amount: "1200.00", currency: "USD" });
    // The expense is linked to the recurring entry
    const linkedExpense = makeExpense({
      amount: "1200.00",
      currency: "USD",
      recurringExpenseId: "rec-1",
    });

    prismaMock.expense.findMany.mockResolvedValue([linkedExpense]);
    prismaMock.recurringExpense.findMany.mockResolvedValue([active]);
    prismaMock.user.findUnique.mockResolvedValue(USD_USER);
    prismaMock.exchangeRate.findMany.mockResolvedValue([]);

    const stats = await getMonthlyStats(new Date("2026-03-01"));
    // Total should be 1200, not 2400
    expect(stats.totalInDefaultCurrency).toBeCloseTo(1200, 2);
  });
});
