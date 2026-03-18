"use server";

import { getRecurringExpenses, getCategories } from "@/lib/queries";

export async function getRecurringPageData() {
  const recurring = await getRecurringExpenses();
  const categories = await getCategories();

  return {
    recurring: recurring.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount.toString(),
      currency: r.currency,
      categoryId: r.categoryId,
      isActive: r.isActive,
      dayOfMonth: r.dayOfMonth,
      notes: r.notes,
      category: { name: r.category.name, color: r.category.color },
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
    })),
  };
}
