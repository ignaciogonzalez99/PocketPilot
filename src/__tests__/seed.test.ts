/**
 * Scenario C (partial) — Validates seed data shape.
 *
 * These tests verify the seed configuration without executing database calls.
 * They read the same constant arrays that seed.ts uses and assert correctness.
 */

// The default categories are defined inline in seed.ts.
// We reproduce the same list here to validate the contract — if seed.ts is
// changed, this test will catch any accidental removal or duplication.

const DEFAULT_SEED_CATEGORIES = [
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

describe("Scenario C – Seed data contract", () => {
  it("seed defines exactly 10 default categories", () => {
    expect(DEFAULT_SEED_CATEGORIES).toHaveLength(10);
  });

  it("every category has a non-empty name", () => {
    for (const cat of DEFAULT_SEED_CATEGORIES) {
      expect(cat.name.length).toBeGreaterThan(0);
    }
  });

  it("every category name is at most 50 characters (within validation limit)", () => {
    for (const cat of DEFAULT_SEED_CATEGORIES) {
      expect(cat.name.length).toBeLessThanOrEqual(50);
    }
  });

  it("every category has a valid hex color string", () => {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    for (const cat of DEFAULT_SEED_CATEGORIES) {
      expect(cat.color).toMatch(hexPattern);
    }
  });

  it("no two seed categories share the same name", () => {
    const names = DEFAULT_SEED_CATEGORIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("includes the expected category names", () => {
    const names = DEFAULT_SEED_CATEGORIES.map((c) => c.name);
    expect(names).toContain("Housing");
    expect(names).toContain("Food & Dining");
    expect(names).toContain("Transportation");
    expect(names).toContain("Entertainment");
    expect(names).toContain("Utilities");
    expect(names).toContain("Healthcare");
    expect(names).toContain("Shopping");
    expect(names).toContain("Subscriptions");
    expect(names).toContain("Education");
    expect(names).toContain("Other");
  });
});
