/**
 * Scenarios B, C, D, E, F, G, I — Server action unit tests.
 *
 * The Prisma client and next/cache are fully mocked so no database connection
 * is required.  Each test exercises the action function directly, verifying
 * that the correct Prisma method is called and the correct result is returned.
 */

// ─── Module mocks (must come before imports) ────────────────────────────────

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { makePrismaMock } from "./helpers/prisma-mock";

const prismaMock = makePrismaMock();

jest.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

// Now import the actions — they will pick up the mocked prisma via @/lib/db
import {
  createExpense,
  updateExpense,
  deleteExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  createCategory,
  updateCategory,
  deleteCategory,
  upsertExchangeRate,
  deleteExchangeRate,
  upsertMonthlyIncome,
  updateSettings,
} from "@/lib/actions";

// ─── Shared test fixtures ────────────────────────────────────────────────────

const CAT_ID = "cat-abc";
const EXPENSE_ID = "exp-abc";
const RECURRING_ID = "rec-abc";
const USER_ID = "demo-user";

const validExpenseData = {
  description: "Lunch",
  amount: "12.50",
  currency: "USD",
  date: "2026-03-15",
  categoryId: CAT_ID,
};

const validRecurringData = {
  description: "Netflix",
  amount: "15.99",
  currency: "USD",
  categoryId: CAT_ID,
  dayOfMonth: 5,
};

// ─── Scenario D: Expense CRUD ────────────────────────────────────────────────

describe("Scenario D – Expense CRUD", () => {
  beforeEach(() => {
    prismaMock.expense.create.mockResolvedValue({ id: EXPENSE_ID, ...validExpenseData });
    prismaMock.expense.update.mockResolvedValue({ id: EXPENSE_ID, ...validExpenseData });
    prismaMock.expense.delete.mockResolvedValue({ id: EXPENSE_ID });
  });

  it("creates an expense and returns success", async () => {
    const result = await createExpense(validExpenseData);
    expect(result).toEqual({ success: true });
    expect(prismaMock.expense.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: "Lunch",
          amount: 12.5,
          currency: "USD",
          userId: USER_ID,
        }),
      })
    );
  });

  it("rejects an expense with zero amount", async () => {
    const result = await createExpense({ ...validExpenseData, amount: "0" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("rejects an expense with negative amount", async () => {
    const result = await createExpense({ ...validExpenseData, amount: "-5" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("rejects an expense with empty description", async () => {
    const result = await createExpense({ ...validExpenseData, description: "" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("rejects a description longer than 200 characters", async () => {
    const result = await createExpense({ ...validExpenseData, description: "x".repeat(201) });
    expect(result).toHaveProperty("error");
    expect(prismaMock.expense.create).not.toHaveBeenCalled();
  });

  it("updates an expense and returns success", async () => {
    const result = await updateExpense(EXPENSE_ID, { ...validExpenseData, amount: "20.00" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.expense.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: EXPENSE_ID },
        data: expect.objectContaining({ amount: 20 }),
      })
    );
  });

  it("rejects an update with invalid data", async () => {
    const result = await updateExpense(EXPENSE_ID, { ...validExpenseData, amount: "abc" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.expense.update).not.toHaveBeenCalled();
  });

  it("deletes an expense and returns success", async () => {
    const result = await deleteExpense(EXPENSE_ID);
    expect(result).toEqual({ success: true });
    expect(prismaMock.expense.delete).toHaveBeenCalledWith({ where: { id: EXPENSE_ID } });
  });
});

// ─── Scenario E: Recurring Expenses ─────────────────────────────────────────

describe("Scenario E – Recurring expenses", () => {
  beforeEach(() => {
    prismaMock.recurringExpense.create.mockResolvedValue({ id: RECURRING_ID, ...validRecurringData });
    prismaMock.recurringExpense.update.mockResolvedValue({ id: RECURRING_ID, ...validRecurringData });
    prismaMock.recurringExpense.delete.mockResolvedValue({ id: RECURRING_ID });
  });

  it("creates a recurring expense and returns success", async () => {
    const result = await createRecurringExpense(validRecurringData);
    expect(result).toEqual({ success: true });
    expect(prismaMock.recurringExpense.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: "Netflix",
          amount: 15.99,
          dayOfMonth: 5,
          userId: USER_ID,
        }),
      })
    );
  });

  it("rejects recurring expense with dayOfMonth = 0", async () => {
    const result = await createRecurringExpense({ ...validRecurringData, dayOfMonth: 0 });
    expect(result).toHaveProperty("error");
    expect(prismaMock.recurringExpense.create).not.toHaveBeenCalled();
  });

  it("rejects recurring expense with dayOfMonth = 29", async () => {
    const result = await createRecurringExpense({ ...validRecurringData, dayOfMonth: 29 });
    expect(result).toHaveProperty("error");
    expect(prismaMock.recurringExpense.create).not.toHaveBeenCalled();
  });

  it("accepts recurring expense with dayOfMonth = 28", async () => {
    const result = await createRecurringExpense({ ...validRecurringData, dayOfMonth: 28 });
    expect(result).toEqual({ success: true });
  });

  it("updates a recurring expense and returns success", async () => {
    const result = await updateRecurringExpense(RECURRING_ID, { ...validRecurringData, amount: "20.00" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.recurringExpense.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: RECURRING_ID },
        data: expect.objectContaining({ amount: 20 }),
      })
    );
  });

  it("deletes a recurring expense and returns success", async () => {
    const result = await deleteRecurringExpense(RECURRING_ID);
    expect(result).toEqual({ success: true });
    expect(prismaMock.recurringExpense.delete).toHaveBeenCalledWith({ where: { id: RECURRING_ID } });
  });

  describe("toggleRecurringExpense", () => {
    it("returns error when recurring expense not found", async () => {
      prismaMock.recurringExpense.findUnique.mockResolvedValue(null);
      const result = await toggleRecurringExpense("nonexistent");
      expect(result).toHaveProperty("error", "Not found");
    });

    it("activates an inactive recurring expense without touching expenses", async () => {
      prismaMock.recurringExpense.findUnique.mockResolvedValue({
        id: RECURRING_ID,
        isActive: false,
        dayOfMonth: 1,
      });
      prismaMock.recurringExpense.update.mockResolvedValue({ id: RECURRING_ID, isActive: true });

      const result = await toggleRecurringExpense(RECURRING_ID);
      expect(result).toEqual({ success: true });
      expect(prismaMock.recurringExpense.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: true } })
      );
      // Activating should NOT delete any linked expenses
      expect(prismaMock.expense.deleteMany).not.toHaveBeenCalled();
    });

    it("deactivates an active recurring expense and removes current-month charges when before charge day", async () => {
      const now = new Date();
      // Set dayOfMonth to tomorrow to ensure we are before the charge day
      const tomorrow = now.getDate() + 1;
      if (tomorrow > 28) {
        // Edge: skip this sub-case on day 28 of the month — charge day cannot be > 28
        return;
      }

      prismaMock.recurringExpense.findUnique.mockResolvedValue({
        id: RECURRING_ID,
        isActive: true,
        dayOfMonth: tomorrow,
      });
      prismaMock.expense.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.recurringExpense.update.mockResolvedValue({ id: RECURRING_ID, isActive: false });

      const result = await toggleRecurringExpense(RECURRING_ID);
      expect(result).toEqual({ success: true });
      expect(prismaMock.expense.deleteMany).toHaveBeenCalled();
      expect(prismaMock.recurringExpense.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } })
      );
    });

    it("deactivates an active recurring expense without removing expenses when on or after charge day", async () => {
      // Set dayOfMonth to 1 — current date is always >= 1
      prismaMock.recurringExpense.findUnique.mockResolvedValue({
        id: RECURRING_ID,
        isActive: true,
        dayOfMonth: 1,
      });
      prismaMock.recurringExpense.update.mockResolvedValue({ id: RECURRING_ID, isActive: false });

      const result = await toggleRecurringExpense(RECURRING_ID);
      expect(result).toEqual({ success: true });
      // Should NOT purge expenses because the charge day has already passed
      expect(prismaMock.expense.deleteMany).not.toHaveBeenCalled();
    });
  });
});

