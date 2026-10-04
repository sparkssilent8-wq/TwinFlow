/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        petro: {
          950: '#060b13',
          900: '#0c1626',
          850: '#111f36',
          800: '#172a48',
          700: '#233d66',
          600: '#325488',
          cyan: '#00d2ff',
          neon: '#0df',
          amber: '#ffaa00',
          flame: '#ff5500',
          danger: '#ff3344',
          success: '#10b981'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'steam': 'steam 2.5s ease-out infinite',
      },
      keyframes: {
        steam: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-20px) scale(1.6)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
