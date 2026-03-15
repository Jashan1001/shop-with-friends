/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['General Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        cream: '#FFFEF0',
        yellow: '#FFD600',
        lime: '#C6FF00',
        coral: '#FF5252',
        blue: '#2979FF',
        purple: '#7B2FBE',
        black: '#0A0A0A',
        muted: '#6B7280',
      },
      boxShadow: {
        brut: '4px 4px 0 #0A0A0A',
        'brut-lg': '6px 6px 0 #0A0A0A',
        'brut-xl': '8px 8px 0 #0A0A0A',
        coral: '6px 6px 0 #FF5252',
        blue: '0 0 0 2px #2979FF',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      },
    },
  },
  plugins: [],
};