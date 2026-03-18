"use server";

import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "./db";
import { DEMO_USER_ID } from "./constants";
import {
  expenseSchema,
  recurringExpenseSchema,
  categorySchema,
  settingsSchema,
  monthlyIncomeSchema,
} from "./validations";

// ─── Expenses ──────────────────────────────────────────────────────────────

export async function createExpense(formData: unknown) {
  const parsed = expenseSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { description, amount, currency, date, categoryId, notes } = parsed.data;

  await prisma.expense.create({
    data: {
      description,
      amount: parseFloat(amount),
      currency,
      date: new Date(date),
      categoryId,
      userId: DEMO_USER_ID,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  return { success: true };
}

export async function updateExpense(id: string, formData: unknown) {
  const parsed = expenseSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { description, amount, currency, date, categoryId, notes } = parsed.data;

  await prisma.expense.update({
    where: { id },
    data: {
      description,
      amount: parseFloat(amount),
      currency,
      date: new Date(date),
      categoryId,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/expenses");
  return { success: true };
}

// ─── Recurring Expenses ────────────────────────────────────────────────────

export async function createRecurringExpense(formData: unknown) {
  const parsed = recurringExpenseSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { description, amount, currency, categoryId, dayOfMonth, notes } = parsed.data;

  await prisma.recurringExpense.create({
    data: {
      description,
      amount: parseFloat(amount),
      currency,
      categoryId,
      userId: DEMO_USER_ID,
      dayOfMonth,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/recurring");
  return { success: true };
}

export async function updateRecurringExpense(id: string, formData: unknown) {
  const parsed = recurringExpenseSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { description, amount, currency, categoryId, dayOfMonth, notes } = parsed.data;

  await prisma.recurringExpense.update({
    where: { id },
    data: {
      description,
      amount: parseFloat(amount),
      currency,
      categoryId,
      dayOfMonth,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/recurring");
  return { success: true };
}

export async function toggleRecurringExpense(id: string) {
  const expense = await prisma.recurringExpense.findUnique({ where: { id } });
  if (!expense) return { error: "Not found" };

  const newIsActive = !expense.isActive;

  // When deactivating: if today is before the charge day, the expense hasn't
  // been charged yet this month — delete any linked expense for the current month.
  if (!newIsActive) {
    const now = new Date();
    if (now.getDate() < expense.dayOfMonth) {
      await prisma.expense.deleteMany({
        where: {
          recurringExpenseId: id,
          userId: DEMO_USER_ID,
          date: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
      });
    }
  }

  await prisma.recurringExpense.update({
    where: { id },
    data: { isActive: newIsActive },
  });

  revalidatePath("/");
  revalidatePath("/recurring");
  return { success: true };
}

export async function deleteRecurringExpense(id: string) {
  await prisma.recurringExpense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/recurring");
  return { success: true };
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function createCategory(formData: unknown) {
  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, color } = parsed.data;

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: DEMO_USER_ID, name } },
  });
  if (existing) return { error: "Category already exists" };

  await prisma.category.create({
    data: { name, color, userId: DEMO_USER_ID },
  });

  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/recurring");
  return { success: true };
}

export async function updateCategory(id: string, formData: unknown) {
  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, color } = parsed.data;

  await prisma.category.update({
    where: { id },
    data: { name, color },
  });

  revalidatePath("/");
  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const expenseCount = await prisma.expense.count({ where: { categoryId: id } });
  const recurringCount = await prisma.recurringExpense.count({ where: { categoryId: id } });

  if (expenseCount > 0 || recurringCount > 0) {
    return { error: "Cannot delete category with associated expenses. Reassign them first." };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}

// ─── Exchange Rates ─────────────────────────────────────────────────────────

export async function upsertExchangeRate(fromCurrency: string, toCurrency: string, rate: number) {
  if (fromCurrency === toCurrency) return { error: "Cannot set rate between the same currency" };
  if (rate <= 0) return { error: "Rate must be greater than 0" };

  await prisma.exchangeRate.upsert({
    where: { userId_fromCurrency_toCurrency: { userId: DEMO_USER_ID, fromCurrency, toCurrency } },
    update: { rate },
    create: { userId: DEMO_USER_ID, fromCurrency, toCurrency, rate },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteExchangeRate(fromCurrency: string, toCurrency: string) {
  await prisma.exchangeRate.deleteMany({
    where: { userId: DEMO_USER_ID, fromCurrency, toCurrency },
  });
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

// ─── Monthly Income ─────────────────────────────────────────────────────────

export async function upsertMonthlyIncome(formData: unknown) {
  const parsed = monthlyIncomeSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { amount, currency, month, notes } = parsed.data;
  const monthDate = new Date(month);
  monthDate.setDate(1);
  monthDate.setHours(0, 0, 0, 0);

  await prisma.monthlyIncome.upsert({
    where: {
      userId_month_currency: {
        userId: DEMO_USER_ID,
        month: monthDate,
        currency,
      },
    },
    update: { amount: parseFloat(amount), notes: notes || null },
    create: {
      userId: DEMO_USER_ID,
      month: monthDate,
      amount: parseFloat(amount),
      currency,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function updateSettings(formData: unknown) {
  const parsed = settingsSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { defaultCurrency, name } = parsed.data;

  await prisma.user.update({
    where: { id: DEMO_USER_ID },
    data: { defaultCurrency, name: name || null },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}
