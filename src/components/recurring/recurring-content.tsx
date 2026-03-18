"use client";

import { useEffect, useState, useCallback } from "react";
import { formatMoney } from "@/lib/constants";
import {
  deleteRecurringExpense,
  toggleRecurringExpense,
} from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryBadge } from "@/components/shared/category-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, Repeat } from "lucide-react";
import { RecurringForm } from "./recurring-form";
import { getRecurringPageData } from "./recurring-actions";
import { toast } from "sonner";

interface RecurringRow {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string;
  isActive: boolean;
  dayOfMonth: number;
  notes: string | null;
  category: { name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export function RecurringContent() {
  const [recurring, setRecurring] = useState<RecurringRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRecurringPageData();
      setRecurring(result.recurring);
      setCategories(result.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (id: string) => {
    // Optimistic update so the switch responds instantly
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    const result = await toggleRecurringExpense(id);
    if ("error" in result) {
      // Revert on failure
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
      toast.error(result.error || "Failed to toggle");
    } else {
      toast.success("Status updated");
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteRecurringExpense(id);
    if ('error' in result) {
      toast.error(String(result.error) || "Failed to delete");
    } else {
      toast.success("Recurring expense deleted");
      fetchData();
    }
  };

  const handleEdit = (item: RecurringRow) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  };

  const activeExpenses = recurring.filter((r) => r.isActive);
  const inactiveExpenses = recurring.filter((r) => !r.isActive);

  const totalMonthly: Record<string, number> = {};
  for (const r of activeExpenses) {
    totalMonthly[r.currency] = (totalMonthly[r.currency] || 0) + parseFloat(r.amount);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Expenses"
        description="Manage your fixed monthly costs."
      >
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Recurring
        </Button>
      </PageHeader>

      {/* Monthly total summary */}
      {Object.keys(totalMonthly).length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Monthly total:</span>
              {Object.entries(totalMonthly).map(([cur, total]) => (
                <span key={cur} className="text-sm font-semibold">
                  {formatMoney(total, cur)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <TableSkeleton />
      ) : recurring.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring expenses"
          description="Set up recurring expenses for your fixed monthly costs like rent, subscriptions, etc."
        >
          <Button onClick={handleAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Recurring Expense
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {activeExpenses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Active ({activeExpenses.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeExpenses.map((item) => (
                  <RecurringCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {inactiveExpenses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Inactive ({inactiveExpenses.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inactiveExpenses.map((item) => (
                  <RecurringCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Recurring Expense" : "Add Recurring Expense"}
            </DialogTitle>
          </DialogHeader>
          <RecurringForm
            categories={categories}
            expense={editing}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecurringCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: RecurringRow;
  onToggle: (id: string) => void;
  onEdit: (item: RecurringRow) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className={!item.isActive ? "opacity-60" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge name={item.category.name} color={item.category.color} />
              <span className="text-xs text-muted-foreground">Day {item.dayOfMonth}</span>
            </div>
            <p className="text-lg font-semibold mt-2">
              {formatMoney(item.amount, item.currency)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              checked={item.isActive}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.id);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
