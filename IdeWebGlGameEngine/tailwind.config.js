/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx,html}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0b0f17', soft: '#101624', softer: '#0d1320' },
        panel: { DEFAULT: '#111827', soft: '#0f172a' },
        brand: { DEFAULT: '#38bdf8', fg: '#a5f3fc' },
        pin: {
          bool: '#ef4444',
          float: '#9ca3af',
          int: '#22c55e',
          string: '#60a5fa',
          time: '#ffffff',
          object: '#fb923c',
          audio: '#a78bfa',
          video: '#fef9c3',
          vector: '#7c3aed',
        },
      },
      boxShadow: {
        soft: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
}
