module.exports = {
  content: [
    "./templates/**/*.html",
    "./content/**/*.{md,html}",
    "!./content/_bak/**/*",
    "./static/js/**/*.js",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        theme: "var(--theme-bg)",
        surface: "var(--surface-bg)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border-color)",
        text: "var(--text-main)",
        muted: "var(--text-muted)",
        content: "var(--content-text)",
        code: "var(--code-bg)",
        highlight: "var(--highlight-bg)",
        accent: "var(--accent-color)",
        "accent-strong": "var(--accent-strong)",
        "accent-soft": "var(--accent-soft)",
        "surface-strong": "var(--surface-strong)",
        "focus-ring": "var(--focus-ring)",
        "md-primary": "var(--md-primary)",
        "md-on-primary": "var(--md-on-primary)",
        "md-primary-container": "var(--md-primary-container)",
        "md-on-primary-container": "var(--md-on-primary-container)",
        "md-surface": "var(--md-surface)",
        "md-surface-container": "var(--md-surface-container)",
        "md-outline": "var(--md-outline)",
        "md-outline-variant": "var(--md-outline-variant)",
      },
      fontFamily: {
        sans: [
          "Roboto",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "Arial",
          "Ubuntu",
          "sans-serif",
        ],
      },
      spacing: {
        gap: "1.5rem",
        "gap-mobile": "0.875rem",
        "content-gap": "1.25rem",
      },
      maxWidth: {
        nav: "64rem",
        main: "45rem",
      },
      borderRadius: {
        theme: "var(--shape-md)",
        "md-xs": "var(--shape-xs)",
        "md-sm": "var(--shape-sm)",
        "md-md": "var(--shape-md)",
        "md-lg": "var(--shape-lg)",
        "md-xl": "var(--shape-xl)",
        "md-full": "var(--shape-full)",
      },
      boxShadow: {
        card: "var(--elevation-1)",
        "elevation-1": "var(--elevation-1)",
        "elevation-2": "var(--elevation-2)",
        "elevation-3": "var(--elevation-3)",
        "elevation-4": "var(--elevation-4)",
        "elevation-5": "var(--elevation-5)",
      },
      transitionTimingFunction: {
        theme: "var(--motion-emphasized)",
        "md-standard": "var(--motion-standard)",
        "md-emphasized": "var(--motion-emphasized)",
        "md-decelerate": "var(--motion-emphasized-decelerate)",
      },
      transitionDuration: {
        "md-short": "200ms",
        "md-medium": "300ms",
        "md-long": "450ms",
      },
      keyframes: {
        "hero-rise": {
          "0%": {
            opacity: "0",
            transform: "translateY(1.2rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "soft-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(1rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "hero-rise": "hero-rise 450ms cubic-bezier(0.05, 0.7, 0.1, 1) both",
        "soft-fade": "soft-fade 400ms cubic-bezier(0.05, 0.7, 0.1, 1) both",
      },
    },
  },
  plugins: [],
};
