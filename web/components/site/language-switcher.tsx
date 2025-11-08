"use client";

import { useState, useEffect } from "react";
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

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && LANG_OPTIONS.some((lang) => lang.value === saved)) {
      setLanguage(saved);
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.slice(0, 2).toLowerCase();
      const fallback = LANG_OPTIONS.find((lang) => lang.value === browserLang);
      if (fallback) {
        setLanguage(fallback.value);
      }
    }
  }, []);

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


