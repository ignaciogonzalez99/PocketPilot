import { prisma } from "./db";
import { DEMO_USER_ID } from "./constants";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

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

  const [expenses, activeRecurring, user, rates] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: DEMO_USER_ID, date: { gte: start, lte: end } },
      include: { category: true },
    }),
    prisma.recurringExpense.findMany({
      where: { userId: DEMO_USER_ID, isActive: true, createdAt: { lte: end } },
      include: { category: true },
    }),
    prisma.user.findUnique({ where: { id: DEMO_USER_ID } }),
    prisma.exchangeRate.findMany({ where: { userId: DEMO_USER_ID } }),
  ]);

  const defaultCurrency = user?.defaultCurrency ?? "USD";
  const rateMap: Record<string, number> = { [defaultCurrency]: 1 };
  for (const r of rates) rateMap[r.fromCurrency] = Number(r.rate);

  const toDefault = (amount: number, currency: string): number | null => {
    const rate = rateMap[currency];
    return rate != null ? amount * rate : null;
  };

  const totalByCurrency: Record<string, number> = {};
  // Group by categoryId only, amounts converted to defaultCurrency so all categories show in charts
  const totalByCategory: Record<string, { name: string; color: string; total: number; currency: string }> = {};
  let totalInDefaultCurrency = 0;
  let canConvertAll = true;

  const addEntry = (amt: number, currency: string, categoryId: string, name: string, color: string) => {
    totalByCurrency[currency] = (totalByCurrency[currency] || 0) + amt;

    const converted = toDefault(amt, currency) ?? amt; // fallback to original if no rate
    if (toDefault(amt, currency) == null) canConvertAll = false;
    else totalInDefaultCurrency += converted;

    if (!totalByCategory[categoryId]) {
      totalByCategory[categoryId] = { name, color, total: 0, currency: defaultCurrency };
    }
    totalByCategory[categoryId].total += converted;
  };

  for (const exp of expenses) {
    addEntry(Number(exp.amount), exp.currency, exp.categoryId, exp.category.name, exp.category.color);
  }

  const linkedRecurringIds = new Set(expenses.map((e) => e.recurringExpenseId).filter(Boolean));
  for (const rec of activeRecurring) {
    if (linkedRecurringIds.has(rec.id)) continue;
    addEntry(Number(rec.amount), rec.currency, rec.categoryId, rec.category.name, rec.category.color);
  }

  return {
    expenses,
    totalByCurrency,
    totalByCategory: Object.values(totalByCategory),
    expenseCount: expenses.length,
    defaultCurrency,
    totalInDefaultCurrency: canConvertAll ? totalInDefaultCurrency : null,
  };
}

export async function getRecentExpenses(month: Date, limit = 5) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  return prisma.expense.findMany({
    where: { userId: DEMO_USER_ID, date: { gte: start, lte: end } },
    include: { category: true },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getExchangeRates() {
  return prisma.exchangeRate.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { fromCurrency: "asc" },
  });
}

export async function getMonthlyIncome(month: Date, currency: string) {
  return prisma.monthlyIncome.findUnique({
    where: {
      userId_month_currency: {
        userId: DEMO_USER_ID,
        month: startOfMonth(month),
        currency,
      },
    },
  });
}

export async function getBalanceHistory(months = 6, defaultCurrency: string) {
  const now = new Date();

  const [activeRecurring, allExpensesInRange, rates] = await Promise.all([
    prisma.recurringExpense.findMany({
      where: { userId: DEMO_USER_ID, isActive: true },
    }),
    prisma.expense.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: startOfMonth(subMonths(now, months - 1)), lte: endOfMonth(now) },
      },
      select: { amount: true, currency: true, date: true, recurringExpenseId: true },
    }),
    prisma.exchangeRate.findMany({ where: { userId: DEMO_USER_ID } }),
  ]);

  const rateMap: Record<string, number> = { [defaultCurrency]: 1 };
  for (const r of rates) rateMap[r.fromCurrency] = Number(r.rate);
  const convert = (amount: number, currency: string) => amount * (rateMap[currency] ?? 1);

  const history = await Promise.all(
    Array.from({ length: months }, async (_, i) => {
      const month = subMonths(now, months - 1 - i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);

      const monthExpenses = allExpensesInRange.filter((e) => e.date >= start && e.date <= end);
      const linkedIds = new Set(monthExpenses.map((e) => e.recurringExpenseId).filter(Boolean));

      const expensesTotal = monthExpenses.reduce((sum, e) => sum + convert(Number(e.amount), e.currency), 0);
      const recurringTotal = activeRecurring
        .filter((r) => r.createdAt <= end && !linkedIds.has(r.id))
        .reduce((sum, r) => sum + convert(Number(r.amount), r.currency), 0);

      const income = await prisma.monthlyIncome.findUnique({
        where: { userId_month_currency: { userId: DEMO_USER_ID, month: start, currency: defaultCurrency } },
      });

      const totalExpenses = expensesTotal + recurringTotal;
      const totalIncome = Number(income?.amount ?? 0);

      return {
        month: format(month, "MMM yy"),
        expenses: Math.round(totalExpenses * 100) / 100,
        income: totalIncome,
        balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      };
    })
  );

  return history;
}
