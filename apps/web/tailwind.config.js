/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)']
      },
      // Semantic colors backed by CSS variables in app.css (light/dark)
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        ink: token('ink'),
        body: token('body'),
        muted: token('muted'),
        faint: token('faint'),
        line: token('line'),
        accent: {
          DEFAULT: token('accent'),
          fg: token('accent-fg')
        },
        warn: token('warn')
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            'code::before': { content: '""' },
            'code::after': { content: '""' }
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
