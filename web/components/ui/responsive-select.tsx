"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/lib/hooks/use-media-query";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResponsiveSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ResponsiveSelectProps {
  title: string;
  value: string[];
  options: ResponsiveSelectOption[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
}

export function ResponsiveSelect({
  title,
  value,
  options,
  onValueChange,
  placeholder = "Odaberi...",
  allLabel = "Sve",
  className,
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const displayValue = React.useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find((o) => o.value === value[0]);
      return option?.label || value[0];
    }
    return `${value.length} odabrano`;
  }, [value, options, placeholder]);

  const activeIcon = React.useMemo(() => {
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.icon;
    }
    return null;
  }, [value, options]);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const handleClearAll = () => {
    onValueChange([]);
    if (isMobile) {
      setOpen(false);
    }
  };

  const triggerButton = (
    <Button
      variant="outline"
      className={cn(
        "h-11 sm:h-12 w-full justify-between rounded-xl border-2 border-muted/70 bg-white/75 px-4 py-3 text-left text-sm sm:text-base font-medium text-foreground hover:border-[#D4AF37] hover:bg-white/90 min-h-[44px]",
        className
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {activeIcon}
        <span className="truncate">{displayValue}</span>
      </span>
      <ChevronDown className="h-4 w-4 opacity-60 flex-shrink-0" aria-hidden />
    </Button>
  );

  const optionsList = (
    <>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm min-h-[44px] transition-colors",
          value.length === 0 ? "bg-[#D4AF37]/10" : "hover:bg-muted"
        )}
        onClick={handleClearAll}
      >
        <span>{allLabel}</span>
        {value.length === 0 && <Check className="h-4 w-4 text-[#D4AF37]" />}
      </button>
      <div className="my-2 h-px bg-border" />
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm min-h-[44px] transition-colors",
              isSelected ? "bg-[#D4AF37]/10" : "hover:bg-muted"
            )}
            onClick={() => handleToggle(option.value)}
          >
            <span className="flex items-center gap-3">
              {option.icon && (
                <span className="text-muted-foreground">{option.icon}</span>
              )}
              {option.label}
            </span>
            {isSelected && <Check className="h-4 w-4 text-[#D4AF37]" />}
          </button>
        );
      })}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[70vh] rounded-t-2xl px-0"
        >
          <SheetHeader className="px-4 pb-2">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-8">{optionsList}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: use DropdownMenu
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 rounded-2xl border border-border/70 bg-background/95 p-1 shadow-xl">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleClearAll();
          }}
          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm"
        >
          <span>{allLabel}</span>
          {value.length === 0 && <Check className="h-4 w-4 text-[#D4AF37]" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            onSelect={(e) => e.preventDefault()}
            checked={value.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm [&>span:first-child]:hidden"
          >
            <span className="flex items-center gap-3">
              {option.icon && (
                <span className="text-muted-foreground">{option.icon}</span>
              )}
              {option.label}
            </span>
            {value.includes(option.value) && (
              <span className="text-[#D4AF37]">
                <Check className="h-4 w-4" />
              </span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
