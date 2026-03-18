"use server";

import { getExpenses, getCategories } from "@/lib/queries";

export async function getExpensesPageData(monthIso: string, categoryId?: string, currency?: string) {
  const month = new Date(monthIso);

  const expenses = await getExpenses(month, categoryId, currency);
  const categories = await getCategories();

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
  };
}
