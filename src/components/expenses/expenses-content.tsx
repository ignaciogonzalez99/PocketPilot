"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/constants";
import { deleteExpense } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { MonthPicker } from "@/components/shared/month-picker";
import { CurrencySelect } from "@/components/shared/currency-select";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, Receipt, Repeat } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import { getExpensesPageData } from "./expenses-actions";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExpenseRow {
  id: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
  notes: string | null;
  categoryId: string;
  category: { name: string; color: string };
  isRecurring: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface AccountOption {
  id: string;
  name: string;
  currency: string;
  currentBalance: string;
}

export function ExpensesContent() {
  const { selectedMonth, setSelectedMonth, filterCategory, setFilterCategory, filterCurrency, setFilterCurrency } = useAppStore();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getExpensesPageData(
        selectedMonth.toISOString(),
        filterCategory,
        filterCurrency
      );
      setExpenses(result.expenses);
      setCategories(result.categories);
      setAccounts(result.accounts);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, filterCategory, filterCurrency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const result = await deleteExpense(id);
    if ('error' in result) {
      toast.error(String(result.error) || "Failed to delete");
    } else {
      toast.success("Expense deleted");
      fetchData();
    }
  };

  const handleEdit = (expense: ExpenseRow) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingExpense(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Track and manage your spending.">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Expense
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CurrencySelect value={filterCurrency} onValueChange={setFilterCurrency} includeAll />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description="Add your first expense or adjust your filters."
        >
          <Button onClick={handleAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
        </EmptyState>
      ) : (
        <>
        {/* Mobile card layout */}
        <div className="space-y-2 sm:hidden">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-lg border border-border p-3 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium truncate">{expense.description}</span>
                    {expense.isRecurring && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">
                        <Repeat className="h-2.5 w-2.5 mr-0.5" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(expense)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CategoryBadge name={expense.category.name} color={expense.category.color} />
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(expense.date), "MMM d")}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {formatMoney(expense.amount, expense.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table layout */}
        <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{expense.description}</span>
                      {expense.isRecurring && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          <Repeat className="h-3 w-3 mr-0.5" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge name={expense.category.name} color={expense.category.color} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatMoney(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(expense)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            categories={categories}
            accounts={accounts}
            expense={editingExpense}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
