"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency, getSupportedCurrencies } from "@/lib/currency";

interface CurrencySwitcherProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
  className?: string;
}

export function CurrencySwitcher({
  value = "EUR",
  onChange,
  className,
}: CurrencySwitcherProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(value);
  const currencies = getSupportedCurrencies();

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem("preferredCurrency") as Currency;
    if (saved && currencies.includes(saved)) {
      setSelectedCurrency(saved);
      onChange?.(saved);
    }
  }, []);

  const handleChange = (newCurrency: Currency) => {
    setSelectedCurrency(newCurrency);
    localStorage.setItem("preferredCurrency", newCurrency);
    onChange?.(newCurrency);
  };

  return (
    <Select value={selectedCurrency} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

