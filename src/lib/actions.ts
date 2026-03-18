"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { DEMO_USER_ID } from "./constants";
import {
  expenseSchema,
  recurringExpenseSchema,
  categorySchema,
  settingsSchema,
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

  await prisma.recurringExpense.update({
    where: { id },
    data: { isActive: !expense.isActive },
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
