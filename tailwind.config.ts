import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // JayField Brand Colors — kept hard-coded so brand stays the same
        // across light/dark. Only neutrals (background, surface, text, border,
        // muted) flip with the theme via CSS variables defined in globals.css.
        primary: {
          DEFAULT: "#1B5E20",
          light: "#2E7D32",
          dark: "#0D3B12",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#212121",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#4CAF50",
          foreground: "#FFFFFF",
        },
        cta: {
          DEFAULT: "#FF6D00",
          hover: "#E65100",
          foreground: "#FFFFFF",
        },

        // Theme-aware neutrals — driven by CSS variables in globals.css.
        // Use `rgb(var(...) / <alpha-value>)` so opacity modifiers like
        // `bg-surface/80` keep working.
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
        },

        // Status colors — kept fixed for instant recognition across themes.
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.07)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
        xl: "0 20px 25px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
