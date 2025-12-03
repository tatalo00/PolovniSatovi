"use client";

import { formatPriceWithConversion, Currency } from "@/lib/currency";

interface PriceDisplayProps {
  amountEurCents: number;
  currency?: Currency;
  className?: string;
  locale?: string;
}

export function PriceDisplay({
  amountEurCents,
  currency = "EUR",
  className = "",
  locale = "sr-RS",
}: PriceDisplayProps) {
  const formattedPrice = formatPriceWithConversion(
    amountEurCents,
    currency,
    locale
  );

  return <span className={className}>{formattedPrice}</span>;
}

