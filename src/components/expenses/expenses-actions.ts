"use server";

import { getExpenses, getCategories, getAccounts } from "@/lib/queries";

export async function getExpensesPageData(monthIso: string, categoryId?: string, currency?: string) {
  const month = new Date(monthIso);

  const [expenses, categories, accounts] = await Promise.all([
    getExpenses(month, categoryId, currency),
    getCategories(),
    getAccounts(),
  ]);

  return {
    expenses: expenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount.toString(),
      currency: e.currency,
      date: e.date.toISOString(),
      notes: e.notes,
      categoryId: e.categoryId,
      category: { name: e.category.name, color: e.category.color },
      isRecurring: !!e.recurringExpenseId,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
    })),
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      currency: a.currency,
      currentBalance: a.currentBalance.toString(),
    })),
  };
}
