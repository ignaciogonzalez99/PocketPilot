import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete transactional data in dependency order
  await prisma.expense.deleteMany({});
  await prisma.recurringExpense.deleteMany({});
  await prisma.monthlyIncome.deleteMany({});
  await prisma.exchangeRate.deleteMany({});
  await prisma.category.deleteMany({});

  // Reset demo user to defaults
  await prisma.user.update({
    where: { id: "demo-user" },
    data: {
      name: "Demo User",
      defaultCurrency: "USD",
    },
  });

  console.log("Reset complete: all transactional data cleared, demo user restored to defaults.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
