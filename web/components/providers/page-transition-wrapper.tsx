"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useNavigationFeedback } from "./navigation-feedback-provider";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const { isLoading } = useNavigationFeedback();

  return (
    <main className={cn("page-transition-wrapper flex-1", isLoading && "is-loading")}>
      <div key={pathname} className="page-transition-content">
        {children}
      </div>
    </main>
  );
}


