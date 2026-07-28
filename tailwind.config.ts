import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#FFF7F2",
          100: "#FFEDE1",
          300: "#FFC9A8",
          500: "#FF7A45",
          600: "#F2611F",
          700: "#C94E17",
        },
        accent: {
          pink: "#FF6FA5",
          lilac: "#B79CED",
          mint: "#7FE0C4",
          yellow: "#FFD75E",
        },
        sale: {
          price: "#E0262E",
          strike: "#9CA3AF",
        },
        neutral: {
          bg: "#FFFCF9",
          surface: "#FFFFFF",
          border: "#F0E4DA",
          text: "#2B2320",
          muted: "#8A7F76",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
