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
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  DollarSign,
  Receipt,
  Tag,
  Coins,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Pencil,
  Check,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { getDashboardData } from "./dashboard-actions";
import { upsertMonthlyIncome } from "@/lib/actions";
import { format, startOfMonth } from "date-fns";
import type { ExchangeRate } from "@/lib/exchange-rate";

interface DashboardData {
  totalByCurrency: Record<string, number>;
  totalByCategory: { name: string; color: string; total: number; currency: string }[];
  expenseCount: number;
  defaultCurrency: string;
  totalInDefaultCurrency: number | null;
  monthlyIncome: { amount: string; currency: string } | null;
  balanceHistory: { month: string; expenses: number; income: number; balance: number }[];
  exchangeRate: ExchangeRate;
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
  const [chartIndex, setChartIndex] = useState(0);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [savingIncome, setSavingIncome] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDashboardData(selectedMonth.toISOString());
      setData(result);
      setIncomeInput(result.monthlyIncome?.amount ?? "");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveIncome = async () => {
    if (!data) return;
    setSavingIncome(true);
    const month = startOfMonth(selectedMonth);
    month.setHours(0, 0, 0, 0);
    await upsertMonthlyIncome({
      amount: incomeInput || "0",
      currency: data.defaultCurrency,
      month: month.toISOString(),
    });
    await fetchData();
    setSavingIncome(false);
    setEditingIncome(false);
  };

  const handleCancelIncome = () => {
    setIncomeInput(data?.monthlyIncome?.amount ?? "");
    setEditingIncome(false);
  };

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const chartTypes = ["Horizontal Bar", "Pie", "Line"];
  const prevChart = () => setChartIndex((i) => (i + 2) % 3);
  const nextChart = () => setChartIndex((i) => (i + 1) % 3);

  const currencyEntries = Object.entries(data.totalByCurrency);
  const primaryTotal = currencyEntries[0];
  const categoriesUsed = new Set(data.totalByCategory.map((c) => c.name)).size;
  const currenciesUsed = currencyEntries.length;

  const chartCurrency = data.defaultCurrency;
  const chartData = [...data.totalByCategory]
    .sort((a, b) => b.total - a.total);

