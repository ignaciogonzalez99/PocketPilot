import { z } from "zod/v4";

export const expenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  notes: z.string().max(500).optional(),
});

export const recurringExpenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  categoryId: z.string().min(1, "Category is required"),
  dayOfMonth: z.coerce.number().min(1).max(28),
  notes: z.string().max(500).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().min(1, "Color is required"),
});

export const settingsSchema = z.object({
  defaultCurrency: z.string().min(1, "Currency is required"),
  name: z.string().max(100).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
