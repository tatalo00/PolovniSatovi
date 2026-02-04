"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ModelComboboxProps {
  value: string;
  onChange: (value: string) => void;
  brand: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// Popular models for common brands (shown when brand is selected but no search query)
const POPULAR_MODELS: Record<string, string[]> = {
  Rolex: ["Submariner", "Datejust", "Daytona", "GMT-Master II", "Explorer", "Sea-Dweller", "Air-King", "Oyster Perpetual"],
  Omega: ["Speedmaster", "Seamaster", "Constellation", "De Ville", "Aqua Terra", "Planet Ocean"],
  Seiko: ["Presage", "Prospex", "Astron", "5 Sports", "Alpinist", "Turtle", "Samurai", "King Seiko"],
  Casio: ["G-Shock", "Edifice", "Pro Trek", "Oceanus", "Wave Ceptor"],
  Tissot: ["PRX", "Seastar", "Le Locle", "Gentleman", "T-Touch", "Chemin des Tourelles"],
  "Tag Heuer": ["Carrera", "Monaco", "Aquaracer", "Formula 1", "Autavia", "Link"],
  Tudor: ["Black Bay", "Pelagos", "Ranger", "1926", "Royal"],
  "Patek Philippe": ["Nautilus", "Aquanaut", "Calatrava", "Grand Complications", "Twenty~4"],
  "Audemars Piguet": ["Royal Oak", "Royal Oak Offshore", "Code 11.59", "Millenary"],
  Breitling: ["Navitimer", "Superocean", "Avenger", "Chronomat", "Premier"],
  IWC: ["Portugieser", "Pilot", "Aquatimer", "Portofino", "Ingenieur"],
  Cartier: ["Tank", "Santos", "Ballon Bleu", "Panthère", "Drive"],
  Longines: ["Master Collection", "HydroConquest", "Conquest", "Spirit", "DolceVita"],
  Citizen: ["Eco-Drive", "Promaster", "Attesa", "Corso", "Chandler"],
  Orient: ["Bambino", "Kamasu", "Mako", "Ray", "Star", "Defender"],
};

export function ModelCombobox({
  value,
  onChange,
  brand,
  placeholder = "Unesite ili izaberite model...",
  error,
  disabled = false,
}: ModelComboboxProps) {
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
  const fetchSuggestions = useCallback(async (query: string, brandFilter: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "model",
        q: query,
      });
      if (brandFilter) {
        params.append("brand", brandFilter);
      }

      const response = await fetch(`/api/listings/suggest?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch model suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== value) {
        fetchSuggestions(inputValue, brand);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions, value, brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);
  };

  const handleSelect = (model: string) => {
    setInputValue(model);
    onChange(model);
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  // Get popular models for selected brand, or use suggestions from search
  const popularModelsForBrand = brand ? (POPULAR_MODELS[brand] || []) : [];

  // Combine popular models and suggestions, filtering by input
  const displayOptions = inputValue.length >= 2
    ? suggestions
    : popularModelsForBrand.filter((model) =>
        model.toLowerCase().includes(inputValue.toLowerCase())
      );

  const showPopularModelsLabel = inputValue.length < 2 && popularModelsForBrand.length > 0;

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
          aria-describedby={error ? "model-error" : undefined}
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
            {showPopularModelsLabel && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                Popularni modeli za {brand}
              </p>
            )}
            {displayOptions.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => handleSelect(model)}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  value === model && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === model ? "opacity-100" : "opacity-0"
                  )}
                />
                {model}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p id="model-error" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
