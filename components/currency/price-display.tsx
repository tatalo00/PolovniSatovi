"use client";

import { useState, useEffect } from "react";
import { formatPriceWithConversion, Currency } from "@/lib/currency";
import { CurrencySwitcher } from "./currency-switcher";

interface PriceDisplayProps {
  amountEurCents: number;
  showSwitcher?: boolean;
  className?: string;
  locale?: string;
}

export function PriceDisplay({
  amountEurCents,
  showSwitcher = false,
  className = "",
  locale = "sr-RS",
}: PriceDisplayProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("EUR");

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("preferredCurrency") as Currency;
    if (saved && ["EUR", "RSD", "BAM", "HRK"].includes(saved)) {
      setSelectedCurrency(saved);
    }
  }, []);

  const formattedPrice = formatPriceWithConversion(
    amountEurCents,
    selectedCurrency,
    locale
  );

  if (showSwitcher) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-semibold">{formattedPrice}</span>
        <CurrencySwitcher
          value={selectedCurrency}
          onChange={setSelectedCurrency}
          className="w-24"
        />
      </div>
    );
  }

  return <span className={className}>{formattedPrice}</span>;
}

