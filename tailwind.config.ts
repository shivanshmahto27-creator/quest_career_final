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
        canvas: {
          DEFAULT: "#050607",
          surface: "#0B0D0F",
          elevated: "#101316",
        },
        border: {
          subtle: "#1B1E21",
          strong: "#2A2F33",
        },
        cq: {
          primary: "#F2F2EE",
          secondary: "#85898F",
          muted: "#5D6268",
          accent: "#D8FF5A",
          info: "#8EA7FF",
          success: "#8DDC9A",
          warning: "#E7C85C",
          danger: "#FF7C7C",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
