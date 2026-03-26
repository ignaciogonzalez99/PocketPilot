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

// Chart type labels: what they show, not what geometry they use
const chartTypes = ["By Amount", "Share of Spending", "By Category Trend"];

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

  const prevChart = () => setChartIndex((i) => (i + 2) % 3);
  const nextChart = () => setChartIndex((i) => (i + 1) % 3);

  const currencyEntries = Object.entries(data.totalByCurrency);
  const primaryTotal = currencyEntries[0];

  const chartCurrency = data.defaultCurrency;
  const chartData = [...data.totalByCategory].sort((a, b) => b.total - a.total);

  const totalExpenses = data.totalInDefaultCurrency ?? (primaryTotal ? primaryTotal[1] : 0);
  const totalIncome = data.monthlyIncome ? parseFloat(data.monthlyIncome.amount) : 0;
  const balance = totalIncome - totalExpenses;
  const hasIncome = totalIncome > 0;

  // Balance card top border color: gold if positive, destructive if negative
  const balanceBorderColor = !hasIncome
    ? "border-t-primary"
    : balance >= 0
    ? "border-t-accent"
    : "border-t-destructive";

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    fontSize: 13,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Money, This Month"
        description="A clear picture of where your money went — and what is left."
      >
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Spent This Month */}
        <Card className="border-t-[3px] border-t-primary shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Spent This Month</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {primaryTotal ? (
              <div>
                <div className="text-[1.4rem] sm:text-[1.75rem] font-normal leading-tight tracking-[-0.02em] tabular-nums font-serif truncate">
                  {data.totalInDefaultCurrency != null
                    ? formatMoney(data.totalInDefaultCurrency, data.defaultCurrency)
                    : formatMoney(primaryTotal[1], primaryTotal[0])}
                </div>
                {currencyEntries.length > 1 && (
                  <div className="mt-1 space-y-0.5 hidden sm:block">
                    {currencyEntries.map(([cur, amt]) => (
                      <div key={cur} className="text-xs text-muted-foreground tabular-nums">
                        {formatMoney(amt, cur)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[1.4rem] sm:text-[1.75rem] font-normal leading-tight font-serif text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        {/* Income This Month */}
        <Card className="border-t-[3px] border-t-primary shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Income This Month</CardTitle>
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
                <div className="text-[1.4rem] sm:text-[1.75rem] font-normal leading-tight tracking-[-0.02em] tabular-nums font-serif truncate">
                  {hasIncome ? formatMoney(totalIncome, chartCurrency) : (
                    <span className="text-muted-foreground text-base sm:text-lg font-sans font-normal">No income added yet</span>
                  )}
                </div>
                {!hasIncome && (
                  <button
                    onClick={() => setEditingIncome(true)}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    Add your monthly income
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Left to Spend */}
        <Card className={`border-t-[3px] shadow-md ${balanceBorderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Left to Spend</CardTitle>
            {hasIncome ? (
              balance >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
              )
            ) : (
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {hasIncome ? (
              <div>
                <div className={`text-[1.4rem] sm:text-[1.75rem] font-normal leading-tight tracking-[-0.02em] tabular-nums font-serif truncate ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                  {balance >= 0 ? "+" : ""}{formatMoney(Math.abs(balance), chartCurrency)}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {balance >= 0 ? "ahead of spending" : "over your income"}
                </p>
              </div>
            ) : (
              <div className="text-[1.4rem] sm:text-[1.75rem] font-normal leading-tight font-serif text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="border-t-[3px] border-t-primary shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-[1.4rem] sm:text-[1.75rem] font-bold leading-tight tabular-nums">{data.expenseCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">logged this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Exchange Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm sm:text-base">Live Exchange Rate</CardTitle>
          <ArrowRightLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Buy rate</p>
              <p className="text-lg sm:text-xl font-bold tabular-nums">$U{data.exchangeRate.compra.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Sell rate</p>
              <p className="text-lg sm:text-xl font-bold tabular-nums">$U{data.exchangeRate.venta.toFixed(2)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              {data.totalByCurrency["USD"] ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your USD in UYU</p>
                  <p className="text-lg sm:text-xl font-bold tabular-nums">
                    {formatMoney(data.totalByCurrency["USD"] * data.exchangeRate.venta, "UYU")}
                  </p>
                </>
              ) : data.totalByCurrency["UYU"] ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your UYU in USD</p>
                  <p className="text-lg sm:text-xl font-bold tabular-nums">
                    {formatMoney(data.totalByCurrency["UYU"] / data.exchangeRate.compra, "USD")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Quick reference</p>
                  <p className="text-xs sm:text-sm text-muted-foreground tabular-nums">$1 USD = $U{data.exchangeRate.venta.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
            {data.exchangeRate.isDefault
              ? "Showing an estimated rate. Live data is temporarily unavailable."
              : data.exchangeRate.fechaActualizacion
                ? `Updated: ${format(new Date(data.exchangeRate.fechaActualizacion), "MMM d, yyyy HH:mm")}`
                : "Live rate from dolarapi.com"}
          </p>
        </CardContent>
      </Card>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Where Your Money Went — Chart Carousel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base">Where Your Money Went</CardTitle>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={prevChart}
                className="p-1.5 sm:p-1 rounded-md hover:bg-muted active:bg-muted/70 transition-colors"
                aria-label="Previous chart"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] sm:text-xs text-muted-foreground w-24 sm:w-28 text-center select-none">
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

                {/* By Amount — horizontal bar */}
                {chartIndex === 0 && (
                  <div className="h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 2" horizontal={false} stroke="var(--border)" strokeOpacity={0.3} />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={10} />
                        <YAxis type="category" dataKey="name" width={70} fontSize={10} tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={tooltipStyle}
                        />
                        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Share of Spending — pie/donut */}
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
                          outerRadius={75}
                          innerRadius={40}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={tooltipStyle}
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

                {/* By Category Trend — line */}
                {chartIndex === 2 && (
                  <div className="h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 2" stroke="var(--border)" strokeOpacity={0.3} />
                        <XAxis dataKey="name" fontSize={9} tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                        <YAxis tickFormatter={(v) => `$${v}`} fontSize={10} width={45} />
                        <Tooltip
                          formatter={(value) => formatMoney(Number(value), chartCurrency)}
                          contentStyle={tooltipStyle}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          strokeWidth={2.5}
                          stroke="var(--primary)"
                          dot={(props) => {
                            const { cx, cy, index } = props;
                            return (
                              <circle
                                key={index}
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={chartData[index]?.color ?? "var(--primary)"}
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
                title="Nothing to chart yet"
                description="Once you log a few transactions, your spending breakdown will appear here."
                className="py-6 sm:py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Latest Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Latest Transactions</CardTitle>
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
                    <span className="text-xs sm:text-sm font-semibold ml-3 sm:ml-4 shrink-0 tabular-nums">
                      {formatMoney(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions logged"
                description="Add your first transaction and it will show up here instantly."
                className="py-6 sm:py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income vs. Spending Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Income vs. Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {data.balanceHistory.some((m) => m.expenses > 0 || m.income > 0) ? (
            <div className="h-[200px] sm:h-[260px] -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.balanceHistory} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 2" vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis tickFormatter={(v) => `$${v}`} fontSize={10} width={40} />
                  <Tooltip
                    formatter={(value, name) => [
                      formatMoney(Number(value), chartCurrency),
                      name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Balance",
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="income" name="income" fill="#3EC9A7" opacity={0.85} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="expenses" fill="#E05C4B" opacity={0.85} radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="balance"
                    stroke="#D4A853"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#D4A853", stroke: "white", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 2" strokeOpacity={0.5} />
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
              title="Your history starts here"
              description="Add your income for this month and start logging transactions — your trends will build automatically."
              className="py-6 sm:py-8"
            />
          )}
        </CardContent>
      </Card>

      {/* Fixed Monthly Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Fixed Monthly Costs</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recurringExpenses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {data.recurringExpenses
                .filter((r) => r.isActive)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-xl border-t-[3px] border-t-primary border border-border shadow-sm p-2.5 sm:p-3 bg-card"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{expense.description}</p>
                      <CategoryBadge name={expense.category.name} color={expense.category.color} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold ml-2 sm:ml-3 shrink-0 tabular-nums">
                      {formatMoney(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No fixed costs set up"
              description="Add a recurring cost — like rent, subscriptions, or a gym membership — and it will always be visible here."
              className="py-8"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
