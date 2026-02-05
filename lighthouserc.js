module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      // URLs provided by workflow or use defaults for local testing
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/listings",
        "http://localhost:3000/auth/signin",
      ],
      settings: {
        // Test both desktop and mobile viewports
        preset: "desktop",
        throttling: {
          // Simulate average connection (not too fast)
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Skip audits that require auth or cause flakiness
        skipAudits: [
          "uses-http2", // localhost doesn't use HTTP/2
        ],
      },
    },
    assert: {
      assertions: {
        // Category scores (0-1 scale)
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Core Web Vitals (strict thresholds based on Google's "good" ratings)
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],

        // Interaction to Next Paint (new Core Web Vital)
        "interactive": ["warn", { maxNumericValue: 3800 }],

        // Resource optimization
        "unused-javascript": ["warn", { maxNumericValue: 100000 }], // 100KB max unused JS
        "uses-optimized-images": "warn",
        "uses-webp-images": "warn",
        "uses-responsive-images": "warn",

        // Accessibility (critical)
        "color-contrast": "error",
        "image-alt": "error",
        "label": "error",
        "link-name": "error",

        // SEO essentials
        "document-title": "error",
        "meta-description": "warn",
        "robots-txt": "warn",

        // Security
        "is-on-https": "off", // localhost won't have HTTPS
        "no-vulnerable-libraries": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
