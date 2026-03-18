"use server";

import { getMonthlyStats, getRecentExpenses, getRecurringExpenses } from "@/lib/queries";

export async function getDashboardData(monthIso: string) {
  const month = new Date(monthIso);

  const stats = await getMonthlyStats(month);
  const recentExpenses = await getRecentExpenses(5);
  const recurringExpenses = await getRecurringExpenses();

  return {
    totalByCurrency: stats.totalByCurrency,
    totalByCategory: stats.totalByCategory,
    expenseCount: stats.expenseCount,
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount.toString(),
      currency: e.currency,
      date: e.date.toISOString(),
      category: { name: e.category.name, color: e.category.color },
    })),
    recurringExpenses: recurringExpenses.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount.toString(),
      currency: r.currency,
      isActive: r.isActive,
      category: { name: r.category.name, color: r.category.color },
    })),
  };
}