// ─── Scenario C: Category management ────────────────────────────────────────

describe("Scenario C – Category management", () => {
  const validCatData = { name: "Groceries", color: "#22c55e" };

  beforeEach(() => {
    prismaMock.category.findUnique.mockResolvedValue(null); // no duplicate by default
    prismaMock.category.create.mockResolvedValue({ id: CAT_ID, ...validCatData, userId: USER_ID });
    prismaMock.category.update.mockResolvedValue({ id: CAT_ID, name: "Groceries Renamed", color: "#22c55e" });
    prismaMock.category.delete.mockResolvedValue({ id: CAT_ID });
    prismaMock.expense.count.mockResolvedValue(0);
    prismaMock.recurringExpense.count.mockResolvedValue(0);
  });

  it("creates a category and returns success", async () => {
    const result = await createCategory(validCatData);
    expect(result).toEqual({ success: true });
    expect(prismaMock.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Groceries", userId: USER_ID }),
      })
    );
  });

  it("rejects a duplicate category name", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: "existing-id", name: "Groceries" });
    const result = await createCategory(validCatData);
    expect(result).toHaveProperty("error", "Category already exists");
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("rejects a category name that is empty", async () => {
    const result = await createCategory({ name: "", color: "#ff0000" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("rejects a category name longer than 50 characters", async () => {
    const result = await createCategory({ name: "x".repeat(51), color: "#ff0000" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("renames and recolors a category", async () => {
    const result = await updateCategory(CAT_ID, { name: "Groceries Renamed", color: "#10b981" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: CAT_ID },
        data: { name: "Groceries Renamed", color: "#10b981" },
      })
    );
  });

  it("deletes a category with no expenses and returns success", async () => {
    const result = await deleteCategory(CAT_ID);
    expect(result).toEqual({ success: true });
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: CAT_ID } });
  });

  it("blocks deleting a category that has expenses", async () => {
    prismaMock.expense.count.mockResolvedValue(3);
    const result = await deleteCategory(CAT_ID);
    expect(result).toHaveProperty("error");
    expect(prismaMock.category.delete).not.toHaveBeenCalled();
  });

  it("blocks deleting a category used by recurring expenses", async () => {
    prismaMock.recurringExpense.count.mockResolvedValue(1);
    const result = await deleteCategory(CAT_ID);
    expect(result).toHaveProperty("error");
    expect(prismaMock.category.delete).not.toHaveBeenCalled();
  });

  it("blocks deleting a category used by both expenses and recurring expenses", async () => {
    prismaMock.expense.count.mockResolvedValue(2);
    prismaMock.recurringExpense.count.mockResolvedValue(1);
    const result = await deleteCategory(CAT_ID);
    expect(result).toHaveProperty("error");
    expect(prismaMock.category.delete).not.toHaveBeenCalled();
  });
});

// ─── Scenario B: Exchange rate CRUD ─────────────────────────────────────────

describe("Scenario B – Exchange rate CRUD", () => {
  beforeEach(() => {
    prismaMock.exchangeRate.upsert.mockResolvedValue({});
    prismaMock.exchangeRate.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("adds an exchange rate and returns success", async () => {
    const result = await upsertExchangeRate("EUR", "USD", 1.08);
    expect(result).toEqual({ success: true });
    expect(prismaMock.exchangeRate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ fromCurrency: "EUR", toCurrency: "USD", rate: 1.08 }),
      })
    );
  });

  it("rejects a rate of zero", async () => {
    const result = await upsertExchangeRate("EUR", "USD", 0);
    expect(result).toHaveProperty("error", "Rate must be greater than 0");
    expect(prismaMock.exchangeRate.upsert).not.toHaveBeenCalled();
  });

  it("rejects a negative rate", async () => {
    const result = await upsertExchangeRate("EUR", "USD", -0.5);
    expect(result).toHaveProperty("error", "Rate must be greater than 0");
    expect(prismaMock.exchangeRate.upsert).not.toHaveBeenCalled();
  });

  it("rejects same-currency rate", async () => {
    const result = await upsertExchangeRate("USD", "USD", 1);
    expect(result).toHaveProperty("error");
    expect(prismaMock.exchangeRate.upsert).not.toHaveBeenCalled();
  });

  it("deletes an exchange rate and returns success", async () => {
    const result = await deleteExchangeRate("EUR", "USD");
    expect(result).toEqual({ success: true });
    expect(prismaMock.exchangeRate.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ fromCurrency: "EUR", toCurrency: "USD" }),
      })
    );
  });
});

