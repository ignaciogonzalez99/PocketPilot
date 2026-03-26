/**
 * Shared Prisma mock factory.
 *
 * Returns a jest mock object that mirrors every model used in the app.
 * Individual tests override only the methods they care about via
 * `mockResolvedValue` / `mockRejectedValue`.
 */

export function makePrismaMock() {
  const modelMethods = () => ({
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  });

  return {
    user: modelMethods(),
    expense: modelMethods(),
    recurringExpense: modelMethods(),
    category: modelMethods(),
    exchangeRate: modelMethods(),
    monthlyIncome: modelMethods(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };
}

export type PrismaMock = ReturnType<typeof makePrismaMock>;
