"use server";

import { getAccounts, getAccountById, getAccountExpenses } from "@/lib/queries";

export async function getAccountsData() {
  const accounts = await getAccounts();
  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    currency: a.currency,
    initialBalance: a.initialBalance.toString(),
    currentBalance: a.currentBalance.toString(),
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getAccountReportData(accountId: string, monthIso: string) {
  const month = new Date(monthIso);
  const [account, expenses] = await Promise.all([
    getAccountById(accountId),
    getAccountExpenses(accountId, month),
  ]);

  if (!account) return null;

  const monthExpenses = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount.toString(),
    currency: e.currency,
    date: e.date.toISOString(),
    category: { name: e.category.name, color: e.category.color },
  }));

  return {
    account: {
      id: account.id,
      name: account.name,
      currency: account.currency,
      currentBalance: account.currentBalance.toString(),
      initialBalance: account.initialBalance.toString(),
    },
    expenses: monthExpenses,
    totalSpent: expenses.reduce((sum, e) => sum + Number(e.amount), 0).toString(),
  };
}
