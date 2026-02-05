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
        // Mobile-first testing (most users browse on mobile)
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
        // Skip audits that don't apply to localhost
        skipAudits: [
          "uses-http2", // localhost doesn't use HTTP/2
        ],
      },
    },
    assert: {
      assertions: {
        // ============================================
        // CATEGORY SCORES (0-1 scale)
        // ============================================
        "categories:performance": ["warn", { minScore: 0.7 }], // Lower for mobile throttling
        "categories:accessibility": ["error", { minScore: 0.9 }], // WCAG AA compliance
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // ============================================
        // CORE WEB VITALS - Critical UX Metrics
        // ============================================
        // LCP: Largest Contentful Paint - "When does main content appear?"
        // Note: Mobile throttling (4x CPU) increases LCP significantly
        // Using "warn" for mobile; desktop config has stricter thresholds
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],

        // CLS: Cumulative Layout Shift - "Does the page jump around?"
        // Good: <0.1, Needs improvement: 0.1-0.25, Poor: >0.25
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],

        // TBT: Total Blocking Time (proxy for INP) - "Is the page responsive?"
        // Good: <200ms, Needs improvement: 200-600ms, Poor: >600ms
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],

        // ============================================
        // ADDITIONAL PERFORMANCE METRICS
        // ============================================
        // FCP: First Contentful Paint - "When does something appear?"
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],

        // Speed Index - "How quickly does content visually populate?"
        "speed-index": ["warn", { maxNumericValue: 3400 }],

        // TTI: Time to Interactive - "When is the page fully usable?"
        "interactive": ["warn", { maxNumericValue: 5000 }],

        // ============================================
        // RESOURCE OPTIMIZATION
        // ============================================
        // Unused JavaScript should be minimized for faster load
        "unused-javascript": ["warn", { maxNumericValue: 150000 }], // 150KB max

        // Unused CSS wastes bandwidth
        "unused-css-rules": "warn",

        // Image optimization is critical for performance
        "uses-optimized-images": "warn",
        "uses-responsive-images": "warn",
        "modern-image-formats": "warn", // Replaces deprecated uses-webp-images
        "offscreen-images": "warn", // Lazy load offscreen images

        // Text compression saves bandwidth
        "uses-text-compression": "warn",

        // Font optimization
        "font-display": "warn",

        // Render-blocking resources
        "render-blocking-resources": "warn",

        // ============================================
        // ACCESSIBILITY (Critical for UX)
        // ============================================
        "color-contrast": "error",
        "image-alt": "error",
        "label": "error",
        "link-name": "error",
        "button-name": "error",
        "html-has-lang": "error",
        "document-title": "error",
        "valid-lang": "error",
        "tabindex": "warn",
        "heading-order": "warn",
        "bypass": "warn", // Skip navigation link

        // ============================================
        // SEO ESSENTIALS
        // ============================================
        "meta-description": "warn",
        "robots-txt": "warn",
        "crawlable-anchors": "warn",
        "viewport": "error",
        "http-status-code": "error",

        // ============================================
        // SECURITY & BEST PRACTICES
        // ============================================
        "is-on-https": "off", // localhost won't have HTTPS
        "csp-xss": "off", // CSP requires implementation - tracked separately
        "no-document-write": "warn",
        "geolocation-on-start": "warn",
        "notification-on-start": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
