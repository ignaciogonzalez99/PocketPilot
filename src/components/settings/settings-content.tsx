"use client";

import { useEffect, useState, useCallback } from "react";
import { updateSettings, upsertExchangeRate, deleteExchangeRate } from "@/lib/actions";
import { CURRENCIES, getCurrencySymbol } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { getSettingsData } from "./settings-actions";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { ThemeSelector } from "@/components/theme/theme-toggle";

interface RateRow {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
}

export function SettingsContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRate, setSavingRate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSettingsData();
      setName(data.name);
      setEmail(data.email);
      setDefaultCurrency(data.defaultCurrency);
      setRates(data.exchangeRates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateSettings({ defaultCurrency, name: name || undefined });
      if (result.success) {
        toast.success("Settings saved");
      } else {
        toast.error(result.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRate = async (from: string, to: string, rate: string) => {
    const num = parseFloat(rate);
    if (isNaN(num) || num <= 0) {
      toast.error("Rate must be a positive number");
      return;
    }
    setSavingRate(from);
    const result = await upsertExchangeRate(from, to, num);
    if (result.success) {
      toast.success(`Rate saved: 1 ${from} = ${num} ${to}`);
      fetchData();
    } else {
      toast.error(result.error || "Failed to save rate");
    }
    setSavingRate(null);
  };

  const handleDeleteRate = async (from: string, to: string) => {
    await deleteExchangeRate(from, to);
    toast.success("Rate removed");
    fetchData();
  };

  const updateRateValue = (from: string, value: string) => {
    setRates((prev) =>
      prev.map((r) => (r.fromCurrency === from ? { ...r, rate: value } : r))
    );
  };

  const addNewRate = () => {
    const used = new Set(rates.map((r) => r.fromCurrency));
    const next = CURRENCIES.find((c) => c.code !== defaultCurrency && !used.has(c.code));
    if (!next) return;
    setRates((prev) => [...prev, { fromCurrency: next.code, toCurrency: defaultCurrency, rate: "" }]);
  };

  const otherCurrencies = CURRENCIES.filter((c) => c.code !== defaultCurrency);
  const usedCurrencies = new Set(rates.map((r) => r.fromCurrency));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your preferences." />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences." />

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed in demo mode.</p>
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Currency</CardTitle>
            <CardDescription>The default currency used when adding new expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={defaultCurrency} onValueChange={(v) => v && setDefaultCurrency(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exchange Rates</CardTitle>
            <CardDescription>
              Set conversion rates to {getCurrencySymbol(defaultCurrency)} {defaultCurrency}. Used to calculate totals when you add expenses in other currencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rates.length === 0 && (
              <p className="text-sm text-muted-foreground">No rates configured yet.</p>
            )}
            {rates.map((row) => (
              <div key={row.fromCurrency} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5 sm:border-0 sm:p-0">
                <span className="text-sm w-5 sm:w-8 text-right font-medium">1</span>
                <Select
                  value={row.fromCurrency}
                  onValueChange={(val) => {
                    if (!val) return;
                    setRates((prev) =>
                      prev.map((r) =>
                        r.fromCurrency === row.fromCurrency
                          ? { ...r, fromCurrency: val, rate: "" }
                          : r
                      )
                    );
                  }}
                >
                  <SelectTrigger className="w-[90px] sm:w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {otherCurrencies.map((c) => (
                      <SelectItem
                        key={c.code}
                        value={c.code}
                        disabled={usedCurrencies.has(c.code) && c.code !== row.fromCurrency}
                      >
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">=</span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={row.rate}
                  onChange={(e) => updateRateValue(row.fromCurrency, e.target.value)}
                  className="w-20 sm:w-28"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRate(row.fromCurrency, defaultCurrency, row.rate);
                  }}
                />
                <span className="text-sm font-medium">{getCurrencySymbol(defaultCurrency)} {defaultCurrency}</span>
                <div className="flex gap-1 ml-auto sm:ml-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingRate === row.fromCurrency}
                    onClick={() => handleSaveRate(row.fromCurrency, defaultCurrency, row.rate)}
                  >
                    {savingRate === row.fromCurrency ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteRate(row.fromCurrency, defaultCurrency)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {otherCurrencies.some((c) => !usedCurrencies.has(c.code)) && (
              <Button size="sm" variant="outline" onClick={addNewRate} className="mt-1">
                + Add currency rate
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose your preferred theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
