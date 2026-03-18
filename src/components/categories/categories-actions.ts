"use server";

import { getCategories } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function getCategoriesPageData() {
  const categories = await getCategories();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (c) => {
      const expenseCount = await prisma.expense.count({ where: { categoryId: c.id, userId: DEMO_USER_ID } });
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        expenseCount,
      };
    })
  );

  return { categories: categoriesWithCounts };
}
