/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './wordpress/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // Saas palette — mirrors examples/themes/gcb-saas/theme.json in
      // the gcb-lite plugin so the React frontend and the WordPress block
      // editor use the same colour tokens. If you add a colour here, add
      // it to the theme too (and vice versa) — otherwise the editor's
      // colour picker shows values the frontend can't render.
      colors: {
        saas: {
          primary:   '#5956E9',
          'blue-shade': '#6865FF',
          link:      '#2522BA',
          'accent-1': '#FFDC60', // yellow
          'accent-2': '#FAB8C4', // pink
          rose:      '#C75C6F',
          mabel:     '#DBF8FF',
          fog:       '#DBDEFF',
          peach:     '#FFEDDC',
          light:     '#ECF2F6',
          mercury:   '#E5E5E5',
          ghost:     '#C7C7D5',
          'gray-1':  '#757589',
          'gray-2':  '#999FAE',
          'ship-gray': '#42424A',
          body:      '#525260',
          'text-dark': '#292930',
          dark:      '#27272E',
        },
      },
      backgroundImage: {
        'saas-gradient-blue': 'linear-gradient(145.92deg, #5956E9 20.18%, #9991FF 76.9%)',
        'saas-gradient-accent': 'linear-gradient(180deg, #FAB8C4 0%, #FFEDF0 100%)',
        'saas-gradient-dark': 'linear-gradient(180deg, #27272E 0%, #303035 100%)',
      },
      fontFamily: {
        // var() refs filled by next/font in app/layout.jsx so we get the
        // Google Fonts download + the font-display: swap behaviour for free.
        sans:    ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
