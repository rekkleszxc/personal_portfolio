/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#090d16",
        surface: "#0e1524",
        ink: "#f1f5f9",
        muted: "#9aa7ba",
        accent: { DEFAULT: "#22d3ee", ink: "#04141a" },
        danger: "#fca5a5",
        success: "#6ee7b7",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: { glow: "0 0 32px -8px rgba(34,211,238,.55)" },
    },
  },
  plugins: [],
};
