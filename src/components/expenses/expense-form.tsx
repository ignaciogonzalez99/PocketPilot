"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createExpense, updateExpense } from "@/lib/actions";
import { CURRENCIES, formatMoney } from "@/lib/constants";
import { type ExpenseFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExpenseFormProps {
  categories: { id: string; name: string; color: string }[];
  accounts?: { id: string; name: string; currency: string; currentBalance: string }[];
  expense?: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    date: string;
    categoryId: string;
    accountId?: string | null;
    notes: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ categories, accounts, expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      description: expense?.description || "",
      amount: expense?.amount || "",
      currency: expense?.currency || "USD",
      date: expense?.date ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      categoryId: expense?.categoryId || "",
      accountId: expense?.accountId ?? undefined,
      notes: expense?.notes || "",
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setSubmitting(true);
    try {
      const result = isEditing
        ? await updateExpense(expense!.id, data)
        : await createExpense(data);

      if ("success" in result) {
        toast.success(isEditing ? "Expense updated" : "Expense added");
        onSuccess();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g., Grocery shopping"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register("amount", { required: "Amount is required" })}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={watch("currency")} onValueChange={(v) => v && setValue("currency", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register("date", { required: "Date is required" })}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={watch("categoryId")} onValueChange={(v) => v && setValue("categoryId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-xs text-destructive">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      {accounts && accounts.length > 0 && (() => {
        const selectedCurrency = watch("currency");
        const filteredAccounts = accounts.filter((a) => a.currency === selectedCurrency);
        if (filteredAccounts.length === 0) return null;
        return (
          <div className="space-y-2">
            <Label>Account (optional)</Label>
            <Select
              value={watch("accountId") || "none"}
              onValueChange={(v) => setValue("accountId", v === "none" ? undefined : v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No account</SelectItem>
                {filteredAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({formatMoney(a.currentBalance, a.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })()}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          rows={2}
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          {isEditing ? "Update" : "Add"} Expense
        </Button>
      </div>
    </form>
  );
}
