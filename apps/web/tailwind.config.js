/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#E63946",             // Crimson Red (Brand Palette)
        "secondary": "#F3722C",           // Warm Orange (Brand Palette)
        "tertiary": "#F9A826",            // Golden Amber (Brand Palette)
        "neutral-dark": "#2B2B2B",        // Charcoal Dark (Brand Palette)
        "surface": "#FAF8F7",             // Warm Soft Surface
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F5F2F0",
        "surface-container": "#EFEBE8",
        "surface-variant": "#E8E3DF",
        "on-surface": "#2B2B2B",
        "on-surface-variant": "#595250",
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        "on-tertiary": "#2B2B2B",
        "outline": "#D1C9C5",
        "outline-variant": "#E6DFDC",
        "error": "#D90429",
        "error-container": "#FFD8DC",
        "surface-tint": "#D62839",
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "8px",
        "lg": "32px",
        "sm": "16px",
        "base": "4px",
        "gutter": "24px",
        "xl": "48px",
        "md": "24px",
        "container-max": "1200px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "sans": ["Poppins", "sans-serif"],
        "label-md": ["Poppins", "sans-serif"],
        "headline-lg": ["Poppins", "sans-serif"],
        "body-lg": ["Poppins", "sans-serif"],
        "label-lg": ["Poppins", "sans-serif"],
        "title-lg": ["Poppins", "sans-serif"],
        "body-md": ["Poppins", "sans-serif"],
        "headline-md": ["Poppins", "sans-serif"],
      },
      maxWidth: {
        "sm": "24rem",
        "md": "28rem",
        "lg": "32rem",
        "xl": "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "container-max": "1200px"
      }
    }
  },
  plugins: [],
}
