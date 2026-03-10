import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--bg)",
        subtle: "var(--bg-subtle)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        brand: "var(--brand)"
      },
      boxShadow: {
        card: "0 8px 24px color-mix(in srgb, #000 75%, transparent)"
      }
    }
  },
  plugins: []
};

export default config;
