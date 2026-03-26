"use client";

import { useEffect, useState, useCallback } from "react";
import { formatMoney } from "@/lib/constants";
import { MonthPicker } from "@/components/shared/month-picker";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getAccountReportData } from "./accounts-actions";
import { format } from "date-fns";
import Link from "next/link";

interface ReportData {
  account: {
    id: string;
    name: string;
    currency: string;
    currentBalance: string;
    initialBalance: string;
  };
  expenses: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    date: string;
    category: { name: string; color: string };
  }[];
  totalSpent: string;
}

interface AccountReportContentProps {
  accountId: string;
}

export function AccountReportContent({ accountId }: AccountReportContentProps) {
  const [month, setMonth] = useState(() => new Date());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAccountReportData(accountId, month.toISOString());
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [accountId, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Accounts
        </Link>
      </div>

      <div className="flex justify-center">
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {loading ? (
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="py-12 flex items-center justify-center">
              <div className="rounded-md bg-muted h-6 w-40" style={{ animation: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </CardContent>
          </Card>
        </div>
      ) : !data ? (
        <div className="max-w-md mx-auto text-center py-12">
          <p className="text-sm text-muted-foreground">Account not found.</p>
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="space-y-0">
            {/* Receipt header */}
            <div className="text-center pb-4">
              <p className="text-2xl mb-1">🏦</p>
              <h2 className="text-lg font-serif font-medium">{data.account.name}</h2>
              <p className="text-sm text-muted-foreground">Monthly Report</p>
              <p className="text-sm text-muted-foreground">{format(month, "MMMM yyyy")}</p>
            </div>

            {/* Expenses list */}
            <div className="border-t border-dashed border-border pt-4 pb-4 space-y-3">
              {data.expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No expenses this month.
                </p>
              ) : (
                data.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category.name} &middot; {format(new Date(expense.date), "MMM d")}
                      </p>
                    </div>
                    <span className="text-sm font-serif tabular-nums shrink-0">
                      -{formatMoney(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-border pt-4 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Spent:</span>
                <span className="text-sm font-serif font-medium tabular-nums">
                  {formatMoney(data.totalSpent, data.account.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Balance:</span>
                <span className="text-base font-serif font-medium tabular-nums">
                  {formatMoney(data.account.currentBalance, data.account.currency)}
                </span>
              </div>
            </div>

            {/* Receipt footer */}
            <div className="border-t border-dashed border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">PocketPilot Receipt</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
