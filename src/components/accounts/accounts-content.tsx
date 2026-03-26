"use client";

import { useEffect, useState, useCallback } from "react";
import { formatMoney } from "@/lib/constants";
import { deleteAccount } from "@/lib/actions";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Pencil, Trash2, Wallet, ArrowDownToLine, FileText } from "lucide-react";
import { AccountForm } from "./account-form";
import { DepositForm } from "./deposit-form";
import { getAccountsData } from "./accounts-actions";
import { toast } from "sonner";
import Link from "next/link";

interface Account {
  id: string;
  name: string;
  currency: string;
  initialBalance: string;
  currentBalance: string;
  createdAt: string;
}

export function AccountsContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [depositAccount, setDepositAccount] = useState<Account | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAccountsData();
      setAccounts(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const result = await deleteAccount(id);
    if ("error" in result) {
      toast.error(String(result.error) || "Failed to delete");
    } else {
      toast.success("Account deleted");
      fetchData();
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const handleDeposit = (account: Account) => {
    setDepositAccount(account);
    setDepositDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    fetchData();
  };

  const handleDepositSuccess = () => {
    setDepositDialogOpen(false);
    setDepositAccount(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Manage your financial accounts.">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Account
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="rounded-md bg-muted h-4 w-24 mb-3" style={{ animation: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              <div className="rounded-md bg-muted h-8 w-32" style={{ animation: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Create your first account to start tracking balances."
        >
          <Button onClick={handleAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Account
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium truncate">{account.name}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                    {account.currency}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(account)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeposit(account)}>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Deposit
                    </DropdownMenuItem>
                    <Link href={`/accounts/${account.id}/report`}>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <p className="text-2xl font-serif tabular-nums">
                  {formatMoney(account.currentBalance, account.currency)}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Initial: {formatMoney(account.initialBalance, account.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
          </DialogHeader>
          <AccountForm
            account={editingAccount}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Deposit to Account</DialogTitle>
          </DialogHeader>
          {depositAccount && (
            <DepositForm
              accountId={depositAccount.id}
              accountName={depositAccount.name}
              currentBalance={depositAccount.currentBalance}
              currency={depositAccount.currency}
              onSuccess={handleDepositSuccess}
              onCancel={() => setDepositDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
