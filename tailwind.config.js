/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: 'hsl(221.2, 83.2%, 95.9%)',
          100: 'hsl(221.2, 83.2%, 91.2%)',
          200: 'hsl(221.2, 83.2%, 86.4%)',
          300: 'hsl(221.2, 83.2%, 77.8%)',
          400: 'hsl(221.2, 83.2%, 65.1%)',
          500: 'hsl(221.2, 83.2%, 53.3%)',
          600: 'hsl(221.2, 83.2%, 46.7%)',
          700: 'hsl(221.2, 83.2%, 40.0%)',
          800: 'hsl(221.2, 83.2%, 33.3%)',
          900: 'hsl(221.2, 83.2%, 26.7%)',
          950: 'hsl(221.2, 83.2%, 13.3%)',
          DEFAULT: 'hsl(221.2, 83.2%, 53.3%)',
        },

        // Semantic colors
        success: {
          50: 'hsl(142.1, 76.2%, 95.0%)',
          100: 'hsl(141.5, 84.5%, 88.5%)',
          500: 'hsl(142.1, 70.6%, 45.3%)',
          900: 'hsl(144.3, 80.4%, 10.0%)',
          DEFAULT: 'hsl(142.1, 70.6%, 45.3%)',
        },
        warning: {
          50: 'hsl(48.5, 96.6%, 95.0%)',
          100: 'hsl(48.8, 96.6%, 88.8%)',
          500: 'hsl(48.3, 96.0%, 50.0%)',
          900: 'hsl(32.1, 92.0%, 23.5%)',
          DEFAULT: 'hsl(48.3, 96.0%, 50.0%)',
        },
        error: {
          50: 'hsl(0, 85.7%, 97.3%)',
          100: 'hsl(0, 93.3%, 94.1%)',
          500: 'hsl(0, 84.2%, 60.2%)',
          900: 'hsl(0, 73.7%, 20.0%)',
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
        },
        info: {
          50: 'hsl(210, 100%, 97.5%)',
          100: 'hsl(210, 100%, 95.1%)',
          500: 'hsl(210, 100%, 50.0%)',
          900: 'hsl(210, 100%, 20.0%)',
          DEFAULT: 'hsl(210, 100%, 50.0%)',
        },

        // Theme-based colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        
        // Gradient colors for modern design
        'gradient-primary': 'from-blue-600 via-purple-600 to-pink-600',
        'gradient-secondary': 'from-green-500 to-blue-500',
        'gradient-warning': 'from-yellow-500 to-red-500',
        'gradient-success': 'from-green-500 to-emerald-500',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
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
        "pulse": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in": {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in": "slide-in 0.2s ease-out",
      },
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [
    // Add plugins here if needed
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
          },
        },
        // Container query utilities
        '.container-type-inline-size': {
          'container-type': 'inline-size',
        },
        '.container-type-size': {
          'container-type': 'size',
        },
        '.container-type-normal': {
          'container-type': 'normal',
        },
      }
      addUtilities(newUtilities)
    },
    // Add container queries plugin
    require('@tailwindcss/container-queries'),
  ],
};