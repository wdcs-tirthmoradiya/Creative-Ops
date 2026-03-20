/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:      '#534AB7',
        'brand-dark':'#3C3489',
        'brand-light':'#EEEDFE',
        fe:         '#185FA5',
        be:         '#0F6E56',
        surface:    '#18181f',
        'surface-2':'#1f1f28',
        'surface-3':'#26262f',
        border:     '#2a2a35',
        'border-2': '#3a3a45',
        muted:      '#888780',
        'text-primary':'#e8e6df',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
