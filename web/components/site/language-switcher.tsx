"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "sr", label: "Srpski" },
  { value: "hr", label: "Hrvatski" },
  { value: "bs", label: "Bosanski" },
  { value: "mk", label: "Македонски" },
] as const;

function getInitialLanguage(): string {
  if (typeof window === "undefined") {
    return "en";
  }
  const saved = localStorage.getItem("preferredLanguage");
  if (saved && LANG_OPTIONS.some((lang) => lang.value === saved)) {
    return saved;
  }
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    const fallback = LANG_OPTIONS.find((lang) => lang.value === browserLang);
    if (fallback) {
      return fallback.value;
    }
  }
  return "en";
}

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<string>(getInitialLanguage);

  const handleChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("preferredLanguage", value);
    // Placeholder for future i18n integration
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANG_OPTIONS.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