  const totalExpenses = data.totalInDefaultCurrency ?? (primaryTotal ? primaryTotal[1] : 0);
  const totalIncome = data.monthlyIncome ? parseFloat(data.monthlyIncome.amount) : 0;
  const balance = totalIncome - totalExpenses;
  const hasIncome = totalIncome > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your financial overview at a glance.">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {primaryTotal ? (
              <div>
                <div className="text-lg sm:text-2xl font-bold truncate">
                  {data.totalInDefaultCurrency != null
                    ? formatMoney(data.totalInDefaultCurrency, data.defaultCurrency)
                    : formatMoney(primaryTotal[1], primaryTotal[0])}
                </div>
                {currencyEntries.length > 1 && (
                  <div className="mt-1 space-y-0.5 hidden sm:block">
                    {currencyEntries.map(([cur, amt]) => (
                      <div key={cur} className="text-xs text-muted-foreground">
                        {formatMoney(amt, cur)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-lg sm:text-2xl font-bold text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
            {!editingIncome && (
              <button
                onClick={() => setEditingIncome(true)}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Edit income"
              >
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
              </button>
            )}
          </CardHeader>
          <CardContent>
            {editingIncome ? (
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full text-lg sm:text-xl font-bold bg-transparent border-b border-primary outline-none pb-0.5"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveIncome();
                    if (e.key === "Escape") handleCancelIncome();
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveIncome}
                    disabled={savingIncome}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" /> Save
                  </button>
                  <button
                    onClick={handleCancelIncome}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg sm:text-2xl font-bold truncate">
                  {hasIncome ? formatMoney(totalIncome, chartCurrency) : (
                    <span className="text-muted-foreground text-base sm:text-lg">Not set</span>
                  )}
                </div>
                {!hasIncome && (
                  <button
                    onClick={() => setEditingIncome(true)}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    + Add income
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Balance</CardTitle>
            {hasIncome ? (
              balance >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
              )
            ) : (
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {hasIncome ? (
              <div>
                <div className={`text-lg sm:text-2xl font-bold truncate ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {balance >= 0 ? "+" : ""}{formatMoney(Math.abs(balance), chartCurrency)}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {balance >= 0 ? "saved this month" : "over budget"}
                </p>
              </div>
            ) : (
              <div className="text-lg sm:text-2xl font-bold text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{data.expenseCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rate USD ↔ UYU */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm sm:text-base">USD → UYU Exchange Rate</CardTitle>
          <ArrowRightLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Buy (Compra)</p>
              <p className="text-lg sm:text-xl font-bold">$U{data.exchangeRate.compra.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Sell (Venta)</p>
              <p className="text-lg sm:text-xl font-bold">$U{data.exchangeRate.venta.toFixed(2)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              {data.totalByCurrency["USD"] ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your USD in UYU</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {formatMoney(data.totalByCurrency["USD"] * data.exchangeRate.venta, "UYU")}
                  </p>
                </>
              ) : data.totalByCurrency["UYU"] ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your UYU in USD</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {formatMoney(data.totalByCurrency["UYU"] / data.exchangeRate.compra, "USD")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Conversion</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">$1 USD = $U{data.exchangeRate.venta.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
            {data.exchangeRate.isDefault
              ? "Using default rate — live API unavailable."
              : data.exchangeRate.fechaActualizacion
                ? `Updated: ${format(new Date(data.exchangeRate.fechaActualizacion), "MMM d, yyyy HH:mm")}`
                : "Live rate from dolarapi.com"}
          </p>
        </CardContent>
      </Card>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Spending by Category Chart Carousel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base">Spending by Category</CardTitle>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={prevChart}
                className="p-1.5 sm:p-1 rounded-md hover:bg-muted active:bg-muted/70 transition-colors"
                aria-label="Previous chart"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] sm:text-xs text-muted-foreground w-20 sm:w-24 text-center select-none">
                {chartTypes[chartIndex]}
              </span>
              <button
                onClick={nextChart}
                className="p-1.5 sm:p-1 rounded-md hover:bg-muted active:bg-muted/70 transition-colors"
                aria-label="Next chart"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <>
                <div className="flex justify-center gap-2 sm:gap-1.5 mb-3">
                  {chartTypes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setChartIndex(i)}
                      className={`h-2 sm:h-1.5 rounded-full transition-all ${i === chartIndex ? "w-5 sm:w-4 bg-primary" : "w-2 sm:w-1.5 bg-muted-foreground/30"}`}
                      aria-label={chartTypes[i]}
                    />
                  ))}
                </div>

                {chartIndex === 0 && (
                  <div className="h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={10} />
                        <YAxis type="category" dataKey="name" width={70} fontSize={10} tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
                        />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {chartIndex === 1 && (
                  <div className="h-[240px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={70}
                          innerRadius={30}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={6}
                          formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                          wrapperStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {chartIndex === 2 && (
                  <div className="h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={9} tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                        <YAxis tickFormatter={(v) => `$${v}`} fontSize={10} width={45} />
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          strokeWidth={2}
                          stroke="#6366f1"
                          dot={(props) => {
                            const { cx, cy, index } = props;
                            return (
                              <circle
                                key={index}
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={chartData[index]?.color ?? "#6366f1"}
                                stroke="white"
                                strokeWidth={2}
                              />
                            );
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={LayoutDashboard}
                title="No data yet"
                description="Add expenses to see your spending breakdown."
                className="py-6 sm:py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentExpenses.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {data.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-1.5 sm:py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{expense.description}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                        <CategoryBadge name={expense.category.name} color={expense.category.color} />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {format(new Date(expense.date), "MMM d")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold ml-3 sm:ml-4 shrink-0">
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
                className="py-6 sm:py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          {data.balanceHistory.some((m) => m.expenses > 0 || m.income > 0) ? (
            <div className="h-[200px] sm:h-[260px] -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.balanceHistory} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis tickFormatter={(v) => `$${v}`} fontSize={10} width={40} />
                  <Tooltip
                    formatter={(value, name) => [
                      formatMoney(Number(value), chartCurrency),
                      name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Balance",
                    ]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 }}
                  />
                  <Bar dataKey="income" name="income" fill="#10b981" opacity={0.85} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="expenses" fill="#f43f5e" opacity={0.85} radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="balance"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 2" />
                  <Legend
                    iconSize={6}
                    formatter={(value) => (
                      <span style={{ fontSize: 11 }}>
                        {value === "income" ? "Income" : value === "expenses" ? "Expenses" : "Balance"}
                      </span>
                    )}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No history yet"
              description="Set your monthly income and add expenses to see the balance history."
              className="py-6 sm:py-8"
            />
          )}
        </CardContent>
      </Card>

      {/* Recurring Expenses Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recurringExpenses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {data.recurringExpenses
                .filter((r) => r.isActive)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border border-border p-2.5 sm:p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{expense.description}</p>
                      <CategoryBadge name={expense.category.name} color={expense.category.color} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold ml-2 sm:ml-3 shrink-0">
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
