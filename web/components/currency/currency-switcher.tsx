"use client";

import { useState, useEffect, useRef } from "react";
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
  const currencies = getSupportedCurrencies();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    // Initialize from localStorage if available (client-side only)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredCurrency") as Currency;
      if (saved && currencies.includes(saved)) {
        return saved;
      }
    }
    return value;
  });

  useEffect(() => {
    // Notify parent of initial value from localStorage
    if (selectedCurrency !== value) {
      onChangeRef.current?.(selectedCurrency);
    }
  }, [selectedCurrency, value]);

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

