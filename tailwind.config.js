/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      ...colors,
      error: '#850000',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-space_grotesk)'],
      },
    },
    animation: {
      cursor: 'cursor .6s linear infinite alternate',
    },
    keyframes: {
      cursor: {
        '0%, 40%': { opacity: 1 },
        '65%, 100%': { opacity: 0 },
      },
    },
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      defaultFlavour: 'mocha',
    }),
  ],
}
