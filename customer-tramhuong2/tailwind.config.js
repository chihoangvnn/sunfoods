/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'forest-green': '#2D5F3E',
        'sunset-orange': '#F4A742',
        'lime-green': '#8BC34A',
        'gold': '#D4AF37',
        // Trầm Hương 2 Store colors - Teal Luxury Theme
        'tramhuong-primary': '#004d40', // Dark teal primary
        'tramhuong-secondary': '#222222', // Đen mờ
        'tramhuong-accent': '#26a69a', // Teal accent
        'tramhuong-highlight': '#80cbc4', // Light teal highlight
        'tramhuong-cta': '#004d40', // Dark teal CTA
        'tramhuong-bg': '#F5F5DC', // Trắng ngà
        'tramhuong-text': '#444444', // Xám than
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      addUtilities({
        '.will-change-transform': {
          'will-change': 'transform',
        },
        '.will-change-blur': {
          'will-change': 'filter',
        },
        '.will-change-opacity': {
          'will-change': 'opacity',
        },
        '.gpu-accelerate': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
        },
      })
    },
  ],
}