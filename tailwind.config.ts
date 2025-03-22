import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"
import typography from "@tailwindcss/typography"

const config = {
  darkMode: "class",
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
        window: {
          DEFAULT: "hsl(var(--window))",
          foreground: "hsl(var(--window-foreground))",
        },
        taskbar: {
          DEFAULT: "hsl(var(--taskbar))",
          foreground: "hsl(var(--taskbar-foreground))",
        },
        desktop: {
          DEFAULT: "hsl(var(--desktop))",
          foreground: "hsl(var(--desktop-foreground))",
        },
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
        "window-minimize": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0" },
        },
        "window-maximize": {
          "0%": { transform: "scale(1)", top: "var(--window-top)", left: "var(--window-left)" },
          "100%": { transform: "scale(1)", top: "0", left: "0" },
        },
        "taskbar-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2px)" },
        },
        "desktop-icon-hover": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        "start-menu-open": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "start-menu-close": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "window-minimize": "window-minimize 0.2s ease-out",
        "window-maximize": "window-maximize 0.2s ease-out",
        "taskbar-hover": "taskbar-hover 0.2s ease-out",
        "desktop-icon-hover": "desktop-icon-hover 0.2s ease-out",
        "start-menu-open": "start-menu-open 0.2s ease-out",
        "start-menu-close": "start-menu-close 0.2s ease-out",
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        'window': '10',
        'taskbar': '20',
        'start-menu': '30',
        'context-menu': '40',
        'modal': '50',
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config

export default config 