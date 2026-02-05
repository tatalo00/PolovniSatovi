// Desktop configuration for localhost testing
// Uses faster connection and larger viewport

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        // Desktop viewport
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        },
        throttling: {
          // Simulate good desktop connection
          rttMs: 40,
          throughputKbps: 10240, // 10 Mbps
          cpuSlowdownMultiplier: 1,
        },
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      assertions: {
        // Higher thresholds for desktop
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Core Web Vitals - stricter for desktop
        "largest-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],

        // Additional metrics
        "first-contentful-paint": ["warn", { maxNumericValue: 1500 }],
        "speed-index": ["warn", { maxNumericValue: 2500 }],
        "interactive": ["warn", { maxNumericValue: 3500 }],

        // Accessibility
        "color-contrast": "error",
        "image-alt": "error",
        "label": "error",
        "link-name": "error",
        "document-title": "error",

        // Skip HTTPS for localhost
        "is-on-https": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
