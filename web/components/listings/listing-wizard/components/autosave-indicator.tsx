"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";

interface AutosaveIndicatorProps {
  lastSavedAt: Date | null;
  isSaving: boolean;
  isEditMode: boolean;
}

export function AutosaveIndicator({ lastSavedAt, isSaving, isEditMode }: AutosaveIndicatorProps) {
  // Don't show in edit mode - edits are saved immediately on submit
  if (isEditMode) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Čuvanje...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <Cloud className="h-3 w-3 text-green-500" />
          <span>
            Sačuvano {formatDistanceToNow(lastSavedAt, { addSuffix: true, locale: sr })}
          </span>
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          <span>Nije sačuvano</span>
        </>
      )}
    </div>
  );
}
