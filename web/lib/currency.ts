"use client";

// Supported currencies
export type Currency = "EUR" | "RSD";

// Fixed exchange rate: 1 EUR = 117 RSD
const EXCHANGE_RATE_EUR_TO_RSD = 117.0;

const exchangeRates: Record<Currency, number> = {
  EUR: 1.0,
  RSD: EXCHANGE_RATE_EUR_TO_RSD,
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
  };

  const formatLocale = currencyLocales[currency] || locale;

  return new Intl.NumberFormat(formatLocale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "RSD" ? 0 : 2,
    maximumFractionDigits: currency === "RSD" ? 0 : 2,
  }).format(amount);
}

// Format price with currency
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

// Convert RSD cents to EUR cents
export function convertRsdToEur(rsdCents: number): number {
  return Math.round(rsdCents / EXCHANGE_RATE_EUR_TO_RSD);
}

// Convert EUR cents to RSD cents
export function convertEurToRsd(eurCents: number): number {
  return Math.round(eurCents * EXCHANGE_RATE_EUR_TO_RSD);
}

// Get all supported currencies
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(exchangeRates) as Currency[];
}

