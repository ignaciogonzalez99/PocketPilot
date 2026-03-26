"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createAccount, updateAccount } from "@/lib/actions";
import { CURRENCIES } from "@/lib/constants";
import { type AccountFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AccountFormProps {
  account?: {
    id: string;
    name: string;
    currency: string;
    initialBalance: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!account;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    defaultValues: {
      name: account?.name || "",
      currency: account?.currency || "USD",
      initialBalance: account?.initialBalance || "",
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    setSubmitting(true);
    try {
      const result = isEditing
        ? await updateAccount(account!.id, data)
        : await createAccount(data);

      if (result.success) {
        toast.success(isEditing ? "Account updated" : "Account created");
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
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          placeholder="e.g., Main Checking"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Initial Balance</Label>
          <Input
            id="initialBalance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("initialBalance", { required: "Balance is required" })}
          />
          {errors.initialBalance && (
            <p className="text-xs text-destructive">{errors.initialBalance.message}</p>
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          {isEditing ? "Update" : "Create"} Account
        </Button>
      </div>
    </form>
  );
}
