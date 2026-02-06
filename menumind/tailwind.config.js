/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        safe: { DEFAULT: "#22C55E", light: "#DCFCE7", dark: "#166534" },
        caution: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#92400E" },
        avoid: { DEFAULT: "#EF4444", light: "#FEE2E2", dark: "#991B1B" },
        brand: { DEFAULT: "#10B981", light: "#D1FAE5", dark: "#065F46" },
      },
    },
  },
  plugins: [],
};
