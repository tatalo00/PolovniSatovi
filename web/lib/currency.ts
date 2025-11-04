"use client";

// Supported currencies for Balkan region
export type Currency = "EUR" | "RSD" | "BAM" | "HRK";

// Exchange rates (as of 2024, should be updated periodically or fetched from API)
// These are approximate rates - in production, fetch from an API like exchangerate-api.com
const exchangeRates: Record<Currency, number> = {
  EUR: 1.0,
  RSD: 117.0, // Serbian Dinar
  BAM: 1.96, // Bosnian Mark
  HRK: 7.45, // Croatian Kuna
};

// Get exchange rate from EUR to target currency
export function getExchangeRate(to: Currency, from: Currency = "EUR"): number {
  if (from === to) return 1.0;
  if (from === "EUR") return exchangeRates[to];
  if (to === "EUR") return 1 / exchangeRates[from];
  // Convert from EUR to target via EUR
  return exchangeRates[to] / exchangeRates[from];
}

// Convert amount from EUR cents to target currency
export function convertCurrency(
  amountEurCents: number,
  toCurrency: Currency,
  fromCurrency: Currency = "EUR"
): number {
  const rate = getExchangeRate(toCurrency, fromCurrency);
  return Math.round(amountEurCents * rate);
}

// Format currency with locale
export function formatCurrency(
  amountCents: number,
  currency: Currency = "EUR",
  locale: string = "sr-RS"
): string {
  const amount = amountCents / 100;
  
  // Use appropriate locale for currency
  const currencyLocales: Record<Currency, string> = {
    EUR: "de-DE", // European format
    RSD: "sr-RS", // Serbian
    BAM: "bs-BA", // Bosnian
    HRK: "hr-HR", // Croatian
  };

  const formatLocale = currencyLocales[currency] || locale;

  return new Intl.NumberFormat(formatLocale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "RSD" ? 0 : 2,
    maximumFractionDigits: currency === "RSD" ? 0 : 2,
  }).format(amount);
}

// Format price with EUR and converted currency
export function formatPriceWithConversion(
  amountEurCents: number,
  showCurrency: Currency = "EUR",
  locale: string = "sr-RS"
): string {
  return formatCurrency(
    showCurrency === "EUR" ? amountEurCents : convertCurrency(amountEurCents, showCurrency),
    showCurrency,
    locale
  );
}

// Get all supported currencies
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(exchangeRates) as Currency[];
}

