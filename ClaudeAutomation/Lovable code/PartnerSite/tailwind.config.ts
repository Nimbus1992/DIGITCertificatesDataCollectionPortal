import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        eg: '#0E165D',
        'eg2': '#1C2D8F',
        'eg-light': '#E6E7F5',
        'eg-mid': '#B3B9E8',
        'eg-accent': '#FFA011',
        'eg-accent-lt': '#FAC896',
        'eg-accent-bg': '#FFF4EB',
        'eg-cyan': '#00B5CA',
        'eg-cyan-lt': '#90dfe8',
        'eg-slate': '#1C2B3A',
        'eg-muted': '#5E7080',
        'eg-hint': '#8FA4B4',
        'eg-surface': '#F2F2F2',
        'eg-apple-gray': '#f5f5f7',
        'eg-dark': '#060c20',
      },
      fontFamily: {
        sans: ['"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Roboto Condensed"', '"Roboto"', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [animate],
} satisfies Config
