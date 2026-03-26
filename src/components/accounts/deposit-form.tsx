"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { depositToAccount } from "@/lib/actions";
import { formatMoney } from "@/lib/constants";
import { type DepositFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DepositFormProps {
  accountId: string;
  accountName: string;
  currentBalance: string;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DepositForm({ accountId, accountName, currentBalance, currency, onSuccess, onCancel }: DepositFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormData>({
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (data: DepositFormData) => {
    setSubmitting(true);
    try {
      const result = await depositToAccount(accountId, data);

      if (result.success) {
        toast.success("Deposit successful");
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
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-muted-foreground">
          Current balance of <span className="font-medium text-foreground">{accountName}</span>
        </p>
        <p className="text-lg font-serif mt-1">{formatMoney(currentBalance, currency)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit-amount">Amount</Label>
        <Input
          id="deposit-amount"
          type="number"
          inputMode="decimal"
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
        <Label htmlFor="deposit-description">Description (optional)</Label>
        <Input
          id="deposit-description"
          placeholder="e.g., Monthly salary"
          {...register("description")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          Deposit
        </Button>
      </div>
    </form>
  );
}
