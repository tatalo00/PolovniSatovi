"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// Popular watch brands for quick selection
const POPULAR_BRANDS = [
  "Rolex",
  "Omega",
  "Seiko",
  "Casio",
  "Tissot",
  "Tag Heuer",
  "Longines",
  "Citizen",
  "Orient",
  "Patek Philippe",
  "Audemars Piguet",
  "Breitling",
  "IWC",
  "Cartier",
  "Tudor",
];

export function BrandCombobox({
  value,
  onChange,
  placeholder = "Unesite ili izaberite marku...",
  error,
  disabled = false,
}: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/listings/suggest?type=brand&q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch brand suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== value) {
        fetchSuggestions(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);
  };

  const handleSelect = (brand: string) => {
    setInputValue(brand);
    onChange(brand);
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  // Combine popular brands and suggestions, filtering by input
  const displayOptions = inputValue.length >= 2
    ? suggestions
    : POPULAR_BRANDS.filter((brand) =>
        brand.toLowerCase().includes(inputValue.toLowerCase())
      );

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && "border-destructive")}
          aria-invalid={!!error}
          aria-describedby={error ? "brand-error" : undefined}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && displayOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
        >
          <div className="max-h-60 overflow-auto">
            {inputValue.length < 2 && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                Popularne marke
              </p>
            )}
            {displayOptions.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => handleSelect(brand)}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  value === brand && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === brand ? "opacity-100" : "opacity-0"
                  )}
                />
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p id="brand-error" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
