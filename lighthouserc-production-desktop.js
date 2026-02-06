// Production desktop configuration
// Tests real-world desktop experience with good connection

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 5, // More runs for production accuracy
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
      },
    },
    assert: {
      assertions: {
        // ============================================
        // CATEGORY SCORES - Higher for desktop
        // ============================================
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // ============================================
        // CORE WEB VITALS - Stricter for desktop
        // ============================================
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],

        // ============================================
        // ADDITIONAL PERFORMANCE METRICS
        // ============================================
        "first-contentful-paint": ["warn", { maxNumericValue: 1500 }],
        "speed-index": ["warn", { maxNumericValue: 2500 }],
        "interactive": ["warn", { maxNumericValue: 3500 }],

        // ============================================
        // RESOURCE OPTIMIZATION
        // ============================================
        "unused-javascript": ["warn", { maxNumericValue: 100000 }], // Stricter for desktop
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
        "is-on-https": "error",
        "csp-xss": "warn",
        "no-document-write": "warn",
        "uses-http2": "warn",
        "redirects-http": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
