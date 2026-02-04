import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

export type WebVitalMetric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
};

type MetricHandler = (metric: WebVitalMetric) => void;

/**
 * Initialize web vitals reporting
 * Tracks: LCP, INP, CLS, FCP, TTFB
 */
export function reportWebVitals(handler: MetricHandler) {
  const handleMetric = (metric: Metric) => {
    handler({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  };

  onCLS(handleMetric);
  onINP(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Send metrics to analytics endpoint
 * In production, this sends to Vercel Analytics automatically
 * For custom analytics, implement your own endpoint
 */
export function sendToAnalytics(metric: WebVitalMetric) {
  // Vercel Analytics handles this automatically when @vercel/analytics is installed
  // For custom analytics or debugging, you can log or send to your own endpoint
  if (process.env.NODE_ENV === "development") {
    const rating = metric.rating;
    const color = rating === "good" ? "\x1b[32m" : rating === "needs-improvement" ? "\x1b[33m" : "\x1b[31m";
    console.log(
      `${color}[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})\x1b[0m`
    );
  }
}

/**
 * Get performance rating thresholds
 * Based on Google's Core Web Vitals thresholds
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const;
