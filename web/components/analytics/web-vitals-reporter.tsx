"use client";

import { useEffect } from "react";
import { reportWebVitals, sendToAnalytics } from "@/lib/web-vitals";

/**
 * Reports Core Web Vitals metrics
 * Add this component to your root layout
 */
export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals(sendToAnalytics);
  }, []);

  return null;
}
