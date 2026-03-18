import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean up
  await prisma.expense.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: "demo-user",
      email: "demo@pocketpilot.app",
      name: "Demo User",
      defaultCurrency: "USD",
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Housing", color: "#6366f1", userId: user.id } }),
    prisma.category.create({ data: { name: "Food & Dining", color: "#f59e0b", userId: user.id } }),
    prisma.category.create({ data: { name: "Transportation", color: "#3b82f6", userId: user.id } }),
    prisma.category.create({ data: { name: "Entertainment", color: "#ec4899", userId: user.id } }),
    prisma.category.create({ data: { name: "Utilities", color: "#14b8a6", userId: user.id } }),
    prisma.category.create({ data: { name: "Healthcare", color: "#ef4444", userId: user.id } }),
    prisma.category.create({ data: { name: "Shopping", color: "#8b5cf6", userId: user.id } }),
    prisma.category.create({ data: { name: "Subscriptions", color: "#f97316", userId: user.id } }),
    prisma.category.create({ data: { name: "Education", color: "#06b6d4", userId: user.id } }),
    prisma.category.create({ data: { name: "Other", color: "#64748b", userId: user.id } }),
  ]);

  const [housing, food, transport, entertainment, utilities, healthcare, shopping, subscriptions, education] = categories;

  // Create recurring expenses
  await Promise.all([
    prisma.recurringExpense.create({
      data: { description: "Rent", amount: 1200, currency: "USD", categoryId: housing.id, userId: user.id, dayOfMonth: 1 },
    }),
    prisma.recurringExpense.create({
      data: { description: "Internet", amount: 59.99, currency: "USD", categoryId: utilities.id, userId: user.id, dayOfMonth: 15 },
    }),
    prisma.recurringExpense.create({
      data: { description: "Netflix", amount: 15.99, currency: "USD", categoryId: subscriptions.id, userId: user.id, dayOfMonth: 10 },
    }),
    prisma.recurringExpense.create({
      data: { description: "Spotify", amount: 9.99, currency: "USD", categoryId: subscriptions.id, userId: user.id, dayOfMonth: 10 },
    }),
    prisma.recurringExpense.create({
      data: { description: "Gym", amount: 45, currency: "USD", categoryId: healthcare.id, userId: user.id, dayOfMonth: 5 },
    }),
    prisma.recurringExpense.create({
      data: { description: "Phone Plan", amount: 35, currency: "USD", categoryId: utilities.id, userId: user.id, dayOfMonth: 20 },
    }),
  ]);

  // Create expenses for current month and last 2 months
  const now = new Date();
  const months = [0, -1, -2];

  for (const offset of months) {
    const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);

    const expenses = [
      { description: "Rent", amount: 1200, currency: "USD", categoryId: housing.id, day: 1 },
      { description: "Groceries", amount: 145.50, currency: "USD", categoryId: food.id, day: 3 },
      { description: "Gas", amount: 52.30, currency: "USD", categoryId: transport.id, day: 5 },
      { description: "Restaurant dinner", amount: 68.90, currency: "USD", categoryId: food.id, day: 7 },
      { description: "Electricity bill", amount: 95.20, currency: "USD", categoryId: utilities.id, day: 10 },
      { description: "Netflix", amount: 15.99, currency: "USD", categoryId: subscriptions.id, day: 10 },
      { description: "Spotify", amount: 9.99, currency: "USD", categoryId: subscriptions.id, day: 10 },
      { description: "Internet", amount: 59.99, currency: "USD", categoryId: utilities.id, day: 15 },
      { description: "Gym membership", amount: 45, currency: "USD", categoryId: healthcare.id, day: 5 },
      { description: "Online course", amount: 29.99, currency: "USD", categoryId: education.id, day: 12 },
      { description: "Coffee shop", amount: 18.50, currency: "USD", categoryId: food.id, day: 14 },
      { description: "Movie tickets", amount: 32, currency: "USD", categoryId: entertainment.id, day: 16 },
      { description: "Phone Plan", amount: 35, currency: "USD", categoryId: utilities.id, day: 20 },
      { description: "New shoes", amount: 89.99, currency: "USD", categoryId: shopping.id, day: 18 },
      { description: "Groceries", amount: 112.40, currency: "USD", categoryId: food.id, day: 20 },
      { description: "Uber rides", amount: 24.50, currency: "USD", categoryId: transport.id, day: 22 },
      { description: "Books", amount: 42.50, currency: "EUR", categoryId: education.id, day: 8 },
      { description: "Souvenir", amount: 850, currency: "UYU", categoryId: shopping.id, day: 25 },
    ];

    await Promise.all(
      expenses.map((exp) =>
        prisma.expense.create({
          data: {
            description: exp.description,
            amount: exp.amount,
            currency: exp.currency,
            date: new Date(month.getFullYear(), month.getMonth(), Math.min(exp.day, 28)),
            categoryId: exp.categoryId,
            userId: user.id,
          },
        })
      )
    );
  }

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
