"use client";

import { useEffect, useState, useCallback } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, Tag } from "lucide-react";
import { getCategoriesPageData } from "./categories-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CategoryRow {
  id: string;
  name: string;
  color: string;
  expenseCount: number;
}

const PRESET_COLORS = [
  "#6366f1", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6",
  "#ef4444", "#8b5cf6", "#f97316", "#06b6d4", "#64748b",
  "#84cc16", "#a855f7",
];

export function CategoriesContent() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCategoriesPageData();
      setCategories(result.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditing(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setDialogOpen(true);
  };

  const handleEdit = (cat: CategoryRow) => {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Category deleted");
      fetchData();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      const data = { name: name.trim(), color };
      const result = editing
        ? await updateCategory(editing.id, data)
        : await createCategory(data);

      if (result.success) {
        toast.success(editing ? "Category updated" : "Category created");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organize your expenses by category.">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </Button>
      </PageHeader>

      {loading ? (
        <TableSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create categories to organize your expenses."
        >
          <Button onClick={handleAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.expenseCount} expense{cat.expenseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(cat)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                placeholder="e.g., Food & Dining"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                {editing ? "Update" : "Create"} Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
