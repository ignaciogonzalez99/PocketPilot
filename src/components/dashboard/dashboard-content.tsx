"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { MonthPicker } from "@/components/shared/month-picker";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DollarSign, Receipt, Tag, Coins, LayoutDashboard } from "lucide-react";
import { getDashboardData } from "./dashboard-actions";
import { format } from "date-fns";

interface DashboardData {
  totalByCurrency: Record<string, number>;
  totalByCategory: { name: string; color: string; total: number; currency: string }[];
  expenseCount: number;
  recentExpenses: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    date: string;
    category: { name: string; color: string };
  }[];
  recurringExpenses: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    isActive: boolean;
    category: { name: string; color: string };
  }[];
}

export function DashboardContent() {
  const { selectedMonth, setSelectedMonth } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDashboardData(selectedMonth.toISOString());
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const currencyEntries = Object.entries(data.totalByCurrency);
  const primaryTotal = currencyEntries[0];
  const categoriesUsed = new Set(data.totalByCategory.map((c) => c.name)).size;
  const currenciesUsed = currencyEntries.length;

  // Group category totals by currency for chart (show USD by default)
  const chartCurrency = primaryTotal?.[0] || "USD";
  const chartData = data.totalByCategory
    .filter((c) => c.currency === chartCurrency)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your financial overview at a glance.">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {primaryTotal ? (
              <div>
                <div className="text-2xl font-bold">
                  {formatMoney(primaryTotal[1], primaryTotal[0])}
                </div>
                {currencyEntries.slice(1).map(([cur, amt]) => (
                  <div key={cur} className="text-sm text-muted-foreground mt-0.5">
                    {formatMoney(amt, cur)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.expenseCount}</div>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">used this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Currencies
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currenciesUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value), chartCurrency)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={LayoutDashboard}
                title="No data yet"
                description="Add expenses to see your spending breakdown."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {data.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge
                          name={expense.category.name}
                          color={expense.category.color}
                        />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), "MMM d")}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold ml-4">
                      {formatMoney(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No expenses yet"
                description="Start tracking your spending."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recurring Expenses Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recurringExpenses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.recurringExpenses
                .filter((r) => r.isActive)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense.description}
                      </p>
                      <CategoryBadge
                        name={expense.category.name}
                        color={expense.category.color}
                      />
                    </div>
                    <span className="text-sm font-semibold ml-3">
                      {formatMoney(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No recurring expenses"
              description="Set up recurring expenses to track fixed monthly costs."
              className="py-8"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
