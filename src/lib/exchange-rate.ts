"use server";

const API_URL = "https://uy.dolarapi.com/v1/cotizaciones/usd";

// Fallback rate if the API is unavailable
const DEFAULT_USD_UYU_RATE = { compra: 42.5, venta: 44.5 };

// Cache exchange rate for 10 minutes
let cachedRate: { compra: number; venta: number; fechaActualizacion: string } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface ExchangeRate {
  compra: number;
  venta: number;
  fechaActualizacion: string;
  isDefault: boolean;
}

export async function getUsdToUyuRate(): Promise<ExchangeRate> {
  const now = Date.now();

  // Return cached rate if still fresh
  if (cachedRate && now - cacheTimestamp < CACHE_TTL) {
    return { ...cachedRate, isDefault: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      next: { revalidate: 600 }, // Next.js cache for 10 min
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    cachedRate = {
      compra: data.compra,
      venta: data.venta,
      fechaActualizacion: data.fechaActualizacion ?? new Date().toISOString(),
    };
    cacheTimestamp = now;

    return { ...cachedRate, isDefault: false };
  } catch {
    // API failed — use fallback
    return {
      ...DEFAULT_USD_UYU_RATE,
      fechaActualizacion: "",
      isDefault: true,
    };
  }
}

/** Convert a USD amount to UYU using the sell rate (venta) */
export function convertUsdToUyu(amountUsd: number, rate: ExchangeRate): number {
  return amountUsd * rate.venta;
}

/** Convert a UYU amount to USD using the buy rate (compra) */
export function convertUyuToUsd(amountUyu: number, rate: ExchangeRate): number {
  return amountUyu / rate.compra;
}
