import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Ensure demo user exists
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: {
      id: "demo-user",
      email: "demo@pocketpilot.app",
      name: "Demo User",
      defaultCurrency: "USD",
    },
  });

  // Seed default categories (upsert to avoid duplicates)
  const defaultCategories = [
    { name: "Housing", color: "#6366f1" },
    { name: "Food & Dining", color: "#f59e0b" },
    { name: "Transportation", color: "#3b82f6" },
    { name: "Entertainment", color: "#ec4899" },
    { name: "Utilities", color: "#14b8a6" },
    { name: "Healthcare", color: "#ef4444" },
    { name: "Shopping", color: "#8b5cf6" },
    { name: "Subscriptions", color: "#f97316" },
    { name: "Education", color: "#06b6d4" },
    { name: "Other", color: "#64748b" },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: cat.name } },
      update: {},
      create: { name: cat.name, color: cat.color, userId: user.id },
    });
  }

  console.log("Seed complete: demo user and default categories created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
