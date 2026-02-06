// Production mobile configuration
// Tests real-world mobile experience with realistic throttling

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 5, // More runs for production accuracy
      settings: {
        // Mobile-first testing
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
        },
        throttling: {
          // Simulate realistic 4G mobile connection
          rttMs: 150,
          throughputKbps: 1638.4, // ~1.6 Mbps (typical 4G)
          cpuSlowdownMultiplier: 4, // Mid-tier mobile device
        },
      },
    },
    assert: {
      assertions: {
        // ============================================
        // CATEGORY SCORES
        // ============================================
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // ============================================
        // CORE WEB VITALS - Google's "good" thresholds
        // ============================================
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],

        // ============================================
        // ADDITIONAL PERFORMANCE METRICS
        // ============================================
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "speed-index": ["warn", { maxNumericValue: 3400 }],
        "interactive": ["warn", { maxNumericValue: 5000 }],

        // ============================================
        // RESOURCE OPTIMIZATION
        // ============================================
        "unused-javascript": ["warn", { maxNumericValue: 150000 }],
        "unused-css-rules": "warn",
        "uses-optimized-images": "warn",
        "uses-responsive-images": "warn",
        "modern-image-formats": "warn", // Replaces deprecated uses-webp-images
        "offscreen-images": "warn",
        "uses-text-compression": "warn",
        "font-display": "warn",
        "render-blocking-resources": "warn",

        // ============================================
        // ACCESSIBILITY
        // ============================================
        "color-contrast": "warn",
        "image-alt": "error",
        "label": "error",
        "link-name": "error",
        "button-name": "error",
        "html-has-lang": "error",
        "document-title": "error",
        "valid-lang": "error",
        "tabindex": "warn",
        "heading-order": "warn",
        "bypass": "warn",

        // ============================================
        // SEO
        // ============================================
        "meta-description": "warn",
        "robots-txt": "warn",
        "crawlable-anchors": "warn",
        "viewport": "error",
        "http-status-code": "error",

        // ============================================
        // SECURITY & BEST PRACTICES (Production)
        // ============================================
        "is-on-https": "error", // MUST have HTTPS in production
        "csp-xss": "warn",
        "no-document-write": "warn",
        "uses-http2": "warn", // Should use HTTP/2 in production
        "redirects-http": "warn", // HTTP should redirect to HTTPS
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
