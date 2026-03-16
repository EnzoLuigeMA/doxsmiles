import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dox: {
          red: "#CC0000",
          "red-dark": "#880000",
          black: "#0A0A0A",
          surface: "#141414",
          "surface-2": "#1E1E1E",
          white: "#F0F0F0",
          muted: "#888888",
          border: "#2A2A2A",
        },
        level: {
          bronze: "#cd7f32",
          "bronze-bg": "#3a1f0a",
          prata: "#c0c0c0",
          "prata-bg": "#1a1a1a",
          ouro: "#ffd700",
          "ouro-bg": "#2a1f00",
          elite: "#cc0000",
          "elite-bg": "#2a0505",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
