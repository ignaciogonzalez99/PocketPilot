"use server";

import { getMonthlyStats, getRecentExpenses, getRecurringExpenses, getMonthlyIncome, getBalanceHistory } from "@/lib/queries";
import { getUsdToUyuRate, type ExchangeRate } from "@/lib/exchange-rate";

export async function getDashboardData(monthIso: string) {
  const month = new Date(monthIso);

  const stats = await getMonthlyStats(month).catch((e) => {
    console.error("[getDashboardData] DB error:", e?.message ?? String(e), "\nCode:", e?.code, "\nStack:", e?.stack?.split("\n").slice(0,3).join(" | "));
    throw e;
  });
  const defaultCurrency = stats.defaultCurrency;

  const [recentExpenses, recurringExpenses, monthlyIncome, balanceHistory, exchangeRate] = await Promise.all([
    getRecentExpenses(month, 5),
    getRecurringExpenses(),
    getMonthlyIncome(month, defaultCurrency),
    getBalanceHistory(6, defaultCurrency),
    getUsdToUyuRate(),
  ]);

  return {
    totalByCurrency: stats.totalByCurrency,
    totalByCategory: stats.totalByCategory,
    expenseCount: stats.expenseCount,
    defaultCurrency,
    totalInDefaultCurrency: stats.totalInDefaultCurrency,
    monthlyIncome: monthlyIncome ? { amount: monthlyIncome.amount.toString(), currency: monthlyIncome.currency } : null,
    balanceHistory,
    exchangeRate: {
      compra: exchangeRate.compra,
      venta: exchangeRate.venta,
      fechaActualizacion: exchangeRate.fechaActualizacion,
      isDefault: exchangeRate.isDefault,
    } as ExchangeRate,
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
