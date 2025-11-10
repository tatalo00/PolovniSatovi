"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const LOADING_PREFIX = "⌛ Učitavanje – ";
const START_DELAY_MS = 150;
const MIN_VISIBLE_MS = 1400;

type StartOptions = {
  immediate?: boolean;
};

type NavigationFeedbackContextValue = {
  start: (options?: StartOptions) => void;
  stop: () => void;
  isLoading: boolean;
};

const NavigationFeedbackContext = createContext<NavigationFeedbackContextValue | null>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  const [isLoading, setIsLoading] = useState(false);
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restoreTitleRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startRef = useRef<NavigationFeedbackContextValue["start"] | undefined>(undefined);
  const stopRef = useRef<NavigationFeedbackContextValue["stop"] | undefined>(undefined);

  const clearStartTimer = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  };

  const clearStopTimer = () => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const applyLoadingTitle = () => {
    if (typeof document === "undefined") return;
    const currentTitle = document.title;
    if (!currentTitle.startsWith(LOADING_PREFIX)) {
      restoreTitleRef.current = currentTitle;
      document.title = `${LOADING_PREFIX}${currentTitle}`;
    }
  };

  const restoreTitle = () => {
    if (typeof document === "undefined") return;
    if (restoreTitleRef.current && document.title.startsWith(LOADING_PREFIX)) {
      document.title = restoreTitleRef.current;
    }
    restoreTitleRef.current = null;
  };

  const start = useCallback(
    (options?: StartOptions) => {
      const { immediate = false } = options ?? {};
      clearStartTimer();
      clearStopTimer();

      const trigger = () => {
        if (isLoading) return;
        applyLoadingTitle();
        startTimeRef.current = Date.now();
        setIsLoading(true);
      };

      if (immediate) {
        trigger();
      } else {
        startTimerRef.current = setTimeout(trigger, START_DELAY_MS);
      }
    },
    [isLoading]
  );

  const stop = useCallback(() => {
    clearStartTimer();

    const finalize = () => {
      startTimeRef.current = null;
      setIsLoading(false);
      restoreTitle();
    };

    if (!isLoading) {
      finalize();
      return;
    }

    const startedAt = startTimeRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearStopTimer();
    stopTimerRef.current = setTimeout(finalize, remaining);
  }, [isLoading]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) {
        return;
      }

      const isSameLocation =
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        (url.hash === window.location.hash || url.hash === "");

      if (isSameLocation) {
        return;
      }

      startRef.current?.();
    };

    const handlePopState = () => {
      startRef.current?.({ immediate: true });
    };

    window.addEventListener("click", handleInternalNavigation);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("click", handleInternalNavigation);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    stopRef.current?.();
  }, [locationKey, isLoading]);

  useEffect(() => {
    return () => {
      clearStartTimer();
      clearStopTimer();
      restoreTitle();
    };
  }, []);

  const contextValue = useMemo<NavigationFeedbackContextValue>(
    () => ({
      start,
      stop,
      isLoading,
    }),
    [isLoading, start, stop]
  );

  return (
    <NavigationFeedbackContext.Provider value={contextValue}>
      <div
        className={cn(
          "pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-0.5 bg-transparent transition-opacity duration-150",
          isLoading ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-full overflow-hidden bg-transparent">
          <span className="block h-full w-full bg-primary animate-route-progress" />
        </div>
      </div>
      {children}
    </NavigationFeedbackContext.Provider>
  );
}

export function useNavigationFeedback() {
  const context = useContext(NavigationFeedbackContext);
  if (!context) {
    throw new Error("useNavigationFeedback must be used within a NavigationFeedbackProvider");
  }
  return context;
}

