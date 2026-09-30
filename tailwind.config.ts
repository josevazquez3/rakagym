import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        ember: "var(--ember)",
        green: {
          DEFAULT: "var(--green)",
          dark: "var(--green-dark)",
        },
        foreground: "var(--foreground)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        condensed: ["var(--font-barlow)", "Arial Narrow", "sans-serif"],
        marker: ["var(--font-marker)", "cursive"],
      },
      backgroundImage: {
        "brand-gradient": "var(--brand-gradient)",
      },
      boxShadow: {
        gold: "0 0 24px color-mix(in srgb, var(--gold) 28%, transparent)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
