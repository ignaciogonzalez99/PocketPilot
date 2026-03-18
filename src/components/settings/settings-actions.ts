"use server";

import { getUser, getExchangeRates } from "@/lib/queries";

export async function getSettingsData() {
  const [user, rates] = await Promise.all([getUser(), getExchangeRates()]);
  return {
    name: user.name || "",
    email: user.email,
    defaultCurrency: user.defaultCurrency,
    exchangeRates: rates.map((r) => ({
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      rate: r.rate.toString(),
    })),
  };
}
