/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        chad: {
          black:   "#0A0A0A",
          dark:    "#111111",
          card:    "#1A1A1A",
          border:  "#2A2A2A",
          green:   "#00FF88",
          yellow:  "#FFD700",
          red:     "#FF4444",
          muted:   "#666666",
          white:   "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "scroll-left":  "scrollLeft 30s linear infinite",
        "scroll-right": "scrollRight 30s linear infinite",
        "pulse-green":  "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        scrollLeft: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scrollRight: {
          "0%":   { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulseGreen: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}