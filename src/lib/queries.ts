import { prisma } from "./db";
import { DEMO_USER_ID } from "./constants";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getUser() {
  let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@pocketpilot.app",
        name: "Demo User",
        defaultCurrency: "USD",
      },
    });
  }
  return user;
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { name: "asc" },
  });
}

export async function getExpenses(month: Date, categoryId?: string, currency?: string) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  return prisma.expense.findMany({
    where: {
      userId: DEMO_USER_ID,
      date: { gte: start, lte: end },
      ...(categoryId && categoryId !== "all" ? { categoryId } : {}),
      ...(currency && currency !== "all" ? { currency } : {}),
    },
    include: { category: true, recurringExpense: true },
    orderBy: { date: "desc" },
  });
}

export async function getRecurringExpenses() {
  return prisma.recurringExpense.findMany({
    where: { userId: DEMO_USER_ID },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonthlyStats(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: DEMO_USER_ID,
      date: { gte: start, lte: end },
    },
    include: { category: true },
  });

  const totalByCurrency: Record<string, number> = {};
  const totalByCategory: Record<string, { name: string; color: string; total: number; currency: string }> = {};

  for (const exp of expenses) {
    const amt = Number(exp.amount);
    totalByCurrency[exp.currency] = (totalByCurrency[exp.currency] || 0) + amt;

    const key = `${exp.categoryId}-${exp.currency}`;
    if (!totalByCategory[key]) {
      totalByCategory[key] = {
        name: exp.category.name,
        color: exp.category.color,
        total: 0,
        currency: exp.currency,
      };
    }
    totalByCategory[key].total += amt;
  }

  return {
    expenses,
    totalByCurrency,
    totalByCategory: Object.values(totalByCategory),
    expenseCount: expenses.length,
  };
}

export async function getRecentExpenses(limit = 5) {
  return prisma.expense.findMany({
    where: { userId: DEMO_USER_ID },
    include: { category: true },
    orderBy: { date: "desc" },
    take: limit,
  });
}