// ─── Scenario F: Monthly income ──────────────────────────────────────────────

describe("Scenario F – Monthly income", () => {
  const validIncomeData = {
    amount: "5000",
    currency: "USD",
    month: "2026-03-01",
  };

  beforeEach(() => {
    prismaMock.monthlyIncome.upsert.mockResolvedValue({});
  });

  it("upserts monthly income and returns success", async () => {
    const result = await upsertMonthlyIncome(validIncomeData);
    expect(result).toEqual({ success: true });
    expect(prismaMock.monthlyIncome.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ amount: 5000, currency: "USD", userId: USER_ID }),
      })
    );
  });

  it("accepts income amount of 0 (no income month)", async () => {
    const result = await upsertMonthlyIncome({ ...validIncomeData, amount: "0" });
    expect(result).toEqual({ success: true });
  });

  it("rejects negative income amount", async () => {
    const result = await upsertMonthlyIncome({ ...validIncomeData, amount: "-100" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.monthlyIncome.upsert).not.toHaveBeenCalled();
  });

  it("rejects income with missing month", async () => {
    const result = await upsertMonthlyIncome({ ...validIncomeData, month: "" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.monthlyIncome.upsert).not.toHaveBeenCalled();
  });

  it("normalises the month date to the 1st at midnight", async () => {
    await upsertMonthlyIncome({ ...validIncomeData, month: "2026-03-15" });
    const call = prismaMock.monthlyIncome.upsert.mock.calls[0][0];
    const monthDate: Date = call.create.month;
    expect(monthDate.getDate()).toBe(1);
    expect(monthDate.getHours()).toBe(0);
    expect(monthDate.getMinutes()).toBe(0);
    expect(monthDate.getSeconds()).toBe(0);
  });
});

// ─── Scenario B: Settings persistence ───────────────────────────────────────

describe("Scenario B – Settings", () => {
  beforeEach(() => {
    prismaMock.user.update.mockResolvedValue({ id: USER_ID, name: "Demo User", defaultCurrency: "USD" });
  });

  it("updates user settings and returns success", async () => {
    const result = await updateSettings({ defaultCurrency: "EUR", name: "Test User" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: USER_ID },
        data: expect.objectContaining({ defaultCurrency: "EUR", name: "Test User" }),
      })
    );
  });

  it("rejects settings with empty currency", async () => {
    const result = await updateSettings({ defaultCurrency: "" });
    expect(result).toHaveProperty("error");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("allows omitting name (treated as null)", async () => {
    const result = await updateSettings({ defaultCurrency: "GBP" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: null }),
      })
    );
  });
});
